# PRD Addendum — Frontend Tech Stack, IA, and Integration Guide

This addendum specifies the **technology choices**, **information architecture**, **screens & flows**, **component design**, and **integration details** for building a polished, low-friction UX for both **Super Admin** and **Hospital Admin** interfaces. It is written for a senior frontend developer to execute with minimal ambiguity.

---

## 1) Product Goals (Frontend)

* **Zero-friction ops:** Common tasks in ≤3 clicks (create hospital, invite admin, add patient, book appointment, view schedule, send reminders).
* **Trustworthy & calm UI:** Clinical look, high contrast, clear hierarchy, responsive from 360px → desktop.
* **Multi-tenant:** Super Admin can manage all hospitals; each hospital sees only its own data.
* **Operational visibility:** At-a-glance KPIs, queue health, reminder delivery breakdown, upcoming appointments.
* **Progressive enhancement:** Browser-based first (no native), offline tolerant for light reads.

---

## 2) Tech Stack (Frontend)

**Framework & language**

* **React 18** + **TypeScript**
* Build tool: **Vite**
* Routing: **React Router** (v6+) or **TanStack Router** (either is fine; examples assume React Router)

**Design system & UI**

* **Tailwind CSS** + **shadcn/ui** (Radix primitives)
* Icons: **lucide-react**
* Data grid & lists: **TanStack Table**
* Charts: **Recharts**
* Date/Time: **date-fns** + **react-day-picker** (or **@mantine/dates** if desired)
* Forms & validation: **React Hook Form** + **Zod**
* Notifications/toasts: **sonner** or **@radix-ui/react-toast**

**State & data**

* Server cache: **React Query (TanStack Query)**
* Client state: **Zustand** (auth, UI prefs)
* Feature flags (optional): **unleash-proxy-client** or simple `.env` gating

**Networking & auth**

* **Fetch** with `credentials: 'include'` (cookie-based JWT from our Express API)
* CORS enabled on API (`CORS_ORIGIN=http://localhost:5173`, `credentials: true`)
* **n8n** integrations via:

  * **Webhooks** (booking, reminders)
  * **HTTP Request** nodes pointing to our API (for DB writes/reads where needed)

**Quality**

* Lint/format: **ESLint**, **Prettier**
* Testing: **Vitest** + **Testing Library** + **MSW** (API mocks)
* Accessibility: **eslint-plugin-jsx-a11y**, keyboard navigation checks

**Packaging & deploy**

* Local dev: `npm run dev`
* CI: GitHub Actions (typecheck, lint, test, build)
* Deploy: Static hosting (Netlify/Vercel/S3+CloudFront); API hosted separately

---

## 3) High-Level Information Architecture

### Tenants / Roles

* **Super Admin (Platform)**

  * Manages hospitals (create, list, impersonate)
  * Global metrics & monitoring
* **Hospital Admin (Per-tenant)**

  * Manages clinicians, patients, schedules
  * Templates, contact preferences
  * Metrics & reminder performance

### Navigation (left rail)

* **Super Admin App**

  * Dashboard
  * Hospitals
  * Monitoring (Queues/Reminders/N8N health)
  * Settings

* **Hospital Admin App**

  * Dashboard
  * Appointments (Calendar | List)
  * Patients
  * Clinicians
  * Templates
  * Messaging (Outbound queue & Notifications)
  * Settings (Hospital profile, Staff logins)
  * Billings (Overview, Invoice & Payments, Payroll & Salaries Financial Reports, Account Payable, Account Receivable)

---

## 4) Screens & Components

### A) Auth

* **Login** (email, password)

  * Success → route guard sets `status=authed`, show appropriate app (Super Admin by role)
* **Logout** (kills cookies server-side and resets client)
* **(Later) Reset password** flow (token screen + new password form)

### B) Super Admin

1. **Dashboard**

   * KPIs: total hospitals, active hospitals (last 24h), total users, queue backlog
   * Chart: reminders sent over time (all tenants)
   * Card: N8N workflow health (last success/error timestamp)

2. **Hospitals List**

   * Table: name, country, timezone, created_at, admins count
   * Actions: **Create Hospital**, **Impersonate**
   * Search/filter by country/timezone
   * Pagination

