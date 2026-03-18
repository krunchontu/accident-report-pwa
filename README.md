# SG Accident Kaki

A field-ready Progressive Web App for Singapore drivers to document motor vehicle accidents on the spot — step by step, offline-capable, and aligned with local insurance and legal requirements.

## Why This Exists

After a traffic accident in Singapore you have **24 hours** to file a Singapore Accident Statement (SAS) and notify your insurer. Missing details at the scene — other driver's licence, plate photos, witness contacts — can delay or kill your claim. This app turns a stressful roadside situation into a guided checklist so nothing gets missed.

## Features

### Guided Accident Reporting Wizard
- **Triage screen** — are there injuries? Do you need 995 / 999?
- **Emergency flow** — direct-dial buttons for Police (999) and Ambulance (995)
- **Scene details** — date/time, GPS location with reverse-geocoding, weather, road & traffic conditions
- **Photo capture** — 26 prompted shots (13 required, 13 optional) covering wide-angle scene, vehicle damage, plates, licences, IDs, insurance certs, road markings, dashcam stills, and injuries; GPS and compass metadata stamped on every image; auto-scrolls to next required prompt after each capture
- **Other party details** — driver info, vehicle registration, insurer & policy, visible damage; full **foreign vehicle** sub-form (nationality, VEP, Autopass, border insurance, Malaysian MIB)
- **Eligibility self-check** — 27 scoring rules (licence validity, insurance status, alcohol/drugs, named driver, vehicle mods, etc.) scored as green / amber / red with plain-English consequences; auto-populates answers from your saved profile
- **Reporter profile snapshot** — your personal, vehicle, and insurance details are captured from your profile into each incident at creation time, included in the summary, PDF export, and saved records
- **Witness capture** — name, contact, free-text statement
- **Accident sketch** — canvas with 5 road templates and 5 drawing tools (pen, Car A, Car B, directional arrow, impact X marker), undo/clear with confirmation
- **Injury & passenger log** — seatbelt/child-seat status, hospital name, per-passenger injury notes
- **Summary & signatures** — review all data including your own details (auto-filled from profile), capture driver + other-party signatures, generate PDF, share

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
- **PDF export** — multi-page report (scene, your details, photos, other party, eligibility, witnesses, sketch, signatures)
- **Share** — Web Share API integration

### Reference
- Do's and Don'ts quick guide
- Emergency numbers & useful links (Police, SCDF, GIA, LTA, FIDReC, MIB Singapore, Malaysian MMIB)

### Offline-First PWA
- Installable on home screen (standalone, portrait)
- Service Worker with Workbox — all assets precached, Nominatim geocoding cached 7 days
- All data stored locally in IndexedDB via Dexie (no server, no account)
- Offline status indicator
- Resume in-progress incident to the exact step you left off
- Setup wizard auto-saves on every field change (500 ms debounce)
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

> **Note:** The original spec called for React 18, Tailwind 3 + shadcn/ui, and React Router v6. These were deliberately upgraded. shadcn/ui was not adopted — all UI is built with raw Tailwind classes.

## Project Structure

```
src/
├── components/
│   ├── accident/          # Wizard steps (Triage → Summary)
│   │   ├── TriageScreen       — injury check, emergency routing
│   │   ├── EmergencyFlow      — 995/999 direct-dial
│   │   ├── SceneDetails       — location, weather, road conditions
│   │   ├── PhotoCapture       — 26 prompted shots with GPS/compass
│   │   ├── OtherPartyDetails  — driver, vehicle, insurer, foreign sub-form
│   │   ├── EligibilityCheck   — 27-rule self-assessment
│   │   ├── WitnessForm        — witness name/contact/statement
│   │   ├── AccidentSketch     — canvas with templates + tools
│   │   ├── InjuryPassengers   — passenger log, seatbelts, hospital
│   │   ├── SignaturePad       — touch signature capture
│   │   └── Summary            — review + PDF + share
│   ├── layout/            # AppShell, BottomNav, StepWizard
│   ├── records/           # IncidentList, IncidentDetail
│   ├── reference/         # DosAndDonts, EmergencyNumbers
│   ├── setup/             # SetupWizard, PersonalDetails
│   ├── tracker/           # DeadlineDashboard
│   └── HomeScreen.tsx
├── constants/             # Photo prompts, eligibility rules, deadlines, emergency contacts
├── db/                    # Dexie database schema
├── hooks/                 # useCamera, useGeolocation, useCountdown, useOfflineStatus
├── store/                 # Zustand stores (accident, incident, profile)
├── types/                 # TypeScript interfaces (Incident, Eligibility, Profile)
└── utils/                 # PDF export, eligibility scorer, date helpers, share helper, photo metadata
```

## SEO & Security

The app includes production-ready SEO and security hardening:

- **Structured data** — `WebApplication` and `FAQPage` JSON-LD schemas for Google rich snippets
- **Open Graph / Twitter Cards** — custom 1200x630 social sharing image with branding
- **Geo targeting** — Singapore-specific meta tags (`geo.region`, coordinates) for local search
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy (configured in `netlify.toml`)
- **PWA shortcuts** — long-press app icon for "Report New Accident", "View Past Reports", "Emergency Numbers"
- **Google Search Console** — verified with sitemap submission

See [MARKETING_STRATEGY_SG.md](MARKETING_STRATEGY_SG.md) for the full zero-budget marketing plan.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

> `.npmrc` is configured with `legacy-peer-deps=true` to resolve the Tailwind CSS v4 peer dependency conflict. No extra flags needed.

The app runs at `http://localhost:5173` by default. On first launch you'll see a **Setup Wizard** to enter your personal & vehicle details (stored locally only).

## License

[MIT](LICENSE)
