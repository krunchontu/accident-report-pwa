# SG Accident Kaki

A field-ready Progressive Web App for Singapore drivers to document motor vehicle accidents on the spot — step by step, offline-capable, and aligned with local insurance and legal requirements.

## Why This Exists

After a traffic accident in Singapore you have **24 hours** to file a Singapore Accident Statement (SAS) and notify your insurer. Missing details at the scene — other driver's licence, plate photos, witness contacts — can delay or kill your claim. This app turns a stressful roadside situation into a guided checklist so nothing gets missed.

## Features

### Guided Accident Reporting Wizard
- **Triage screen** — are there injuries? Do you need 995 / 999?
- **Emergency flow** — direct-dial buttons for Police (999) and Ambulance (995)
- **Scene details** — date/time, GPS location with reverse-geocoding, weather, road & traffic conditions
- **Photo capture** — 20 prompted shots (4× wide-angle scene, vehicle damage, plates, licences, road markings, dashcam stills, injuries) with GPS and compass metadata stamped on every image; auto-advances to next required prompt after each capture
- **Other party details** — driver info, vehicle registration, insurer & policy, visible damage; full **foreign vehicle** sub-form (nationality, VEP, Autopass, border insurance, Malaysian MIB)
- **Eligibility self-check** — 30 rules (licence validity, insurance status, alcohol/drugs, named driver, vehicle mods, etc.) scored as green / amber / red with plain-English consequences; auto-populates answers from your saved profile
- **Witness capture** — name, contact, free-text statement
- **Accident sketch** — canvas drawing tool with vehicle icons (Car A/B), directional arrows, impact X markers, and freehand pen
- **Injury & passenger log** — seatbelt/child-seat status, hospital name, per-passenger injury notes
- **Summary & signatures** — review all data, capture driver + other-party signatures

### Deadline Tracker
Countdown timers for every post-accident obligation:
| Deadline | Window |
|---|---|
| Call ambulance (if injuries) | Immediately |
| Call police (if required) | Immediately |
| File SAS at GIA portal | 24 hours |
| Lodge Traffic Police report | 24 hours |
| Notify insurer | 24 hours |
| Medical check-up | 72 hours |
| Visit approved workshop | 72 hours |
| Submit all documents to insurer | 30 days |

### Records & Export
- View past incidents with eligibility badges (green/amber/red)
- Full incident detail view with all captured data
- **PDF export** — generates a multi-page report (scene, photos, other party, eligibility, witnesses, sketch, signatures)
- **Share** — Web Share API integration for sending the PDF

### Reference
- Do's and Don'ts quick guide
- Emergency numbers & useful links (Police, SCDF, GIA, LTA, FIDReC, MIB Singapore, Malaysian MMIB)

### Offline-First PWA
- Installable on home screen (standalone, portrait)
- Service Worker with Workbox — all assets cached, Nominatim geocoding cached for 7 days
- All data stored locally in **IndexedDB** via Dexie (no server, no account needed)
- Offline status indicator in the UI
- Resume in-progress incident to the exact step you left off
- Setup wizard auto-saves on every field change (debounced)
- Input validation for NRIC/FIN, SG phone numbers, email, and vehicle registration
- Root error boundary prevents white-screen crashes

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 (with Immer) |
| Local DB | Dexie (IndexedDB) |
| PDF | jsPDF + html2canvas |
| Icons | Lucide React |
| Routing | React Router 7 |
| PWA | vite-plugin-pwa (Workbox) |

## Project Structure

```
src/
├── components/
│   ├── accident/          # Wizard steps (Triage → Summary)
│   │   ├── TriageScreen       — injury check, emergency routing
│   │   ├── EmergencyFlow      — 995/999 direct-dial
│   │   ├── SceneDetails       — location, weather, road conditions
│   │   ├── PhotoCapture       — prompted camera with GPS/compass
│   │   ├── OtherPartyDetails  — driver, vehicle, insurer, foreign sub-form
│   │   ├── EligibilityCheck   — 30-rule self-assessment
│   │   ├── WitnessForm        — witness name/contact/statement
│   │   ├── AccidentSketch     — canvas drawing tool
│   │   ├── InjuryPassengers   — passenger log, seatbelts, hospital
│   │   ├── SignaturePad       — touch signature capture
│   │   └── Summary            — review + submit
│   ├── layout/            # AppShell, BottomNav, StepWizard
│   ├── records/           # IncidentList, IncidentDetail
│   ├── reference/         # DosAndDonts, EmergencyNumbers
│   ├── setup/             # SetupWizard, PersonalDetails
│   ├── tracker/           # DeadlineDashboard
│   └── HomeScreen.tsx     # Landing page with big red "Report" button
├── constants/             # Photo prompts, eligibility rules, deadlines, emergency contacts
├── db/                    # Dexie database schema
├── hooks/                 # useCamera, useGeolocation, useCountdown, useOfflineStatus
├── store/                 # Zustand stores (accident, incident, profile)
├── types/                 # TypeScript interfaces (Incident, Eligibility, Profile)
└── utils/                 # PDF export, eligibility scorer, date helpers, share helper, photo metadata
```

## Getting Started

