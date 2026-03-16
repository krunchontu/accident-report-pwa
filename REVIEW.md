# Implementation Review — SG Accident Kaki

**Reviewed:** 2026-03-16
**Spec version:** v1.0 (PROJECT SPECIFICATION: SG Accident Kaki)
**Build status:** Passes (`tsc --noEmit` clean, `vite build` succeeds)

---

## Critical Bugs — FIXED

### BUG-001: Resuming in-progress incident causes infinite redirect — FIXED
- **File:** `src/components/HomeScreen.tsx`
- **Severity:** Critical
- **Description:** `handleStartAccident` and the in-progress banner navigated to `/accident/triage` without loading the incident into `useAccidentStore`. After a page refresh, `currentIncident` was `null`, causing TriageScreen to redirect back to `/` in an infinite loop.
- **Fix applied:** Added `resumeIncident()` that calls `loadIncident(inProgressIncident.id)` before navigating. Both the banner and the red button now use this function.

### BUG-002: Foreign vehicle insurance type values mismatch — FIXED
- **File:** `src/components/accident/OtherPartyDetails.tsx`
- **Severity:** Critical (data corruption)
- **Description:** `<option>` values `"sg-extension"`, `"border"`, `"separate-sg"` didn't match `ForeignVehicleDetails.insuranceType` union `"my_sg_extension"`, `"border_insurance"`, `"separate_sg_policy"`. The `as` cast masked this at compile time, silently persisting invalid values.
- **Fix applied:** Aligned `<option value>` strings to match the TypeScript union type exactly.

### BUG-003: SignaturePad doesn't restore saved signatures on re-mount — FIXED
- **File:** `src/components/accident/SignaturePad.tsx`
- **Severity:** Critical
- **Description:** `useEffect` for drawing saved signatures used `[]` dependency array but read `value` from props. Signatures were never restored when the component remounted or when data loaded asynchronously from IndexedDB.
- **Fix applied:** Changed dependency array from `[]` to `[value]`.

---

## Moderate Bugs — FIXED

### BUG-004: Sketch template change silently wipes user drawing — FIXED
- **File:** `src/components/accident/AccidentSketch.tsx`
- **Severity:** Moderate
- **Description:** Changing the template calls `initCanvas` which clears the canvas. If the user hasn't navigated away, their drawing is lost without a confirmation dialog. Spec requires confirmation for destructive actions like "clear sketch."
- **Fix applied:** Added `hasDrawn` state flag set on `startDraw`. Template switch and Clear button now show a `window.confirm` dialog before proceeding when the user has drawn on the canvas.

### BUG-005: TriageScreen useEffect missing dependencies — FIXED
- **File:** `src/components/accident/TriageScreen.tsx`
- **Severity:** Low
- **Description:** `geo.getCurrentPosition` and `updateLocation` were missing from effect dependency arrays. Worked by coincidence (stable refs from `useCallback`) but violated React rules.
- **Fix applied:** Added `geo.getCurrentPosition` and `updateLocation` to their respective `useEffect` dependency arrays.

### BUG-006: OtherPartyDetails activePartyIdx can briefly reference undefined — FIXED
- **File:** `src/components/accident/OtherPartyDetails.tsx`
- **Severity:** Low
- **Description:** `setActivePartyIdx(parties.length)` fired before the store update propagated, briefly causing `parties[activePartyIdx]` to be `undefined`. The `parties[0]` fallback prevented a crash but the UI flickered to the wrong party.
- **Fix applied:** Removed inline `setActivePartyIdx` from the click handler. Added a `useEffect` with a `prevLengthRef` that switches to the new party only after `parties.length` has actually increased in the store.

### BUG-007: Incident `photos` array is always empty (dead field) — FIXED
- **File:** `src/types/incident.ts`, `src/store/useAccidentStore.ts`
- **Severity:** Low
- **Description:** `Incident.photos: IncidentPhoto[]` was initialized as `[]` and never populated. Photos are stored in a separate Dexie table via `db.photos`. This field bloated IndexedDB incident records.
- **Fix applied:** Removed the `photos` property from the `Incident` interface and from `createNewIncident()`. No consumers referenced this field.

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

