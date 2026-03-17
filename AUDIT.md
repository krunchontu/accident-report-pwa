# Comprehensive Audit — SG Accident Kaki PWA

**Audited:** 2026-03-17
**Branch:** `claude/comprehensive-audit-XoNwq`
**Methodology:** Multi-agent deep analysis of all source files, cross-referenced against project specification (REVIEW.md), README documentation, and SWE/UI/UX best practices.

---

## EXECUTIVE SUMMARY

**Overall Grade: B+ (83/100)**

SG Accident Kaki is a well-architected, offline-first PWA that successfully implements a complex 8-step accident documentation wizard for Singapore drivers. The core functionality is complete and the codebase demonstrates good TypeScript discipline. However, significant gaps remain in testing, accessibility, security hardening, and component library maturity that prevent it from reaching production-grade quality.

| Category | Score | Verdict |
|----------|-------|---------|
| Feature Completeness | 9/10 | Near-complete spec implementation |
| Architecture & Code Quality | 8/10 | Clean Zustand + Dexie + lazy loading |
| TypeScript & Type Safety | 9/10 | Strict mode, no `any` escapes |
| PWA & Offline | 9/10 | Workbox + IndexedDB done right |
| UI/UX Design | 7/10 | Functional but missing polish |
| Accessibility (WCAG) | 4/10 | Major gaps throughout |
| Testing | 0/10 | Zero test files |
| Security | 5/10 | No encryption, no CSP, basic validation only |
| Performance | 8/10 | Good lazy loading, debounced saves |
| Documentation | 8/10 | Good README, accurate REVIEW.md |
| Error Resilience | 6/10 | Root boundary exists, per-route missing |

---

## THE GOOD

### 1. Solid Offline-First Architecture
- **Dexie (IndexedDB)** with 6 well-designed tables: profiles, vehicles, insurance, familyDrivers, incidents, photos
- **Workbox service worker** with precaching for all assets and runtime caching for Nominatim geocoding (7-day TTL)
- **HashRouter** — correct choice for PWA that avoids server routing dependencies
- All data persists locally with no server dependency — exactly right for a roadside tool

### 2. Excellent Feature Coverage
All 10 spec success criteria are met or nearly met:
- **8-step accident wizard**: Triage → Scene → Photos → Other Party → Eligibility → Witnesses → Sketch → Injuries → Summary
- **26 photo prompts** with GPS + compass metadata, thumbnail generation, category grouping
- **27-rule eligibility scorer** — clean pure function, green/amber/red scoring with plain-English consequences
- **Foreign vehicle module** — comprehensive: nationality, VEP, Autopass, border insurance types, claims agent, hit-and-run
- **Canvas accident sketch** — 5 road templates, 5 drawing tools (pen, car A/B, arrow, impact X), undo/clear
- **Deadline tracker** — all 8 post-accident deadlines with real-time countdown
- **PDF export** — covers all sections including reporter's own details, sketch, and signatures
- **Web Share API** integration for distributing reports
- **Witness/passenger flow** — separate 3-step reduced flow (per spec)
- **Resume functionality** — returns to last wizard step, not triage

### 3. Clean TypeScript Throughout
- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- All interfaces (`Incident`, `OtherParty`, `ForeignVehicleDetails`, `EligibilityCheck`) faithfully match the spec
- No `any` escape hatches found
- `BooleanFields<T>` compile-time constraint for eligibility (replaces unsafe `as boolean | null` cast)

### 4. Smart Code Splitting
- **Eagerly loaded**: TriageScreen, EmergencyFlow, SceneDetails (critical path for speed)
- **Lazy loaded**: PhotoCapture, AccidentSketch, EligibilityCheck, Summary, WitnessReportFlow, PDF export
- Dynamic imports for heavy utilities (jsPDF, html2canvas, shareHelper) — only loaded when user taps "Generate PDF" or "Share"
- Bundle: ~248KB main + ~144KB React ≈ 392KB compressed — under the 500KB target