```bash
# Install dependencies (--legacy-peer-deps required for Tailwind CSS v4 peer dep)
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:5173` by default. On first launch you'll see a **Setup Wizard** to enter your personal & vehicle details (stored locally only).

## Changelog

### v1.0.0 — MVP Release

**Initial implementation** of the full accident reporting flow:

- Triage & Emergency entry screens, followed by an 8-step wizard: Scene → Photos → Other Party → Eligibility → Witnesses → Sketch → Injuries → Summary
- First-run setup wizard for driver profile & vehicle details
- IndexedDB persistence for all incidents and photos
- PDF export with full incident data
- Web Share API integration
- Deadline tracker with countdown timers
- Emergency numbers quick-dial
- Do's and Don'ts reference guide
- Offline-capable PWA with service worker caching
- Foreign vehicle handling (Malaysia/international)
- Eligibility self-check with 30 Singapore-specific rules
- GPS + compass metadata on all photos
- Signature capture for both parties

**Defect fixes:**
- Fixed type mismatches across stores, hooks, and components (17 files)
- Aligned Zustand store signatures with component usage
- Fixed camera hook and geolocation hook return types
- Added missing fields to incident detail view (injuries, witnesses, share button)
- Ensured HomeScreen eligibility badges and witness button work correctly

### v1.0.1 — Bug Fixes

- **BUG-004:** AccidentSketch now shows a confirmation dialog before switching templates or clearing, preventing accidental loss of user drawings
- **BUG-005:** Fixed missing `useEffect` dependency arrays in TriageScreen for geolocation and location update hooks
- **BUG-006:** Fixed race condition in OtherPartyDetails where adding a party could briefly show the wrong tab; now switches to the new party only after the store updates
- **BUG-007:** Removed unused `photos` field from the `Incident` type — photos are stored in the separate `db.photos` Dexie table, so this field was dead weight in IndexedDB

### v1.1.0 — Spec Compliance

- **SPEC-001:** Witness/passenger button now launches a dedicated reduced flow (statement, contact details, scene photos only) instead of the full 8-step accident wizard
- **SPEC-003:** AccidentSketch gains a tool palette with Car A, Car B, Arrow, and Impact (X) marker — tap to place vehicles, drag to draw arrows, tap for impact points; all tools work with undo
- **SPEC-004:** Setup wizard now auto-saves profile, vehicle, insurance, and driver data to IndexedDB as the user advances through each step — crash-safe
- **SPEC-005:** Added missing `sleepDeprived` eligibility question ("Were you sleep-deprived?") and amber-severity rule
- **SPEC-006:** Camera hook now detects iOS Safari file-picker cancellation via window focus listener, preventing the Promise from hanging indefinitely
- **SPEC-007:** EligibilityCheck type assertion replaced with compile-time `BooleanFields<T>` constraint — eliminates unsafe `as boolean | null` cast

### v1.2.0 — Review Fixes

**HTML & accessibility:**
- **UGLY-001:** Removed stale `<link rel="manifest" href="/manifest.json">` from `index.html` — was causing a duplicate manifest (404 + correct Workbox-generated one)
- **UGLY-002:** Removed `user-scalable=no` and `maximum-scale=1.0` from viewport meta — restores WCAG 2.1 SC 1.4.4 compliance (pinch-to-zoom)

**Performance:**
- **UGLY-003:** PDF export (`jsPDF` + `html2canvas`) and share helpers are now dynamically imported in `Summary.tsx` — shareHelper chunk dropped from 404 KB to 0.6 KB; PDF libraries load only when the user taps "Generate PDF" or "Share"
- **UGLY-004:** `saveToDb()` is now debounced by 300 ms — prevents IndexedDB writes on every keystroke during rapid form entry
- **BUG-B03:** `calculateEligibility` results on HomeScreen are memoized via `useMemo` — avoids re-running the 30-rule engine on every render

**Robustness:**
- **UGLY-005:** Added a root `ErrorBoundary` component — catches unhandled React errors and shows a recovery screen instead of a blank page
- **BAD-008:** All `saveToDb()` / `completeIncident()` calls are now wrapped in `try/catch` with `console.error` — prevents silent data loss on IndexedDB write failure
- **UGLY-006:** Replaced unsafe `Partial<T> as T` casts in `SetupWizard` with explicit full-object construction using fallback defaults — eliminates runtime risk from missing fields

**UX improvements:**
- **BAD-001:** Documented `--legacy-peer-deps` in README install instructions
- **BAD-002:** Added input validation utilities (`isValidNRIC`, `isValidSGPhone`, `isValidEmail`, `isValidVehicleReg`) with inline error hints in the setup wizard
- **BAD-004:** Eligibility check now pre-populates answers from the user's saved profile, insurance, and vehicle data (licence status, insurance expiry, road tax, ownership)
- **BAD-005:** Setup wizard auto-saves all fields to IndexedDB on change via a 500 ms debounce — crash-safe even if the user doesn't tap "Next"
- **BAD-007:** PhotoCapture auto-scrolls to the next uncaptured required prompt after each photo is taken
- **BAD-009:** Resuming an in-progress incident now navigates to the last visited wizard step (tracked via `StepWizard`), instead of always restarting at triage

## License

Private — not open source.
