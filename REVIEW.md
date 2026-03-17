# Implementation Review — SG Accident Kaki

**Reviewed:** 2026-03-17 (updated — all prior issues verified against current code)
**Build status:** Compiles and builds successfully (`npm install` works via `.npmrc` `legacy-peer-deps=true`)

---

## WHAT WORKS WELL

### Architecture
- **Offline-first done right.** Dexie IndexedDB for all data, Workbox service worker with precaching, Nominatim responses cached 7 days. Photos stored as separate blobs in their own table.
- **HashRouter** — correct for PWA, avoids server routing issues.
- **PWA config** — `registerType: 'autoUpdate'`, standalone display, portrait orientation, proper icons, runtime caching.

### Code Quality
- **TypeScript strict mode** with no escape hatches. All interfaces match the spec.
- **Eligibility scorer** is a clean pure function — zero side effects.
- **Lazy loading** applied sensibly: heavy components (AccidentSketch, Summary, PDF, EligibilityCheck, WitnessReportFlow) code-split; critical-path components (Triage, Emergency, Scene) eagerly loaded.
- **Dynamic imports** for jsPDF + html2canvas — loaded only on "Generate PDF" or "Share" tap.
- **Debounced saves** (300 ms) prevent IndexedDB thrashing during rapid form entry.

### Feature Coverage
- Full 8-step wizard: Triage → Scene → Photos → Other Party → Eligibility → Witnesses → Sketch → Injuries → Summary
- 26 photo prompts (13 required, 13 optional) with GPS + compass metadata
- 27 scoring rules (11 red, 16 amber) with auto-population from profile
- Foreign vehicle module (nationality, VEP, Autopass, border insurance, claims agent, hit-and-run)
- Multi-party support with tab navigation
- Accident sketch: 5 road templates, 5 drawing tools, undo/clear with confirmation
- Deadline tracker: 8 deadlines with real-time countdown
- PDF export covering all sections
- Witness/passenger flow: separate 3-step reduced flow
- Resume to last visited wizard step (not triage)
- Setup wizard auto-saves all fields (500 ms debounce)
- Input validation: NRIC/FIN, SG phone, email, vehicle registration

### UX
- Big red button (40vh) — impossible to miss
- Emergency flow with direct-dial 995/999
- In-progress banner when incident is active
- Insurance expiry warning within 30 days
- Photo auto-scroll to next required prompt after capture
- Root error boundary prevents white-screen crashes

---

## WHAT STILL NEEDS WORK

### Critical

**No automated tests**
- Zero test files, no test framework in `package.json`
- Low-hanging fruit: `eligibilityScorer.ts`, `validation.ts`, `dateHelpers.ts` are pure functions