## Spec Deviations — FIXED

### SPEC-001: No differentiated witness/passenger flow — FIXED
- **File:** `src/components/HomeScreen.tsx`, `src/components/accident/WitnessReportFlow.tsx` (new)
- **Spec:** "I'm a Witness / Passenger" button should have a reduced flow (what they saw, contact details, photo capture only).
- **Fix applied:** Created `WitnessReportFlow` component with a 3-step flow (statement + contact, scene photos, done). HomeScreen witness button now routes to `/witness` instead of the full accident flow. Route added in `App.tsx`.

### SPEC-002: No voice-to-text (SpeechRecognition API)
- **Spec:** Scene description and witness statement fields should have a microphone icon for voice-to-text.
- **Actual:** Not implemented.

### SPEC-003: No draggable vehicle icons in AccidentSketch — FIXED
- **File:** `src/components/accident/AccidentSketch.tsx`
- **Spec:** "Drag-and-drop vehicle icons (2 car shapes), draw arrows, tap to place 'X' marker."
- **Fix applied:** Added a tool palette with 5 modes: Pen (freehand), Car A (blue), Car B (red), Arrow (drag to draw), and Impact X marker. Vehicle shapes are placed by tapping the canvas; arrows are drawn by dragging. All tools integrate with the existing undo/history system.

### SPEC-004: Setup wizard doesn't auto-save per step — FIXED
- **File:** `src/components/setup/SetupWizard.tsx`
- **Spec:** "Every field change persists to IndexedDB immediately. If the app crashes, data is preserved."
- **Fix applied:** Added `saveCurrentStep()` that persists profile, vehicle, insurance, and driver data to IndexedDB incrementally as the user advances through each wizard step.

### SPEC-005: No `sleepDeprived` eligibility question — FIXED
- **Files:** `src/components/accident/EligibilityCheck.tsx`, `src/constants/eligibilityRules.ts`
- **Spec:** `EligibilityCheck` type includes `sleepDeprived`, but no question or rule exists for it.
- **Fix applied:** Added "Were you sleep-deprived (less than 6 hours in 24h)?" question under Driver Fitness category, with an amber-severity rule ("Sleep deprivation may constitute negligence").

### SPEC-006: `useCamera` cancel has no timeout — FIXED
- **File:** `src/hooks/useCamera.ts`
- **Description:** If the user opens the file picker and cancels, `onchange` may not fire on iOS Safari. The Promise hangs indefinitely.
- **Fix applied:** Added a `window.focus` listener that resolves the Promise as `null` (cancel) after a 500ms delay when the window regains focus with no file selected.

### SPEC-007: `EligibilityCheck` unsafe type assertion — FIXED
- **File:** `src/components/accident/EligibilityCheck.tsx`
- **Description:** `elig[q.field] as boolean | null` is unsafe for fields typed as `number | null` or `string`. Works only because the QUESTIONS array currently excludes non-boolean fields, but is fragile.
- **Fix applied:** Introduced `BooleanFields<T>` utility type that constrains `Question.field` to only keys of `EligibilityCheckType` whose value is `boolean | null`. Removed the unsafe `as boolean | null` cast — the type system now guarantees correctness.

---

## Documentation Issues — FIXED

### DOC-001: README says "10-step wizard" — UI shows 8 steps — FIXED
- **File:** `README.md`
- **Description:** README listed "10-step wizard" but UI shows 8 numbered steps (Triage and Emergency are pre-wizard entry screens).
- **Fix applied:** Corrected to "8-step wizard" with Triage & Emergency described as entry screens.

### DOC-002: Duplicate PWA manifest — FIXED
- **Files:** `public/manifest.json` (removed), `vite.config.ts` manifest property (kept)
- **Description:** PWA manifest was defined in both `public/manifest.json` and `vite.config.ts`. `vite-plugin-pwa` generates its own from the config, so the static file was redundant and could cause conflicts.
- **Fix applied:** Removed `public/manifest.json`. Single source of truth is now `vite.config.ts`.

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
