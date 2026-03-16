# Implementation Review — SG Accident Kaki

**Reviewed:** 2026-03-16
**Spec version:** v1.0 (PROJECT SPECIFICATION: SG Accident Kaki)
**Build status:** Passes (`tsc --noEmit` clean, `vite build` succeeds)

---

## Critical Bugs (Must Fix)

### BUG-001: Resuming in-progress incident causes infinite redirect
- **File:** `src/components/HomeScreen.tsx:26-28`
- **Severity:** Critical
- **Description:** When the user clicks "Continue Documenting" (or the yellow in-progress banner), `handleStartAccident` navigates to `/accident/triage` but never loads the existing incident into `useAccidentStore`. After a page refresh, `currentIncident` is `null`. `TriageScreen` checks `!currentIncident` and redirects back to `/`, creating an infinite loop.
- **Fix:** Call `loadIncident(inProgressIncident.id)` before navigating.

### BUG-002: Foreign vehicle insurance type values mismatch
- **File:** `src/components/accident/OtherPartyDetails.tsx:210-215`
- **Severity:** Critical (data corruption)
- **Description:** The `<select>` option values use `"sg-extension"`, `"border"`, `"separate-sg"` but `ForeignVehicleDetails.insuranceType` (in `incident.ts:100`) expects `"my_sg_extension"`, `"border_insurance"`, `"separate_sg_policy"`. The `as` cast masks this at compile time. Wrong values are silently persisted.
- **Fix:** Align `<option value>` strings to match the TypeScript union type.

### BUG-003: SignaturePad doesn't restore saved signatures on re-mount
- **File:** `src/components/accident/SignaturePad.tsx:31`
- **Severity:** Critical
- **Description:** The `useEffect` that draws a saved signature uses `[]` dependency array but reads `value` from props. If data loads asynchronously (common with IndexedDB), the saved signature is never rendered. Navigating back to Summary remounts the component, losing the visual.
- **Fix:** Add `value` to the dependency array.

---

## Moderate Bugs

### BUG-004: Sketch template change silently wipes user drawing
- **File:** `src/components/accident/AccidentSketch.tsx:103-105`
- **Severity:** Moderate
- **Description:** Changing the template calls `initCanvas` which clears the canvas. If the user hasn't navigated away, their drawing is lost without a confirmation dialog. Spec requires confirmation for destructive actions like "clear sketch."
- **Fix:** Add a confirmation prompt before switching templates if the canvas has been drawn on.

### BUG-005: TriageScreen useEffect missing dependencies
- **File:** `src/components/accident/TriageScreen.tsx:12-20`
- **Severity:** Low
- **Description:** `geo.getCurrentPosition` and `updateLocation` are missing from effect dependency arrays. Works by coincidence (stable refs) but violates React rules and suppresses linter warnings.

### BUG-006: OtherPartyDetails activePartyIdx can briefly reference undefined
- **File:** `src/components/accident/OtherPartyDetails.tsx:250`
- **Severity:** Low
- **Description:** `setActivePartyIdx(parties.length)` fires before the store update propagates, briefly causing `parties[activePartyIdx]` to be `undefined`. The `parties[0]` fallback prevents a crash but the UI flickers to the wrong party.

### BUG-007: Incident `photos` array is always empty (dead field)
- **File:** `src/types/incident.ts:30`
- **Severity:** Low
- **Description:** `Incident.photos: IncidentPhoto[]` is initialized as `[]` and never populated. Photos are stored in a separate Dexie table via `db.photos`. This field bloats the IndexedDB incident records.

---

## Performance Issues

### PERF-001: `structuredClone` + IndexedDB write on every keystroke
- **File:** `src/store/useAccidentStore.ts:170`
- **Severity:** Moderate
- **Description:** Every field change triggers `saveToDb()` → `structuredClone(incident)` → `db.incidents.put()`. On target mid-range phones, this means every keystroke triggers a deep clone + IndexedDB transaction.
- **Fix:** Debounce `saveToDb` (e.g., 300ms).

### PERF-002: PDF generation blocks the main thread
- **File:** `src/utils/pdfExport.ts`
- **Severity:** Moderate
- **Description:** Spec says: "Generate in a Web Worker if possible." Current implementation runs on main thread, freezing the UI on slower devices with many photos.

### PERF-003: `shareHelper` chunk is 404KB
- **Severity:** Low
- **Description:** Build output shows `shareHelper-DoU0Zhg1.js` at 404KB (131KB gzip). Likely includes all of jsPDF. Verify tree-shaking and consider tighter code-splitting.

---

## Spec Deviations

### SPEC-001: No differentiated witness/passenger flow
- **File:** `src/components/HomeScreen.tsx:71-73`
- **Spec:** "I'm a Witness / Passenger" button should have a reduced flow (what they saw, contact details, photo capture only).
- **Actual:** Routes to the same full accident flow as the main button.

### SPEC-002: No voice-to-text (SpeechRecognition API)
- **Spec:** Scene description and witness statement fields should have a microphone icon for voice-to-text.
- **Actual:** Not implemented.

### SPEC-003: No draggable vehicle icons in AccidentSketch
- **Spec:** "Drag-and-drop vehicle icons (2 car shapes), draw arrows, tap to place 'X' marker."
- **Actual:** Only freehand drawing on templates. No vehicle icons, arrows, or impact markers.

### SPEC-004: Setup wizard doesn't auto-save per step
- **File:** `src/components/setup/SetupWizard.tsx`
- **Spec:** "Every field change persists to IndexedDB immediately. If the app crashes, data is preserved."
- **Actual:** Only saves on the final `handleFinish`. If the app crashes mid-wizard, all data is lost.

### SPEC-005: No `sleepDeprived` eligibility question
- **File:** `src/components/accident/EligibilityCheck.tsx`
- **Spec:** `EligibilityCheck` type includes `sleepDeprived`, but no question or rule exists for it.

### SPEC-006: `useCamera` cancel has no timeout
- **File:** `src/hooks/useCamera.ts`
- **Description:** If the user opens the file picker and cancels, `onchange` may not fire on iOS Safari. The Promise hangs indefinitely.

### SPEC-007: `EligibilityCheck` unsafe type assertion
- **File:** `src/components/accident/EligibilityCheck.tsx:122`
- **Description:** `elig[q.field] as boolean | null` is unsafe for fields typed as `number | null` or `string`. Works only because the QUESTIONS array currently excludes non-boolean fields, but is fragile.

---

## Documentation Issues

### DOC-001: README says "10-step wizard" — UI shows 8 steps
- **File:** `README.md:122`
- **Description:** README lists 10 items (Triage → Summary). The StepWizard UI shows "Step 1 of 8" through "Step 8 of 8" because Triage and Emergency aren't numbered wizard steps.

### DOC-002: Duplicate PWA manifest
- **Files:** `public/manifest.json` and `vite.config.ts` manifest property
- **Description:** PWA manifest is defined in both places. `vite-plugin-pwa` generates its own manifest from the config, potentially overriding `public/manifest.json`. Should use one source of truth.

---

## What Works Well

- TypeScript types closely match the spec
- Solid offline-first architecture with Dexie
- Good lazy-loading / code-splitting (heavy components are lazy)
- Photo metadata capture with GPS + compass heading
- Eligibility scoring engine is a clean pure function
- UI colour scheme and touch targets follow spec guidelines
- Emergency flow with direct-dial buttons
- Deadline tracking with real-time countdown
- HashRouter for PWA compatibility
- Build passes cleanly, TypeScript compiles without errors
- Custom Tailwind theme tokens match spec colours exactly
- Nominatim reverse geocoding with Workbox caching for offline