**Accessibility gaps (WCAG AA)**
- Only ~3 `aria-label` / `aria-describedby` usages across 25+ components
- No `role="dialog"` / `aria-modal` / focus trap on modal overlays
- Canvas elements (sketch, signature) lack text alternatives
- No skip navigation, no keyboard nav for canvas tools
- Warning color (#F57F17) on white may fail 4.5:1 contrast ratio
- See AUDIT.md UGLY-001 for full breakdown

### High

**No component library**
- Spec called for shadcn/ui — not adopted
- All UI is raw Tailwind: no reusable Dialog, Toast, Tabs primitives
- `window.confirm()` mixed with custom modals — inconsistent UX
- Every new feature reinvents common patterns

**No data encryption at rest**
- NRIC, licence details, photos, GPS coordinates stored as plaintext in IndexedDB
- Singapore PDPA requires reasonable security for personal data

**No CSP headers**
- No Content Security Policy in Netlify config or meta tags

**Silent save failures**
- `saveToDb` has try/catch but only logs to `console.error` — no user-visible notification
- No storage quota monitoring

### Medium

**No voice-to-text** — spec requires SpeechRecognition API for scene description and witness statement fields

**No CI/CD pipeline** — no GitHub Actions, no automated build/lint/test on PR

**No database migration strategy** — single `version(1)` with no upgrade path

**Photo storage unbounded** — no compression, no size limits, no quota monitoring, no cleanup of old incident photos

**`package.json` version** is `1.0.0` but changelog describes v1.2.0 features

**No i18n** — all text hard-coded English (Singapore has 4 official languages)

**ErrorBoundary doesn't log errors** — `componentDidCatch` not implemented, no external error service

### Low

**Debounce timer is module-level global** — single `let saveTimer` at module scope in `useAccidentStore.ts`; architecturally fragile but unlikely to cause data loss in practice

---

## SPEC COMPLIANCE

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Pre-fill personal/vehicle/insurance (setup wizard) | PASS |
| 2 | Tap "I've Been in an Accident" → guided flow | PASS |
| 3 | Geotagged, timestamped photos with checklist | PASS |
| 4 | Other party details + foreign vehicle module | PASS |
| 5 | Claim eligibility self-check (green/amber/red) | PASS |
| 6 | Witnesses + basic accident sketch | PASS |
| 7 | Sign off + generate PDF | PASS |
| 8 | Post-accident deadline tracking | PASS |
| 9 | Works fully offline | PASS (no offline test harness) |
| 10 | Loads < 2s on mid-range phone (4G) | LIKELY PASS (~392 KB compressed) |
| 11 | Tech stack matches spec | DEVIATED (React 19, TW4, no shadcn/ui, Router v7) |
| 12 | WCAG AA accessibility | FAIL |
| 13 | Voice-to-text | NOT IMPLEMENTED |
| 14 | Automated tests | NOT IMPLEMENTED |

---

## PREVIOUSLY FIXED ISSUES

All issues from the original review have been resolved:

| ID | Issue | Fix |
|---|---|---|
| UGLY-001 | Duplicate `<link rel="manifest">` in index.html | Removed stale link |
| UGLY-002 | `user-scalable=no` blocked pinch-to-zoom | Viewport meta cleaned up |
| UGLY-003 | 404 KB share chunk (jsPDF bundled statically) | Dynamic imports in Summary |
| UGLY-004 | No debounce on IndexedDB writes | 300 ms debounce on `saveToDb` |
| UGLY-005 | No error boundary | Root `ErrorBoundary` component added |
| UGLY-006 | Unsafe `Partial<T> as T` casts in SetupWizard | Full-object construction with defaults |
| BAD-001 | `npm install` fails without `--legacy-peer-deps` | `.npmrc` added + README updated |
| BAD-002 | No input validation | `validation.ts` with NRIC, phone, email, vehicle reg |
| BAD-004 | Eligibility not pre-populated from profile | `useEffect` pre-fills from profile/insurance/vehicle stores |
| BAD-005 | Setup wizard doesn't auto-save | 500 ms debounced auto-save to IndexedDB |
| BAD-007 | PhotoCapture doesn't auto-advance | Auto-scrolls to next uncaptured required prompt |
| BAD-008 | `saveToDb` has no error handling | try/catch with console.error on all DB writes |
| BAD-009 | Resume always goes to triage | Navigates to `lastRoute` (tracked by StepWizard) |
| BUG-B03 | `calculateEligibility` called on every render | Memoized with `useMemo` on HomeScreen |

---

## PRIORITY FIXES

1. **Add automated tests** — eligibility scorer, validation utils, date helpers (pure functions, easy wins)
2. **WCAG AA accessibility** — ARIA labels, focus management, keyboard nav, contrast fixes
3. **CSP headers** in Netlify config (1-hour fix, high security impact)
4. **Encrypt PII at rest** in IndexedDB (PDPA compliance)
5. **User-visible save failure notification** — replace console.error with toast/banner
6. **Component library** — adopt shadcn/ui or Radix for Dialog, Toast, Tabs
7. **CI/CD pipeline** — GitHub Actions for lint + type-check + test + build
8. **Image compression** before IndexedDB storage
9. **Voice-to-text** for scene description and witness statements
