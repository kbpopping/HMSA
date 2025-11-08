# HMSA Frontend Complete Implementation Plan

**Document Version:** 1.0  
**Created:** 2024  
**Last Updated:** 2024  
**Reference Documents:** `frontend/PRD.md`, `frontend/UI_style_design. prd`

---

## Overview
Comprehensive plan to build the complete HMSA (Hospital Management System Admin) frontend following PRD.md specifications and UI_style_design.prd styling guidelines. Includes Super Admin dashboard, Hospital Admin pages, Clinicians management, and Patient Portal interfaces with full API integration.

**IMPORTANT:** This document should be referenced during all development phases to ensure consistency and adherence to the original plan.

---

## UI Design System (from UI_style_design.prd)

### Color Palette
- **Primary:** `#607AFB` (Note: PRD mentioned #145D8F, but UI design specifies #607AFB - use this)
- **Background Light:** `#f5f6f8`
- **Background Dark:** `#0f1323`
- **Text Light:** `#111827`
- **Text Dark:** `#f3f4f6`
- **Subtle Light:** `#e5e7eb`
- **Subtle Dark:** `#374151`

### Typography
- **Display Font:** `Space Grotesk` (for body text)
- **Branding Font:** `Inconsolata` (for HMSA logo/branding)
- Font weights: 400, 500, 700

### Design Tokens
- **Border Radius:** 
  - Default: `0.5rem`
  - Large: `1rem`
  - Extra Large: `1.5rem`
  - Full: `9999px`
- **Box Shadow:** `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (soft)
- **Dark Mode:** Class-based (`dark:` prefix)

### Auth Page Design
- Full-screen background image with `bg-black/50` overlay
- Glass card effect: `bg-background-light/90 dark:bg-background-dark/90` with `backdrop-blur-sm`
- Rounded corners: `rounded-xl`
- Shadow: `shadow-soft`

---

## Phase 1: Foundation & Infrastructure Setup

### 1.1 Project Configuration Files
- Create `package.json` with all PRD dependencies (React 18, TypeScript, Vite, TanStack Query, Zustand, React Hook Form, Zod, Recharts, Tailwind, shadcn/ui)
- Create `vite.config.ts` (port 5173, React plugin)
- Create `tsconfig.json` (strict mode, ES2022 target)
- Create `tailwind.config.js` with UI design specifications:
  - Primary color: `#607AFB`
  - Custom color palette (background-light/dark, text-light/dark, subtle-light/dark)
  - Font families: Space Grotesk (display), Inconsolata (branding)
  - Border radius values (0.5rem, 1rem, 1.5rem)
  - Soft shadow
  - Dark mode: class strategy
- Create `postcss.config.js` (Tailwind + Autoprefixer)
- Create `.env.example` with `VITE_API_BASE=http://localhost:8082`
- Create `index.html` with font preconnect links:
  - Space Grotesk and Inconsolata from Google Fonts
- Update `src/index.css` to include:
  - Space Grotesk as default font-family
  - Inconsolata class for branding
  - Tailwind directives
  - Dark mode support

### 1.2 Core API Layer
**File: `src/api/http.ts`**
- Implement `apiFetch` wrapper with `credentials: 'include'`, error handling, automatic JSON parsing
- Export `API_BASE` from env
- Handle network errors gracefully

**File: `src/api/endpoints.ts`**
- TypeScript types for all API responses (Role, Hospital, Patient, Clinician, Appointment, Template, Notification)
- `AuthAPI`: login, logout, refresh
- `SuperAPI`: listHospitals, createHospital, impersonate
- `HospitalAPI`: me, listPatients, createPatient, listClinicians, createClinician, listTemplates, createTemplate, metrics, contactPreferences
- Add appointment endpoints (list, create, update status) - may need backend extension
- Add notification/queue endpoints for Messaging page

### 1.3 State Management
**File: `src/store/auth.ts`**
- Zustand store with user state (role, hospital_id), auth status (idle/loading/authed)
- Actions: login, logout, tryRefresh
- Persist to localStorage for session recovery

**File: `src/store/ui.ts`**
- Zustand store for UI preferences (theme light/dark, sidebar collapsed, notifications)
- Persist theme preference to localStorage

**File: `src/utils/date.ts`**
- Timezone utilities, format helpers using date-fns
- Localize times per hospital timezone

### 1.4 Routing & Guards
**File: `src/routes/ProtectedRoute.tsx`**
- Check auth status, redirect to /login if not authenticated

**File: `src/routes/RoleRoute.tsx`**
- Enforce role-based access (super_admin, hospital_admin)
- Allow super_admin access to hospital routes via impersonation

**Update `src/App.tsx`**
- Wrap with QueryClientProvider
- Implement complete routing structure:
  - Public: `/login`, `/signup`
  - Super Admin: `/super/dashboard`, `/super/hospitals`, `/super/monitoring`, `/super/settings`
  - Hospital Admin: `/hospital/dashboard`, `/hospital/appointments`, `/hospital/patients`, `/hospital/clinicians`, `/hospital/templates`, `/hospital/messaging`, `/hospital/settings`
  - Patient Portal: `/patient/dashboard`, `/patient/appointments`, `/patient/preferences`

---

## Phase 2: Shared Component Library

### 2.1 Layout Components
**File: `src/components/layout/AppShell.tsx`** (enhance existing)
- Left sidebar with role-based navigation
- Top header with user info, logout, theme toggle
- Mobile responsive (hamburger menu)
- Use Space Grotesk for body, Inconsolata for HMSA branding
- Apply UI design colors and styling

**File: `src/components/layout/PageHeader.tsx`**
- Title with breadcrumbs
- Action buttons area (right-aligned)
- Consistent spacing and typography

### 2.2 Form Components
**File: `src/components/forms/TextField.tsx`**
- Input wrapper with label, error display, RHF integration
- Apply UI design styling: `border-subtle-light dark:border-subtle-dark`, `bg-background-light dark:bg-background-dark`
- Focus states: `focus:border-primary focus:ring-primary`

**File: `src/components/forms/Select.tsx`**
- Select dropdown with search capability
- Same styling as TextField

**File: `src/components/forms/DateTimePicker.tsx`**
- Date/time picker using react-day-picker, timezone-aware
- Consistent with form component styling

**File: `src/components/forms/PhoneField.tsx`**
- Phone input with country code selector

**File: `src/components/forms/Form.tsx`**
- Form wrapper using React Hook Form + Zod schema validation
- Consistent spacing: `space-y-4`

### 2.3 Data Display Components
**File: `src/components/tables/DataTable.tsx`**
- TanStack Table wrapper with:
  - Sorting, filtering, pagination
  - Column types (text, badge, date, avatar, actions)
  - Loading and empty states
  - Export to CSV
- Use soft shadows and rounded corners per UI design

**File: `src/components/charts/MiniBar.tsx`**
- Small bar chart component using Recharts
- Use primary color (#607AFB) for bars

**File: `src/components/charts/LineTimeseries.tsx`**
- Time series line chart using Recharts
- Use primary color for lines

**File: `src/components/feedback/Spinner.tsx`**
- Loading spinner with primary color

**File: `src/components/feedback/Toast.tsx`**
- Toast notifications using sonner
- Style with UI design colors

**File: `src/components/feedback/EmptyState.tsx`**
- Empty state with CTA buttons
- Consistent with UI design

**File: `src/components/feedback/ErrorBoundary.tsx`**
- React Error Boundary for graceful error handling

**File: `src/components/modals/Modal.tsx`**
- Dialog component using @radix-ui/react-dialog (shadcn/ui)
- Apply rounded-xl, shadow-soft, backdrop-blur for glass effect
- Background: `bg-background-light/90 dark:bg-background-dark/90`

**File: `src/components/modals/Drawer.tsx`**
- Mobile drawer for forms (using Radix Dialog on mobile)
- Same styling as Modal

---

## Phase 3: Authentication Pages

### 3.1 Login Page
**File: `src/pages/auth/LoginPage.tsx`** (enhance existing)
- Apply UI design: background image with overlay, glass card effect
- Connect to AuthAPI.login
- Update auth store on success
- Redirect based on role: super_admin → `/super/dashboard`, hospital_admin → `/hospital/dashboard`
- Error handling with toast notifications
- Loading states
- Use Space Grotesk for text, Inconsolata for HMSA branding
- Button styling: `bg-primary`, `shadow-soft`, `hover:bg-primary/90`

### 3.2 Signup Page
**File: `src/pages/auth/SignupPage.tsx`** (enhance existing)
- Apply same UI design as Login page
- Note: PRD doesn't specify signup endpoint - either implement backend endpoint or redirect to login with message

---

## Phase 4: Super Admin Pages

### 4.1 Super Admin Dashboard
**File: `src/pages/SuperAdmin/Dashboard.tsx`** (enhance existing)
- Replace mock data with API calls:
  - GET `/api/super/hospitals` for total count
  - GET `/api/super/metrics` (may need backend endpoint) for KPIs
  - Chart: reminders sent over time (cross-tenant)
  - N8N workflow health card (may need backend endpoint)
- Use React Query for data fetching
- Loading and error states
- KPI cards with soft shadow and rounded corners
- Use primary color for icons/charts

### 4.2 Hospitals List Page
**File: `src/pages/SuperAdmin/Hospitals.tsx`** (NEW)
- Table with columns: name, country, timezone, created_at, admins count
- Search/filter by country/timezone
- Pagination
- Actions: "Create Hospital" button (primary color), "Impersonate" per row
- Use DataTable component
- Connect to SuperAPI.listHospitals
- Button styling: `bg-primary text-white shadow-soft`

### 4.3 Create Hospital Page/Modal
**File: `src/pages/SuperAdmin/CreateHospital.tsx`** (enhance existing)
- Connect form to SuperAPI.createHospital
- Form validation with Zod (name*, country, timezone, adminEmail*, adminPassword*)
- Success toast + "Impersonate now" CTA
- Error handling
- Apply UI design form styling

### 4.4 Monitoring Page
**File: `src/pages/SuperAdmin/Monitoring.tsx`** (NEW)
- Outbound Queue overview (cross-tenant)
- Notifications breakdown (channel/provider/status) - table/chart
- N8N health status (last run, errors)
- Real-time updates via polling or WebSocket (future)
- May need backend endpoints: `/api/super/queue`, `/api/super/notifications`, `/api/super/n8n-health`
- Cards with soft shadow

### 4.5 Super Admin Settings
**File: `src/pages/SuperAdmin/Settings.tsx`** (enhance existing)
- Super admin profile form
- Theme toggle (light/dark) - use UI store
- Sign out all sessions button
- Telemetry opt-in toggle
- Consistent form styling

### 4.6 Users Management (if needed)
**File: `src/pages/SuperAdmin/UsersList.tsx`** (enhance existing if exists)
- List all users across hospitals (may need backend endpoint)
- Filter by role, hospital
- Activate/deactivate users

---

## Phase 5: Hospital Admin Pages

### 5.1 Hospital Dashboard
**File: `src/pages/HospitalAdmin/Dashboard.tsx`** (NEW)
- KPIs: appointments today, no-shows this week, reminders sent today, opt-out rate
- Chart: appointments per status (pie/bar chart)
- Card: "Upcoming appointments in next 2 hours" list
- Card: Template coverage (email/SMS availability %)
- Connect to HospitalAPI.metrics
- Use React Query
- KPI cards styled with UI design tokens

### 5.2 Appointments Page
**File: `src/pages/HospitalAdmin/Appointments.tsx`** (NEW)
- Two views: Calendar (day/week) and List
- Calendar view using react-day-picker or fullcalendar-react
- List view: sortable, filterable by status/clinician
- Create Appointment modal/drawer:
  - Patient lookup (search by MRN/email/phone)
  - Date/time picker (timezone-aware)
  - Clinician selector
  - Reason field
- Quick actions: Confirm/Cancel/Mark no-show
- Export CSV button
- May need backend endpoints: `/api/hospitals/:id/appointments` (GET, POST, PATCH)
- Use DataTable component

### 5.3 Patients Page
**File: `src/pages/HospitalAdmin/Patients.tsx`** (NEW)
- Table: MRN, name, email, phone, DOB, created_at
- Search bar (name/email/MRN/phone)
- "Create Patient" button → modal
- Row click → navigate to Patient Profile
- Connect to HospitalAPI.listPatients, createPatient
- Use DataTable component

### 5.4 Patient Profile Page
**File: `src/pages/HospitalAdmin/PatientProfile.tsx`** (NEW)
- Tabs: Demographics, Contact Preferences, Appointments, Health Records, Notes
- Demographics: view/edit patient info
- Contact Preferences: channel opt-in/opt-out (email/sms/voice) with toggles
- Appointments tab: list of patient's appointments
- Health Records: read-only summary (latest diagnoses/tests)
- Notes: simple text area with save
- May need backend endpoints: `/api/hospitals/:id/patients/:patientId`
- Apply UI design card styling

### 5.5 Clinicians Page
**File: `src/pages/HospitalAdmin/Clinicians.tsx`** (NEW)
- Table: name, specialty, email, phone, created_at
- "Add Clinician" button → modal
- Form: name*, specialty, email, phone
- Connect to HospitalAPI.listClinicians, createClinician
- Future: Availability schedule grid (marked as "later" in PRD)
- Use DataTable component

### 5.6 Templates Page
**File: `src/pages/HospitalAdmin/Templates.tsx`** (NEW)
- Table: Name, Channel (email/sms/voice), Active?, Updated
- "Create Template" button → modal/drawer
- Form: name*, channel* (select), subject (email only), body_text*
- Variables helper display: `{patient_first}`, `{clinician_name}`, `{start_time_local}`, `{hospital_name}`
- Preview section showing rendered template with sample data
- Toggle active/inactive
- Connect to HospitalAPI.listTemplates, createTemplate
- Use DataTable component

### 5.7 Messaging Page
**File: `src/pages/HospitalAdmin/Messaging.tsx`** (NEW)
- Two tabs: Outbound Queue, Notifications
- Outbound Queue table: appointment_id, channel, provider, status, attempts, next_retry
- Notifications table: filterable by status/provider/channel/date
- Retry failed button (optional per PRD)
- May need backend endpoints: `/api/hospitals/:id/outbound-queue`, `/api/hospitals/:id/notifications`
- Use DataTable component

### 5.8 Hospital Settings
**File: `src/pages/HospitalAdmin/Settings.tsx`** (NEW)
- Hospital profile form (name, country, timezone) - editable
- Staff accounts section: list users, add new, deactivate
- API keys section (marked "later" in PRD - placeholder)
- Connect to HospitalAPI.me (GET, PATCH)
- Apply UI design form styling

---

## Phase 6: Patient Portal (If Applicable)

### 6.1 Patient Login
**File: `src/pages/Patient/Login.tsx`** (NEW - if patient portal needed)
- Separate login for patients (may need backend endpoint)
- Or access via token/link from appointment reminder
- Apply UI design auth page styling

### 6.2 Patient Dashboard
**File: `src/pages/Patient/Dashboard.tsx`** (NEW)
- Upcoming appointments list
- Recent appointments history
- Quick actions (reschedule, cancel)
- Use UI design card styling

### 6.3 Patient Appointments
**File: `src/pages/Patient/Appointments.tsx`** (NEW)
- List of patient's appointments
- Filter by status, date range
- Details: clinician, time, location, reason

### 6.4 Patient Preferences
**File: `src/pages/Patient/Preferences.tsx`** (NEW)
- Contact preferences: email/SMS/voice opt-in toggles
- Notification settings
- May need backend endpoints: `/api/patients/me/preferences`

---

## Phase 7: Integration & Polish

### 7.1 Connect All Pages to Backend
- Replace all mock data with API calls
- Implement React Query for server state
- Error handling with toasts
- Loading states (skeletons)

### 7.2 Impersonation Flow
- Super Admin → Hospitals list → Impersonate button
- Call SuperAPI.impersonate → update auth store → redirect to Hospital Admin dashboard
- Show "Impersonating as [Hospital]" badge in header
- "Exit Impersonation" button to return to Super Admin

### 7.3 Responsive Design
- Mobile-first approach
- Test on 360px → desktop breakpoints
- Drawer modals on mobile, dialogs on desktop
- Hamburger menu for sidebar on mobile

### 7.4 Accessibility
- Keyboard navigation for all forms/tables
- ARIA labels on interactive elements
- Focus management in modals
- Screen reader testing
- WCAG AA contrast ratios

### 7.5 Performance Optimization
- Code-split routes (React.lazy)
- React Query caching strategies
- Optimistic updates for quick actions
- Image optimization if needed

### 7.6 Error Boundaries
- Wrap major sections in ErrorBoundary
- Fallback UI with error message
- Log errors to monitoring service (future)

### 7.7 Dark Mode Implementation
- Use UI store for theme preference
- Apply `dark:` classes throughout
- Toggle in header/settings
- Persist preference to localStorage

---

## Phase 8: Testing & Documentation

### 8.1 Unit Tests
- Test auth store actions
- Test API helpers
- Test utility functions (date formatting, etc.)

### 8.2 Component Tests
- Test form components with React Testing Library
- Test DataTable with mock data
- Test routing guards

### 8.3 Integration Tests
- Test login flow
- Test create hospital flow
- Test create patient → create appointment flow

### 8.4 Documentation
- Update README with setup instructions
- Document API contracts
- Component usage examples

---

## Backend Endpoints Needed (May Require Backend Updates)

1. `/api/super/metrics` - Super Admin dashboard KPIs
2. `/api/super/queue` - Outbound queue overview
3. `/api/super/notifications` - Cross-tenant notifications
4. `/api/super/n8n-health` - N8N workflow status
5. `/api/hospitals/:id/appointments` - GET, POST, PATCH appointments
6. `/api/hospitals/:id/patients/:patientId` - GET, PATCH patient profile
7. `/api/hospitals/:id/outbound-queue` - Outbound queue for hospital
8. `/api/hospitals/:id/notifications` - Notifications history
9. `/api/hospitals/:id/staff` - Staff management (may exist)
10. Patient portal endpoints (if implementing patient portal)

---

## File Structure (Final)

```
frontend/
├── src/
│   ├── api/
│   │   ├── http.ts
│   │   └── endpoints.ts
│   ├── store/
│   │   ├── auth.ts
│   │   └── ui.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── forms/
│   │   │   ├── TextField.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DateTimePicker.tsx
│   │   │   ├── PhoneField.tsx
│   │   │   └── Form.tsx
│   │   ├── tables/
│   │   │   └── DataTable.tsx
│   │   ├── charts/
│   │   │   ├── MiniBar.tsx
│   │   │   └── LineTimeseries.tsx
│   │   ├── feedback/
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── modals/
│   │   │   ├── Modal.tsx
│   │   │   └── Drawer.tsx
│   │   └── ProfilePicture.tsx (existing)
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx (enhance)
│   │   │   └── SignupPage.tsx (enhance)
│   │   ├── SuperAdmin/
│   │   │   ├── Dashboard.tsx (enhance)
│   │   │   ├── Hospitals.tsx (NEW)
│   │   │   ├── CreateHospital.tsx (enhance)
│   │   │   ├── Monitoring.tsx (NEW)
│   │   │   ├── Settings.tsx (enhance)
│   │   │   ├── UsersList.tsx (enhance if exists)
│   │   │   ├── UsersMonitoring.tsx (if needed)
│   │   │   └── UsersRoles.tsx (if needed)
│   │   ├── HospitalAdmin/
│   │   │   ├── Dashboard.tsx (NEW)
│   │   │   ├── Appointments.tsx (NEW)
│   │   │   ├── Patients.tsx (NEW)
│   │   │   ├── PatientProfile.tsx (NEW)
│   │   │   ├── Clinicians.tsx (NEW)
│   │   │   ├── Templates.tsx (NEW)
│   │   │   ├── Messaging.tsx (NEW)
│   │   │   └── Settings.tsx (NEW)
│   │   └── Patient/ (if implementing patient portal)
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Appointments.tsx
│   │       └── Preferences.tsx
│   ├── utils/
│   │   └── date.ts
│   ├── App.tsx (update routing)
│   ├── main.tsx (add QueryClientProvider)
│   ├── index.css (update with fonts and Tailwind)
│   └── App.css (keep existing)
├── package.json (create)
├── vite.config.ts (create)
├── tsconfig.json (create)
├── tailwind.config.js (create with UI design specs)
├── postcss.config.js (create)
├── .env.example (create)
└── index.html (create/update with font links)
```

---

## Dependencies to Install

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-table": "^8.12.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.441.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
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
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.1"
  }
}
```

---

## Implementation Order Recommendation

1. **Week 1**: Phase 1 (Foundation) + Phase 2 (Component Library basics)
2. **Week 2**: Phase 3 (Auth) + Phase 4 (Super Admin pages)
3. **Week 3**: Phase 5 (Hospital Admin pages - core: Dashboard, Patients, Clinicians)
4. **Week 4**: Phase 5 (Hospital Admin pages - advanced: Appointments, Templates, Messaging)
5. **Week 5**: Phase 6 (Patient Portal if needed) + Phase 7 (Integration & Polish)
6. **Week 6**: Phase 8 (Testing & Documentation)

---

## Key Design Principles

1. **Consistency**: All components must follow UI_style_design.prd specifications
2. **Color Usage**: Primary color (#607AFB) for CTAs, accents, and interactive elements
3. **Typography**: Space Grotesk for body text, Inconsolata for HMSA branding
4. **Shadows**: Use soft shadow (`shadow-soft`) for cards and modals
5. **Border Radius**: Consistent use of 0.5rem, 1rem, 1.5rem based on component size
6. **Dark Mode**: Full support with class-based switching
7. **Glass Effect**: Use backdrop-blur and semi-transparent backgrounds for auth pages and modals
8. **Responsive**: Mobile-first approach, test 360px to desktop

---

## Notes

- **Color Discrepancy**: PRD mentioned #145D8F but UI design specifies #607AFB - use #607AFB from UI design
- **Font Discrepancy**: PRD mentioned Saira font, but UI design uses Space Grotesk and Inconsolata - use UI design fonts
- Backend endpoints may need to be created for some features (appointments CRUD, notifications, queue)
- N8N integration is backend-driven; frontend only displays status
- Patient Portal is optional - clarify if needed
- All forms must use React Hook Form + Zod validation
- All API calls must include `credentials: 'include'` for cookie auth
- Timezone handling is critical - store UTC, display in hospital timezone
- Always reference this document when building new features to maintain consistency

---

## Change Log

- **v1.0 (2024)**: Initial comprehensive plan created
- Incorporates UI_style_design.prd specifications
- Includes all phases from foundation to testing

