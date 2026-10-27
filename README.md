# FairShift — Your Trusted Platform

> A workforce management platform for **construction sites** and **hospital support teams**, built for **UN SDG 8: Decent Work and Economic Growth**.

FairShift helps workers understand their hours and pay, report safety hazards (including anonymously), and helps employers and an independent reviewer monitor attendance, overtime, and workplace complaints — with role-based login and two distinct industry portals.

---

## Demo login credentials

The app uses a **demo login** (frontend-only, NOT production-secure). On the login page, click any demo account to auto-fill it, or type the credentials below.

### Workers
Username = the worker's full name (lowercase). Default password = **first 3 letters of their first name + `123`**.

| Name | Username | Password | Industry |
|---|---|---|---|
| Ramesh Kumar | `ramesh kumar` | `ram123` | Construction (Mason) |
| Sita Devi | `sita devi` | `sit123` | Construction (Site Helper) |
| Imran Sheikh | `imran sheikh` | `imr123` | Construction (Scaffolder) |
| Lakshmi N. | `lakshmi n.` | `lak123` | Construction (Crane Operator) |
| Anjali Rao | `anjali rao` | `anj123` | Hospital (Nursing Assistant) |
| Joseph Thomas | `joseph thomas` | `jos123` | Hospital (Patient Support Attendant) |
| Fatima Begum | `fatima begum` | `fat123` | Hospital (Waste Handling Technician) |
| Mohit Verma | `mohit verma` | `moh123` | Hospital (Laundry Technician) |

Workers can change their own password from the **Change password** button on their dashboard.

### Employers
| Name | Username | Password | Industry |
|---|---|---|---|
| Arjun Site Manager | `arjun` | `arj123` | Construction |
| Dr. Neha Hospital Admin | `neha` | `neh123` | Hospital |

### Complaint Reviewer
| Name | Username | Password |
|---|---|---|
| Priya Menon | `reviewer` | `pri123` |

---

## Two industry portals

FairShift opens with a **portal selection screen** where you choose your workplace:

- **Construction portal** — warm orange / brown / yellow theme. PPE checklist, trade-specific daily tasks, site supervisor safety rules.
- **Hospital portal** — cool blue / white / purple / red theme. Day/evening/night shift & ward coverage, role-specific duties, fatigue & rest alerts, infection-control reminders.

Each portal has its own login form with the relevant demo accounts listed.

---

## Roles & what each can see

- **Worker** — sees only their own profile, attendance, pay, complaints, and skill passport. Cannot open other workers' records.
- **Employer** — sees only the workers and records for their industry. Anonymous complaint reporter names are hidden from employers. Can add new workers.
- **Reviewer** — sees all complaints across both industries, with a distinct violet review centre. Can assign cases, change status, and add case notes with a full timeline.

---

## Features

### Worker dashboard
- Profile (name, profession, workplace, shift, hourly rate).
- **Check-in / Check-out** with live status.
- **Explain My Pay** — plain-language breakdown and a **Flag a pay discrepancy** button.
- **Attendance history** with hours and overtime per day.
- **Weekly pay summary** cards.
- **Fatigue-risk check** based on recent shift hours and rest gaps.
- **Skill passport** with certification expiry (Valid / Expiring / Expired).
- **Report a hazard** (anonymous or named) with category, urgency, description, validation.
- **Change password** (current password → new password → confirm).
- Industry-specific panels (Construction / Hospital) with their own color theme.

### Employer dashboard
- Industry command-centre banner (Construction = orange/amber, Hospital = blue/indigo).
- Summary cards: workers, completed shifts, overtime, weekly payroll.
- Alerts: excessive-hours, high fatigue-risk, open complaints, pay discrepancies flagged.
- **Employer insight panel** — repeated hazards, overdue complaints, pay flags (anonymous reporters never shown).
- **Add Worker** form with validation, unique ID generation, and auto-created demo login.
- Workforce attendance table.
- Pay discrepancy flag review and clear.
- Complaint summary (anonymous reporter names hidden) with link to the Complaints Centre.

### Complaints Centre (worker, employer, reviewer)
- **Statuses**: Submitted → Under Review → Action Taken → Closed.
- Reviewer can change status, assign cases, and add case notes.
- Full **case timeline** (every status change and note is logged).
- Anonymous reporter identity is hidden from employers.
- Public **case status checker** on the login page (no login needed — enter a case ID).

### Reviewer section
- Distinct **violet-themed** review shell (separate from worker/employer industry shell).
- Review Centre: all cases across both industries with status filter.
- Insights panel: repeated hazard categories, overdue cases, pay discrepancy count.

### General
- **Reset demo data** button (with confirmation) restores the original sample state.
- Responsive, accessible, large buttons, clear labels.
- Data persists in the browser via `localStorage`.

---

## Technology stack

- **React 18** + **TypeScript**
- **Vite 7** (dev server and build)
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **localStorage** for prototype persistence (no backend, no paid APIs)

No external accounts, servers, or API keys required.

---

## Setup instructions

You need **Node.js 18+** installed.

```bash
npm install
npm run dev
```

The app runs at the URL Vite prints (usually `http://localhost:5173`).

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## Project structure

```
fairshift/
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx                  # role-based routing + reset modal + reviewer insights
    ├── index.css
    ├── types.ts                 # Worker, Complaint, Account, Session, etc.
    ├── data/
    │   └── sampleData.ts        # sample workers, attendance, complaints, accounts, industry themes
    ├── store/
    │   └── useAppStore.ts       # localStorage state, login, changePassword, pay/fatigue logic
    ├── utils/
    │   └── format.ts            # date / money formatting helpers
    └── components/
        ├── LoginPage.tsx        # portal selection + login form
        ├── WorkerDashboard.tsx
        ├── EmployerDashboard.tsx
        ├── ComplaintsCentre.tsx
        ├── ComplaintForm.tsx
        ├── CaseChecker.tsx
        ├── ConstructionPanel.tsx  # orange/amber construction workflow
        ├── HospitalPanel.tsx      # blue/purple hospital workflow
        └── ui/
            ├── AppShell.tsx       # worker/employer industry-themed shell
            ├── ReviewerShell.tsx  # distinct violet reviewer shell
            ├── Button.tsx
            ├── Card.tsx
            ├── Badge.tsx
            ├── Table.tsx
            ├── Modal.tsx
            └── StatCard.tsx
```

---

## Notes

- All data is sample data stored in your browser's `localStorage`. Clearing site data or clicking **Reset demo** restores defaults.
- The demo login is for testing only — it is NOT production-secure.