3. **Create Hospital (Modal/Page)**

   * Fields: Name*, Country (select), Timezone (select), Admin email*, Temp password*
   * On submit:

     * POST `/api/super/hospitals`
     * Show success summary, CTA “Impersonate now”

4. **Monitoring**

   * **Outbound Queue** overview (cross-tenant)
   * **Notifications breakdown** (channel/provider/status)
   * **n8n**: show webhook uptime, last run, error nodes (fed by lightweight API endpoints or direct n8n API if configured)

5. **Settings**

   * Super admin profile, sign-out all sessions, theme (light/dark), telemetry opt-in

### C) Hospital Admin

1. **Dashboard**

   * KPIs: appointments today, no-shows this week, reminders sent (today), opt-out rate
   * Chart: appointments per status
   * Card: “Upcoming in next 2 hours” list
   * Card: Template coverage (email/sms availability %)

2. **Appointments**

   * **Calendar** view (day/week) with clinician filter
   * **List** view (sortable, filterable by status/clinician)
   * **Create Appointment** (drawer/modal): patient lookup (MRN/email/phone), date/time, clinician, reason
   * **Confirm/Cancel/Mark no-show** quick actions
   * **Export CSV** (current filters)

3. **Patients**

   * Table: MRN, name, email, phone, DOB, created_at
   * Search: name/email/mrn/phone
   * **Create Patient** (modal)
   * Row → **Patient Profile**

     * Demographics
     * Contact preferences (email/sms/voice opt-in)
     * Health records summary (latest diagnoses/tests) *(read-only for now)*
     * Appointments tab
     * Notes (simple text)

4. **Clinicians**

   * Table: name, specialty, email, phone
   * **Add Clinician** (modal)
   * Availability (later): weekly schedule grid

5. **Templates**

   * List: Name, Channel (email/sms/voice), Active?, Updated
   * **Create/Update Template** (form with preview)
   * Variables helper: `{patient_first}`, `{clinician_name}`, `{start_time_local}`, `{hospital_name}`

6. **Messaging**

   * **Outbound Queue**: appointment_id, channel, provider, status, attempts, next_retry
   * **Notifications**: history grid (filter by status/provider/channel/date)
   * Retry failed (action button) *(optional after MVP)*

7. **Settings**

   * Hospital profile (name, country, timezone)
   * Staff accounts (list/add deactivate)
   * API keys (for partner integrations) *(later)*

8. **Billings**

  *Overview (Total earnings, total revenue, accounts receivable, Revenue generated(chart), Top revenue contributors, Download reports)
  *Accounts payable (Add bill/expense, Filter by search, status, category and date range)

---

## 5) Component Library (key building blocks)

* **Layout**

  * `AppShell` (left rail, top bar, content)
  * `PageHeader` (title, actions)
  * `Card`, `DataCard` (KPI)
* **Inputs**

  * `TextField`, `Select`, `DateTimePicker`, `PhoneField`
  * `Form` wrapper using RHF + Zod
* **Tables**

  * `DataTable` (TanStack Table wrapper)
  * Column types: text, status badge, avatar (clinicians), date, action menu
* **Modals/Drawers**

  * `Modal` (`Dialog` from shadcn/ui)
  * `Drawer` (mobile flows)
* **Feedback**

  * `Toast`, `EmptyState`, `Spinner`, `ErrorBoundary`
* **Charts**

  * `MiniBar`, `LineTimeseries`

---

## 6) UX/Design Guidelines

* **Visual language:** neutral, medical; lots of whitespace; 14/16px base; clear hierarchy.
* **Keyboard navigation** for all forms/tables.
* **Empty states** with direct CTAs (e.g., “No hospitals yet. Create one”).
* **Bulk operations** where it saves clicks (bulk cancel confirmations).
* **Undo** where safe (client-side optimistic with server reconciliation).
* **Timezone awareness:** Show times localized to hospital timezone; store UTC.

---

## 7) Project Structure