### 5. Well-Designed State Management
- **Zustand + Immer** — appropriate choice for this complexity level
- Three focused stores: `useAccidentStore`, `useProfileStore`, `useIncidentStore`
- **300ms debounced saves** prevent IndexedDB thrashing during rapid form entry
- Immediate (non-debounced) flush on `completeIncident()` — no data loss risk
- Setup wizard auto-saves with 500ms debounce — crash-safe

### 6. Thoughtful UX for Stressed Users
- **Big red button** (40vh) — impossible to miss at an accident scene
- **Emergency flow** with direct-dial 995/999 buttons and critical DO NOT warnings
- **In-progress banner** on home screen when incident is active
- **Insurance expiry warning** shown within 30 days
- **Profile incomplete prompt** when critical fields missing
- **Eligibility auto-population** from saved profile — reduces data entry under stress
- **Reporter profile snapshot** — personal, vehicle, and insurance details auto-captured into each incident at creation, displayed in Summary, PDF export, and saved records
- **Photo auto-scroll** to next uncaptured required prompt after each capture
- **Exit confirmation dialog** prevents accidental wizard abandonment

### 7. Previously Fixed Issues (Verified)
The following issues from REVIEW.md v1 have been correctly fixed:
- ✅ UGLY-001: Duplicate manifest link removed from `index.html`
- ✅ UGLY-002: `user-scalable=no` removed — pinch-to-zoom restored
- ✅ UGLY-003: Share helper chunk uses dynamic import for PDF libraries
- ✅ UGLY-004: `saveToDb` debounced at 300ms
- ✅ UGLY-005: Root `ErrorBoundary` component added
- ✅ UGLY-006: Unsafe `Partial<T> as T` casts replaced with full-object construction
- ✅ BAD-001: `--legacy-peer-deps` documented in README
- ✅ BAD-002: Input validation added (NRIC, phone, email, vehicle reg)
- ✅ BAD-004: Eligibility pre-populated from profile store
- ✅ BAD-005: Setup wizard auto-saves on field change
- ✅ BAD-007: Photo auto-advance implemented
- ✅ BAD-008: `saveToDb` error handling added (try/catch + console.error)
- ✅ BAD-009: Resume navigates to last visited step
- ✅ BUG-B03: Eligibility calculations memoized on HomeScreen
- ✅ Profile data included in incident: Reporter snapshot (personal/vehicle/insurance) captured at incident creation, displayed in Summary, PDF export, and IncidentDetail

---

## THE BAD

### BAD-001: Zero Automated Tests
- **Severity:** Critical (maintainability, regression risk)
- **Status:** UNFIXED — no test files exist anywhere in the project
- **Impact:** No Vitest, no Jest, no testing-library. Zero confidence in refactoring.
- **Low-hanging fruit not tested:**
  - `eligibilityScorer.ts` — pure function, trivially testable
  - `validation.ts` — pure functions for NRIC, phone, email, vehicle reg
  - `dateHelpers.ts` — date calculation functions
  - `photoMetadata.ts` — metadata extraction logic
  - `useCountdown` hook — timer logic
- **Missing in package.json:** No test script, no test dependencies
- **Industry standard:** Any production app should have at minimum unit tests for business logic and integration tests for critical user flows

### BAD-002: No Component Library — Raw Tailwind Everywhere
- **Severity:** Medium (consistency, accessibility, maintenance)
- **Spec called for:** Tailwind CSS 3 + shadcn/ui
- **Actual:** Tailwind CSS 4 with no component library
- **Impact:**
  - No reusable `Dialog`, `Toast`, `Dropdown`, `Select`, `Tabs` primitives
  - Every modal/dialog/confirmation is hand-rolled with inconsistent patterns
  - Delete confirmations use `window.confirm()` (native browser dialog) while exit uses a custom modal — jarring UX inconsistency
  - No consistent focus management, keyboard navigation, or ARIA patterns
  - Every new feature must reinvent common UI patterns

### BAD-003: No Voice-to-Text (SpeechRecognition API)
- **Severity:** Medium
- **Spec requirement:** Scene description and witness statement fields should have microphone icon for voice input
- **Status:** UNFIXED — acknowledged in prior review but never implemented
- **Impact:** For a "stressed user at roadside" tool, voice input is arguably more important than keyboard input. Typing a witness statement on a phone at a crash scene is painful.