```
hmsa-admin/
  src/
    api/
      http.ts            // apiFetch wrapper (credentials: include)
      endpoints.ts       // typed helper funcs
      n8n.ts             // optional direct webhook helpers
    store/
      auth.ts            // zustand auth store
      ui.ts              // theme, sidebar state
    components/
      layout/
      forms/
      tables/
      charts/
      feedback/
    pages/
      auth/Login.tsx
      super/Dashboard.tsx
      super/Hospitals.tsx
      hospital/Dashboard.tsx
      hospital/Appointments.tsx
      hospital/Patients.tsx
      hospital/Clinicians.tsx
      hospital/Templates.tsx
      hospital/Messaging.tsx
      hospital/Settings.tsx
    routes/
      ProtectedRoute.tsx
      RoleRoute.tsx       // optional: route-by-role
    utils/date.ts
    App.tsx
    main.tsx
  index.html
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  vite.config.ts
```

---

## 8) Data Contracts (Frontend ⇄ API)

> **All calls must use** `credentials: 'include'` and `Content-Type: application/json`.

### Auth

* **POST** `/api/auth/login` → `{email, password}`

  * **200**: `{ ok:true, role:'super_admin'|'hospital_admin', hospital_id?:uuid }`
  * Sets cookies `access_token`, `refresh_token` (HTTP-only)
* **POST** `/api/auth/logout` → `{ ok:true }`
* **POST** `/api/auth/refresh` → `{ ok:true }`

### Super Admin

* **GET** `/api/super/hospitals?limit&offset`

  * `[ { id, name, country, timezone, created_at } ]`
* **POST** `/api/super/hospitals`

  * body: `{ name, country, timezone, adminEmail, adminPassword }`
* **POST** `/api/super/impersonate`

  * body: `{ hospital_id }`
  * **200**: `{ ok:true, hospital_id }` (overwrites cookies with hospital scope)

### Hospital Admin

* **GET** `/api/hospitals/:id/metrics?start&end`
* **GET** `/api/hospitals/:id/patients?search&page&pageSize`
* **POST** `/api/hospitals/:id/patients`

  * `{ first_name, last_name, email?, phone?, date_of_birth? }`
* **GET** `/api/hospitals/:id/clinicians`
* **POST** `/api/hospitals/:id/clinicians`

  * `{ name, specialty?, email?, phone? }`
* **GET** `/api/hospitals/:id/templates`
* **POST** `/api/hospitals/:id/templates`

  * `{ name, channel, subject?, body_text, is_active? }`
* **GET** `/api/hospitals/:id/contact-preferences?patient_id`
* **POST** `/api/hospitals/:id/contact-preferences`

  * `{ patient_id, channel, is_opt_in }`

> **Appointments** endpoints can be added similarly, or routed via **n8n** webhook for booking flows.

---

## 9) Connecting the Frontend to Backend & n8n

### Environment

* `VITE_API_BASE=http://localhost:8082` (React app)
* Express `.env`:

  ```
  CORS_ORIGIN=http://localhost:5173
  SECURE_COOKIES=false
  ```
* n8n:

  * Booking webhook (e.g., `POST http://localhost:5678/webhook/book`)
  * Reminder cron workflow (no direct frontend call; backend monitors and exposes metrics)

### API Helper (example)

```ts
// src/api/http.ts
export const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { json?: any } = {}
): Promise<T> {
  const { json, ...rest } = opts;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...rest,
    body: json ? JSON.stringify(json) : opts.body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}
```

### Auth Store Snippet

```ts
// src/store/auth.ts
import { create } from 'zustand';
import { apiFetch } from '../api/http';

type Role = 'super_admin' | 'hospital_admin';
type User = { role: Role; hospital_id?: string | null };

export const useAuth = create<{
  user: User | null; status: 'idle' | 'loading' | 'authed';
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  tryRefresh: () => Promise<void>;
}>((set) => ({
  user: null, status: 'idle',
  async login(email, password) {
    set({ status: 'loading' });
    const r = await apiFetch<{ ok: true; role: Role; hospital_id?: string }>('/api/auth/login', {
      method: 'POST', json: { email, password }
    });
    set({ user: { role: r.role, hospital_id: r.hospital_id ?? null }, status: 'authed' });
  },
  async logout() { await apiFetch('/api/auth/logout', { method: 'POST' }); set({ user: null, status: 'idle' }); },
  async tryRefresh() { try { await apiFetch('/api/auth/refresh', { method: 'POST' }); set({ status: 'authed' }); } catch {} },
}));
```

### n8n Integration Patterns

* **Booking from UI** (Hospital Admin):

  * Option 1: **Call Express API** → API calls **n8n webhook** and returns the result (centralized auth & validation).
  * Option 2: UI calls **n8n webhook** directly → not recommended (CORS, auth, audit).
* **Reminders & queue**: purely backend/n8n; UI reads **metrics** and **queue state** via API (`/metrics`, `/notifications`, `/outbound-queue` if you expose them).

**Recommended:** Keep **frontend → API** only. The **API** orchestrates **Postgres** and **n8n**.

---

## 10) Flow Blueprints

### Super Admin — Create & Impersonate Hospital

1. User logs in (role=super_admin).
2. Navigates to **Hospitals** → **Create Hospital**.
3. POST `/api/super/hospitals`.
4. Success toast: “Hospital created. Impersonate?”
5. On click **Impersonate**, POST `/api/super/impersonate` → sets scoped cookies.
6. Router navigates to Hospital Admin app (`/h/:id/dashboard` optionally), or reuse same route with role logic.

### Hospital Admin — Add Patient & Book Appointment

1. Go **Patients** → **Add Patient**.
2. POST `/api/hospitals/:id/patients`.
3. Go **Appointments** → **Create Appointment**:

   * choose patient (search MRN/email)
   * choose clinician, date/time
4. **Option A:** POST `/api/hospitals/:id/appointments` (API writes DB; n8n listens to DB changes)
   **Option B (MVP):** API calls n8n booking webhook and writes appointment on success.
5. Confirmation toast + calendar refresh.

### Reminder Lifecycle

* n8n cron checks upcoming window (e.g., −5m…+60m), reads DB, enqueues reminders.
* n8n sends via provider (Mailpit in dev), writes `notifications`.
* UI **Messaging → Notifications/Queue** shows status. Retry failed via API endpoint that nudges n8n (optional).

---

## 11) Accessibility, Performance, Security

* **A11y:** semantic HTML, visible focus states, labels, ARIA for dialogs, WCAG AA contrast.
* **Perf:** code-split routes, cache tables via React Query, avoid blocking layouts; 60fps on table scroll.
* **Security:** all writes via API; cookies HTTP-only; CSRF reduced by same-site cookies; sanitize inputs; never expose secrets.

---

## 12) Developer Onboarding

**Prereqs**

* Node 18+, PNPM/NPM
* API running at `:8082`
* n8n running at `:5678` (for backend workflows)

**Steps**

1. `npm i`
2. Add `.env` in React app:

   ```
   VITE_API_BASE=http://localhost:8082
   ```
3. `npm run dev`
4. Login → Super Admin dashboard → Create Hospital → Impersonate → Hospital Admin flows.

**Testing**

* Unit: Vitest + RTL on components
* Integration (API): MSW mocks for endpoints
* E2E (optional): Playwright for critical flows (login, create hospital, add patient, book appointment)

---

## 13) Demo Data & Feature Flags

* Seed script on API keeps **Demo General Hospital** present.
* React app can show **Demo mode** badge if `VITE_DEMO=true`.
* Flags:

  * `FEATURE_APPOINTMENTS_CALENDAR`
  * `FEATURE_QUEUE_RETRY`
  * `FEATURE_TEMPLATES_VOICE`

---

## 14) Handover Checklist for Senior Frontend Dev

1. Scaffold Vite + TS + Tailwind + shadcn/ui.
2. Implement `api/http.ts`, `store/auth.ts`, route guards.
3. Build layouts (AppShell, PageHeader).
4. Super Admin: Dashboard, Hospitals (list + create + impersonate).
5. Hospital Admin: Dashboard, Patients (list + create), Clinicians (list + create).
6. Appointments: List + skeleton Calendar, Create modal (API stub OK).
7. Templates & Messaging read-only (MVP).
8. Charts & metrics wired to `/metrics`.
9. Error boundaries, toasts, empty states.
10. Tests for auth, table rendering, forms.

Use the following Font information: 
Font name: Saira
 <Head> <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

 CSS: 