### BAD-004: No Data Encryption at Rest
- **Severity:** Medium-High (security)
- **Data at risk in plaintext IndexedDB:**
  - NRIC/FIN numbers (Singapore national ID — highly sensitive PII)
  - Driver's licence details
  - Contact numbers and emails
  - Insurance policy numbers
  - Vehicle registration numbers
  - Photos of people, vehicles, injuries
  - GPS coordinates (location tracking)
- **Industry standard:** Sensitive PII should be encrypted at rest using Web Crypto API or a library like `crypto-js`
- **Regulatory concern:** Singapore's PDPA (Personal Data Protection Act) requires reasonable security for personal data

### BAD-005: Silent Database Failure UX
- **Severity:** Medium
- **Current state:** `saveToDb` has try/catch but only logs to `console.error`
- **User experience:** User sees no indication that their data failed to save. They complete 8 steps of an accident report, thinking everything is saved, but IndexedDB was full and nothing persisted.
- **What's needed:** A visible toast/banner notification: "Failed to save — storage may be full"
- **Also missing:** Storage quota monitoring — no warning when IndexedDB is near capacity

### BAD-006: No Database Migration Strategy
- **Severity:** Medium (future-proofing)
- **Current:** `this.version(1).stores({...})` hardcoded — no migration path
- **Impact:** Any schema change (adding a field, changing an index) in a future release will require careful Dexie version bumping. If done wrong, existing user data is lost.
- **Industry standard:** Define migration functions for each version increment

### BAD-007: Debounce Timer is Module-Level Global
- **Severity:** Low-Medium (edge case)
- **Location:** `src/store/useAccidentStore.ts` — `let saveTimer` at module scope
- **Risk:** If multiple rapid updates happen across different store actions, only the last debounce window's save executes. In practice this is unlikely to cause data loss (the final state is always saved), but it's architecturally fragile.

### BAD-008: Package Version Not Bumped
- **Severity:** Low
- **`package.json` version:** `1.0.0`
- **README changelog mentions:** v1.0.1, v1.1.0, v1.2.0
- **Impact:** Version mismatch between changelog and actual package.json

### BAD-009: No CI/CD Pipeline
- **Severity:** Medium
- **Status:** No `.github/workflows/`, no GitHub Actions, no automated build/lint/test on PR
- **Current deployment:** Netlify (auto-deploys from branch)
- **Impact:** No automated quality gate. Broken code can ship to production.

### BAD-010: Peer Dependency Conflict Resolved via `.npmrc` Workaround
- **Severity:** Low (mitigated)
- **Root cause:** `@tailwindcss/vite@^4.2.1` peer dependency conflict
- **Current state:** `.npmrc` with `legacy-peer-deps=true` is committed — `npm install` works without flags
- **Ideally:** Resolve at source by pinning compatible versions or waiting for upstream fix

---

## THE UGLY

### UGLY-001: Accessibility is Severely Lacking (WCAG AA Failures)
- **Severity:** Critical (legal, ethical, usability)
- **Overall ARIA usage:** Only **3 total** `aria-label`/`aria-describedby` occurrences across **25+ components**

**Specific failures:**