.saira-<uniquifier> {
  font-family: "Saira", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
  font-variation-settings:
    "wdth" 100;
}

Here’s a drop-in starter repo for the React (Vite + TS) frontend that matches the PRD. It includes auth, routing, API wrapper, layout, Super Admin “Hospitals” list + create, Hospital Admin “Patients” list + create, basic metrics, Tailwind + shadcn/ui, and everything wired for cookie-based auth against the Express API.
________________________________________
1) File tree
hmsa-admin/
├─ .env.example
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  ├─ api/
│  │  ├─ http.ts
│  │  └─ endpoints.ts
│  ├─ store/
│  │  ├─ auth.ts
│  │  └─ ui.ts
│  ├─ components/
│  │  ├─ layout/AppShell.tsx
│  │  ├─ layout/PageHeader.tsx
│  │  ├─ feedback/Spinner.tsx
│  │  ├─ forms/Form.tsx
│  │  └─ tables/DataTable.tsx
│  ├─ routes/
│  │  ├─ ProtectedRoute.tsx
│  │  └─ RoleRoute.tsx
│  ├─ pages/
│  │  ├─ auth/Login.tsx
│  │  ├─ super/Dashboard.tsx
│  │  ├─ super/Hospitals.tsx
│  │  ├─ super/CreateHospitalModal.tsx
│  │  ├─ hospital/Dashboard.tsx
│  │  ├─ hospital/Patients.tsx
│  │  └─ hospital/CreatePatientModal.tsx
│  └─ utils/date.ts
└─ README.md
________________________________________
2) Config & scripts
.env.example
VITE_API_BASE=http://localhost:8082
VITE_APP_NAME=HMSA Admin
Duplicate to .env and adjust as needed.
package.json
{
  "name": "hmsa-admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-table": "^8.12.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.441.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "zod": "^3.23.8",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.8",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.1"
  }
}
vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
})
tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#145D8F',
          50: '#E6F1F8', 100: '#CFE5F2', 200: '#A0CBE6',
          300: '#71B0D9', 400: '#4296CD', 500: '#147CC0',
          600: '#1167A0', 700: '#0D517F', 800: '#093B5F', 900: '#06243E'
        }
      }
    }
  },
  plugins: []
}
postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>%VITE_APP_NAME%</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
________________________________________
3) Core app
src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/auth'
import Login from './pages/auth/Login'
import SuperDashboard from './pages/super/Dashboard'
import Hospitals from './pages/super/Hospitals'
import HospitalDashboard from './pages/hospital/Dashboard'
import Patients from './pages/hospital/Patients'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'

export default function App() {
  const { tryRefresh } = useAuth()
  useEffect(() => { tryRefresh().catch(()=>{}) }, [tryRefresh])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />

        {/* SUPER ADMIN */}
        <Route element={<ProtectedRoute/>}>
          <Route element={<RoleRoute allow={['super_admin']}/>}>
            <Route path="/super" element={<SuperDashboard/>}/>
            <Route path="/super/hospitals" element={<Hospitals/>}/>
          </Route>
        </Route>

        {/* HOSPITAL ADMIN */}
        <Route element={<ProtectedRoute/>}>
          <Route element={<RoleRoute allow={['hospital_admin','super_admin']}/>}>
            <Route path="/h/dashboard" element={<HospitalDashboard/>}/>
            <Route path="/h/patients" element={<Patients/>}/>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/super/hospitals" replace/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
________________________________________
4) API + endpoints
src/api/http.ts
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082'

export async function apiFetch<T = any>(path: string, opts: RequestInit & { json?: any } = {}) {
  const { json, ...rest } = opts
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...rest,
    body: json ? JSON.stringify(json) : opts.body
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data as T
}
src/api/endpoints.ts
import { apiFetch } from './http'

export type Role = 'super_admin' | 'hospital_admin'

export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch<{ ok: true; role: Role; hospital_id?: string }>('/api/auth/login', {
      method: 'POST', json: { email, password }
    }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  refresh: () => apiFetch('/api/auth/refresh', { method: 'POST' }),
}

export const SuperAPI = {
  listHospitals: () => apiFetch<Array<{ id:string; name:string; country:string|null; timezone:string; created_at:string }>>('/api/super/hospitals'),
  createHospital: (payload: { name:string; country?:string|null; timezone?:string; adminEmail:string; adminPassword:string; }) =>
    apiFetch<{ id:string; name:string }>('/api/super/hospitals', { method:'POST', json: payload }),
  impersonate: (hospital_id: string) =>
    apiFetch<{ ok:true; hospital_id:string }>('/api/super/impersonate', { method:'POST', json:{ hospital_id } })
}

export const HospitalAPI = {
  me: (id?: string) => apiFetch(`/api/hospitals/me${id ? `?id=${id}` : ''}`),

  listPatients: (hospitalId: string, params?: { search?: string; page?: number; pageSize?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    return apiFetch<Array<{ id:number; first_name:string; last_name:string; mrn:string; email?:string; phone?:string; created_at:string }>>(
      `/api/hospitals/${hospitalId}/patients${q.toString() ? `?${q}` : ''}`
    )
  },

  createPatient: (hospitalId: string, payload: { first_name:string; last_name:string; email?:string; phone?:string; date_of_birth?:string }) =>
    apiFetch<{ id:number; mrn:string }>(`/api/hospitals/${hospitalId}/patients`, { method:'POST', json: payload }),

  metrics: (hospitalId: string, start?: string, end?: string) => {
    const q = new URLSearchParams()
    if (start) q.set('start', start)
    if (end) q.set('end', end)
    return apiFetch<{ range:{start:string;end:string}; totalAppointments:number; byStatus:Array<{status:string;count:number}>; notifBreakdown:Array<any> }>(
      `/api/hospitals/${hospitalId}/metrics${q.toString() ? `?${q}` : ''}`
    )
  }
}
________________________________________
5) State & guards
src/store/auth.ts
import { create } from 'zustand'
import { AuthAPI, Role } from '../api/endpoints'

type User = { role: Role; hospital_id?: string | null }
type State = {
  user: User | null
  status: 'idle' | 'loading' | 'authed'
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  tryRefresh: () => Promise<void>
}

export const useAuth = create<State>((set) => ({
  user: null,
  status: 'idle',

  async login(email, password) {
    set({ status: 'loading' })
    const r = await AuthAPI.login(email, password)
    set({ user: { role: r.role, hospital_id: r.hospital_id ?? null }, status: 'authed' })
  },

  async logout() {
    await AuthAPI.logout()
    set({ user: null, status: 'idle' })
  },

  async tryRefresh() {
    try {
      await AuthAPI.refresh()
      set({ status: 'authed' })
    } catch {
      set({ status: 'idle' })
    }
  }
}))
src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function ProtectedRoute() {
  const { status } = useAuth()
  if (status === 'idle') return <Navigate to="/login" replace />
  if (status === 'authed') return <Outlet />
  return null
}
src/routes/RoleRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/auth'
import type { Role } from '../api/endpoints'

export default function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />
  return <Outlet />
}
________________________________________
6) Layout & plumbing
src/components/layout/AppShell.tsx
import { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import clsx from 'clsx'

export default function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const superLinks = [
    { to:'/super', label:'Dashboard' },
    { to:'/super/hospitals', label:'Hospitals' }
  ]
  const hospLinks = [
    { to:'/h/dashboard', label:'Dashboard' },
    { to:'/h/patients', label:'Patients' }
  ]

  const links = user?.role === 'super_admin' ? superLinks : hospLinks

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r">
        <div className="p-4 font-semibold">HMSA Admin</div>
        <nav className="space-y-1 px-2">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={clsx("block rounded px-3 py-2 hover:bg-gray-100", loc.pathname.startsWith(l.to) && "bg-gray-100 font-medium")}
            >{l.label}</Link>
          ))}
        </nav>
        <div className="px-4 py-4 text-sm text-gray-600">
          <div>Role: {user?.role ?? '-'}</div>
          <button className="text-brand-700 hover:underline mt-2" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}
src/components/layout/PageHeader.tsx
import { ReactNode } from 'react'

export default function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}
________________________________________
7) Pages
src/pages/auth/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth'