| Issue | WCAG Criterion | Location |
|-------|---------------|----------|
| BottomNav has no `aria-label` on nav items, no `role="navigation"` | 1.3.1 Info & Relationships | `BottomNav.tsx` |
| Exit confirmation modal has no `role="dialog"`, `aria-modal`, or focus trap | 1.3.1, 2.4.3 Focus Order | `StepWizard.tsx` |
| Canvas elements (sketch, signature) have no text alternatives | 1.1.1 Non-text Content | `AccidentSketch.tsx`, `SignaturePad.tsx` |
| Form validation errors not linked with `aria-describedby` | 1.3.1, 3.3.1 Error Identification | All form components |
| No `aria-live` regions for dynamic status updates | 4.1.3 Status Messages | Eligibility score, save confirmations |
| No skip navigation link | 2.4.1 Bypass Blocks | `AppShell.tsx` |
| No keyboard navigation for canvas tools | 2.1.1 Keyboard | `AccidentSketch.tsx` |
| Color contrast: Warning (#F57F17) on white may fail 4.5:1 ratio | 1.4.3 Contrast | Global theme |
| 10px font on BottomNav labels — below minimum readable size | 1.4.4 Resize Text | `BottomNav.tsx` |

**WCAG AA is the spec's stated minimum.** The current implementation would fail an accessibility audit.

### UGLY-002: No Content Security Policy (CSP)
- **Severity:** High (security)
- **Status:** No CSP headers configured in Netlify headers file or meta tags
- **Risk:** XSS attacks could inject scripts that exfiltrate sensitive PII (NRIC, photos, location data) from IndexedDB
- **Industry standard:** At minimum: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`

### UGLY-003: Inconsistent Error/Confirmation Patterns
- **Severity:** Medium (UX consistency)
- **Three different patterns used:**
  1. `window.confirm()` — native browser dialog (IncidentList delete, some PhotoCapture confirmations)
  2. Custom modal overlay — hand-built in StepWizard exit confirmation
  3. `window.alert()` — not used but could creep in
- **Problem:** Native `confirm()` dialogs look alien on mobile PWAs, can't be styled, and break the design language
- **Industry standard:** Use a single, consistent modal/dialog component throughout

### UGLY-004: No Internationalization (i18n)
- **Severity:** Medium (Singapore is multilingual)
- **Status:** All text is hard-coded English throughout
- **Context:** Singapore has 4 official languages (English, Mandarin, Malay, Tamil). A roadside accident may involve drivers who are more comfortable in other languages.
- **Date formatting:** Uses `toLocaleDateString('en-SG')` in only 2 places
- **Industry standard:** Extract all user-facing strings to a translation layer (react-i18next)

### UGLY-005: ErrorBoundary Doesn't Log Errors
- **Severity:** Medium (observability)
- **Location:** `src/components/ErrorBoundary.tsx`
- **Issue:** Implements `getDerivedStateFromError` but not `componentDidCatch`
- **Impact:** Errors are caught and a recovery UI is shown, but errors are never logged anywhere (no console.error, no external error service)
- **No per-route error boundaries** — if the Summary step crashes, the user loses the entire app context, not just the Summary

### UGLY-006: Photo Storage Unbounded
- **Severity:** Medium (device storage)
- **Current:** Full-resolution photos stored as Blobs in IndexedDB with no compression or size limits
- **Risk:** A thorough user capturing 26+ photos at full resolution (each 3-8MB on modern phones) could consume 100-200MB of IndexedDB quota
- **Missing:**
  - No image compression before storage
  - No storage quota monitoring
  - No cleanup of old incident photos
  - No maximum file size enforcement
  - Thumbnails generated but full blobs also retained

### UGLY-007: `componentDidCatch` Missing — No Error Reporting
- **Severity:** Medium
- **Impact:** When the app crashes in production, there's no way to know. No Sentry, no LogRocket, no error reporting of any kind. For a tool used in emergency situations, silent failures are unacceptable.

---

## SPEC COMPLIANCE MATRIX

| # | Requirement | Status | Gap |
|---|-------------|--------|-----|
| 1 | Pre-fill personal/vehicle/insurance (setup wizard) | ✅ PASS | — |
| 2 | Tap "I've Been in an Accident" → guided flow | ✅ PASS | — |
| 3 | Geotagged, timestamped photos with checklist | ✅ PASS | — |
| 4 | Other party details + foreign vehicle module | ✅ PASS | — |
| 5 | Claim eligibility self-check (green/amber/red) | ✅ PASS | — |
| 6 | Witnesses + basic accident sketch | ✅ PASS | — |
| 7 | Sign off + generate PDF | ✅ PASS | — |
| 8 | Post-accident deadline tracking | ✅ PASS | — |
| 9 | Works fully offline | ⚠️ PARTIAL | No offline test harness |
| 10 | Loads < 2s on mid-range phone (4G) | ✅ LIKELY PASS | 392KB compressed |
| 11 | Tech stack: React 18, Tailwind 3, shadcn/ui, Router v6 | ❌ DEVIATED | React 19, TW4, no shadcn, Router v7 |
| 12 | WCAG AA accessibility | ❌ FAIL | Only 3 ARIA attributes in 25+ components |
| 13 | Voice-to-text for text fields | ❌ NOT IMPL | SpeechRecognition API not used |
| 14 | Automated test suite | ❌ NOT IMPL | Zero test files |

---

## PRIORITY FIX ROADMAP

### P0 — Critical (Fix Before Production)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Add WCAG AA accessibility (ARIA labels, focus management, keyboard nav) | 3-5 days | Legal compliance, usability |
| 2 | Add automated tests (eligibility scorer, validation, critical flows) | 2-3 days | Regression prevention |
| 3 | Add CSP headers in Netlify config | 1 hour | XSS protection |
| 4 | Encrypt PII at rest in IndexedDB | 1-2 days | PDPA compliance |

### P1 — High (Fix Before GA)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 5 | Add shadcn/ui or Radix primitives for Dialog, Toast, etc. | 2-3 days | UX consistency, accessibility |
| 6 | User-visible save failure notifications | 0.5 day | Data loss prevention |
| 7 | CI/CD pipeline (GitHub Actions: lint, type-check, test, build) | 0.5 day | Quality gate |
| 8 | Image compression before IndexedDB storage | 1 day | Storage quota |
| 9 | Resolve peer dep conflict at source (`.npmrc` workaround already in place) | 1 hour | DX friction |

### P2 — Medium (Post-GA Enhancement)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 10 | Voice-to-text (SpeechRecognition API) | 1-2 days | UX for stressed users |
| 11 | i18n support (react-i18next) | 2-3 days | Multilingual Singapore |
| 12 | Error reporting service (Sentry) | 0.5 day | Observability |
| 13 | Per-route error boundaries | 0.5 day | Resilience |
| 14 | Database version migration strategy | 0.5 day | Future-proofing |
| 15 | Storage quota monitoring + old data cleanup | 1 day | Device health |

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                        │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ SetupWizard │  │ AppShell (BottomNav)      │  │
│  │ (first run) │  │  ├── HomeScreen           │  │
│  └─────────────┘  │  ├── /accident/* (Wizard) │  │
│                    │  │   ├── Triage           │  │
│                    │  │   ├── Emergency        │  │
│                    │  │   ├── SceneDetails     │  │
│                    │  │   ├── PhotoCapture     │  │
│                    │  │   ├── OtherParty       │  │
│                    │  │   ├── Eligibility      │  │
│                    │  │   ├── Witnesses        │  │
│                    │  │   ├── Sketch           │  │
│                    │  │   ├── Injuries         │  │
│                    │  │   └── Summary          │  │
│                    │  ├── /records (List/Detail)│  │
│                    │  ├── /details (Profile)    │  │
│                    │  └── /reference (Dos/Nums) │  │
│                    └──────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              State Layer (Zustand + Immer)        │
│  useAccidentStore  useProfileStore  useIncidentStore│
├─────────────────────────────────────────────────┤
│              Data Layer (Dexie / IndexedDB)       │
│  profiles │ vehicles │ insurance │ familyDrivers  │
│  incidents │ photos                               │
├─────────────────────────────────────────────────┤
│              Service Worker (Workbox)             │
│  Precache (app shell) + Runtime cache (Nominatim) │
└─────────────────────────────────────────────────┘
```

---

## BOTTOM LINE

**What works well:** The core accident documentation flow is complete, well-typed, and offline-capable. The eligibility scorer is clean. The photo capture with GPS/compass metadata is solid. The foreign vehicle module is comprehensive. The lazy loading strategy is smart. The UX for stressed users (big red button, auto-populate, auto-advance) is thoughtful.

**What needs work:** Accessibility is the single biggest gap — this app would fail a WCAG AA audit. Zero automated tests means zero confidence in any future changes. Sensitive PII stored in plaintext IndexedDB is a PDPA risk. The absence of a component library (shadcn/ui) leads to inconsistent UI patterns and hand-rolled accessibility. No CI/CD pipeline means broken code can ship.

**For an MVP, this is solid work.** For production with real users at real accident scenes, the P0 items must be addressed first.