export default function Login() {
  const nav = useNavigate()
  const { login, status } = useAuth()
  const [email, setEmail] = useState('superadmin@demo.com')
  const [password, setPassword] = useState('Admin!234')
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      await login(email.trim(), password)
      nav('/super/hospitals', { replace: true })
    } catch (e: any) {
      setErr(e.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white border rounded">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Email</span>
          <input className="border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Password</span>
          <input type="password" className="border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        <button className="bg-brand-700 text-white rounded px-4 py-2 disabled:opacity-50" disabled={status==='loading'}>
          {status==='loading' ? 'Signing in…' : 'Sign in'}
        </button>
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </form>
    </div>
  )
}
src/pages/super/Dashboard.tsx
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'

export default function SuperDashboard() {
  return (
    <AppShell>
      <PageHeader title="Super Admin Dashboard" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">KPI: Total Hospitals</div>
        <div className="p-4 bg-white border rounded">KPI: Active (24h)</div>
        <div className="p-4 bg-white border rounded">KPI: Queue Backlog</div>
      </div>
    </AppShell>
  )
}
src/pages/super/CreateHospitalModal.tsx
import { useState } from 'react'
import { SuperAPI } from '../../api/endpoints'

export default function CreateHospitalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('NG')
  const [timezone, setTimezone] = useState('Africa/Lagos')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('TempPass!23')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    try {
      setBusy(true); setErr('')
      await SuperAPI.createHospital({ name, country, timezone, adminEmail, adminPassword })
      onCreated()
      onClose()
    } catch (e:any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-4 border rounded">
        <div className="text-lg font-semibold mb-3">Create Hospital</div>
        <div className="grid gap-2">
          <label className="grid gap-1"><span className="text-sm">Name</span>
            <input className="border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Country</span>
            <input className="border rounded px-3 py-2" value={country} onChange={e=>setCountry(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Timezone</span>
            <input className="border rounded px-3 py-2" value={timezone} onChange={e=>setTimezone(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Admin Email</span>
            <input className="border rounded px-3 py-2" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Admin Temp Password</span>
            <input className="border rounded px-3 py-2" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} />
          </label>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <div className="flex justify-end gap-2 mt-2">
            <button className="px-3 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button className="px-3 py-2 rounded bg-brand-700 text-white disabled:opacity-50" disabled={busy || !name || !adminEmail} onClick={submit}>
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
src/pages/super/Hospitals.tsx
import { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import { SuperAPI } from '../../api/endpoints'
import CreateHospitalModal from './CreateHospitalModal'

export default function Hospitals() {
  const [rows, setRows] = useState<Array<any>>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)

  async function load() {
    try {
      setErr('')
      const r = await SuperAPI.listHospitals()
      setRows(r)
    } catch (e:any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  async function impersonate(id: string) {
    try {
      await SuperAPI.impersonate(id)
      location.href = '/h/dashboard' // switch scope
    } catch (e:any) {
      alert(e.message)
    }
  }

  return (
    <AppShell>
      <PageHeader title="Hospitals" actions={<button className="bg-brand-700 text-white rounded px-3 py-2" onClick={()=>setOpen(true)}>Create Hospital</button>} />
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Country</th>
              <th className="p-3 border-b">Timezone</th>
              <th className="p-3 border-b">Created</th>
              <th className="p-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.country || '-'}</td>
                <td className="p-3">{r.timezone}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <button className="px-3 py-1 rounded border" onClick={()=>impersonate(r.id)}>Impersonate</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>No hospitals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <CreateHospitalModal onClose={()=>setOpen(false)} onCreated={load} />}
    </AppShell>
  )
}
src/pages/hospital/Dashboard.tsx
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import { useAuth } from '../../store/auth'

export default function HospitalDashboard() {
  const { user } = useAuth()
  return (
    <AppShell>
      <PageHeader title="Hospital Dashboard" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">Appointments today</div>
        <div className="p-4 bg-white border rounded">Reminders sent</div>
        <div className="p-4 bg-white border rounded">No-shows (week)</div>
      </div>
      <div className="mt-6 text-sm text-gray-600">Hospital scope: {user?.hospital_id ?? '-'}</div>
    </AppShell>
  )
}
src/pages/hospital/CreatePatientModal.tsx
import { useState } from 'react'
import { HospitalAPI } from '../../api/endpoints'

export default function CreatePatientModal({ hospitalId, onClose, onCreated }: { hospitalId: string; onClose: () => void; onCreated: () => void }) {
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    try {
      setBusy(true); setErr('')
      await HospitalAPI.createPatient(hospitalId, { first_name, last_name, email: email || undefined, phone: phone || undefined })
      onCreated(); onClose()
    } catch (e:any) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-4 border rounded">
        <div className="text-lg font-semibold mb-3">Create Patient</div>
        <div className="grid gap-2">
          <label className="grid gap-1"><span className="text-sm">First name</span>
            <input className="border rounded px-3 py-2" value={first_name} onChange={e=>setFirst(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Last name</span>
            <input className="border rounded px-3 py-2" value={last_name} onChange={e=>setLast(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Email</span>
            <input className="border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          <label className="grid gap-1"><span className="text-sm">Phone</span>
            <input className="border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
          </label>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <div className="flex justify-end gap-2 mt-2">
            <button className="px-3 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button className="px-3 py-2 rounded bg-brand-700 text-white disabled:opacity-50" disabled={busy || !first_name || !last_name} onClick={submit}>
              {busy ? 'Saving…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
src/pages/hospital/Patients.tsx
import { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import { useAuth } from '../../store/auth'
import { HospitalAPI } from '../../api/endpoints'
import CreatePatientModal from './CreatePatientModal'

export default function Patients() {
  const { user } = useAuth()
  const hid = user?.hospital_id || ''
  const [rows, setRows] = useState<Array<any>>([])
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  async function load() {
    if (!hid) return
    const r = await HospitalAPI.listPatients(hid, { search: q })
    setRows(r)
  }
  useEffect(() => { load() }, [hid])

  return (
    <AppShell>
      <PageHeader
        title="Patients"
        actions={
          <div className="flex gap-2">
            <input className="border rounded px-3 py-2" placeholder="Search name/email/MRN" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="px-3 py-2 rounded border" onClick={load}>Search</button>
            <button className="px-3 py-2 rounded bg-brand-700 text-white" onClick={()=>setOpen(true)}>Add Patient</button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-3 border-b">MRN</th>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Phone</th>
              <th className="p-3 border-b">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3 font-mono text-sm">{r.mrn}</td>
                <td className="p-3">{r.first_name} {r.last_name}</td>
                <td className="p-3">{r.email || '-'}</td>
                <td className="p-3">{r.phone || '-'}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <CreatePatientModal hospitalId={hid} onClose={()=>setOpen(false)} onCreated={load} />}
    </AppShell>
  )
}
________________________________________
8) Small utilities
src/utils/date.ts
export function toISOLocal(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1)
}
________________________________________
9) README (how to run)
README.md
# HMSA Admin (Frontend)

React + TypeScript + Vite + Tailwind. Talks to the Express API over HTTP-only cookies.

## Prereqs
- API running at http://localhost:8082 with CORS allowing http://localhost:5173 and `credentials: true`.
- n8n running (optional for now).

## Setup
```bash
cp .env.example .env
# edit .env if API is on a different host/port

npm i
npm run dev
Open http://localhost:5173
Default flow
•	Login with your super admin credentials (from the backend seed).
•	Super Admin → Hospitals: create a hospital, impersonate to switch into hospital scope.
•	Hospital Admin → Patients: create/search patients.
Notes
•	All requests include credentials: 'include' for cookie auth.
•	Do not call n8n webhooks directly from the browser in production; go through the API.

---

## 10) Hooking this to your backend

- Ensure backend `.env`:
CORS_ORIGIN=http://localhost:5173
SECURE_COOKIES=false
- Start backend (`node server.js`) and confirm:
- `GET /health` → `{ ok: true }`
- `POST /api/auth/login` works with curl
- Start this frontend: `npm run dev`
- Visit `http://localhost:5173/login`, sign in, navigate to **Hospitals** or **Patients**.

UI Visual designs location: https://drive.google.com/drive/folders/149TGWoHJMZ0Sj6S03rC7O4GfVMhlJXyS?usp=drive_link