# HMSA Hospital Admin Application

Hospital Admin frontend application for the Hospital Management System Admin (HMSA) platform. This is a separate application from the Super Admin app, running on port 5174.

## Overview

The Hospital Admin application provides a comprehensive interface for hospital administrators to manage:
- **Dashboard**: KPIs, metrics, and overview
- **Appointments**: Calendar and list views with scheduling
- **Patients**: Patient management and profiles
- **Clinicians**: Staff management
- **Templates**: Message templates for reminders
- **Messaging**: Outbound queue and notifications
- **Settings**: Hospital profile and preferences
- **Billings**: Financial management and reports

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS (Mobile-First Responsive)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Material Symbols
- **Notifications**: Sonner (toasts)

## 📱 Mobile Optimization

The Hospital Admin app is **fully optimized for mobile devices, tablets, and desktops**. Key features:

- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Touch-Friendly**: 44x44px minimum touch targets
- ✅ **iOS Compatibility**: 16px minimum font size (prevents unwanted zoom)
- ✅ **Mobile Navigation**: Hamburger menu and collapsible sidebar
- ✅ **Optimized Forms**: Full-width inputs on mobile
- ✅ **Scrollable Tables**: Horizontal scroll for wide data tables
- ✅ **Adaptive Modals**: Full-screen and scrollable on small screens

**Supported Devices:**
- 📱 Mobile Phones (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktops (1024px+)

For detailed mobile optimization information, see:
- [`MOBILE_OPTIMIZATION.md`](./MOBILE_OPTIMIZATION.md) - Comprehensive guide
- [`MOBILE_TESTING_GUIDE.md`](./MOBILE_TESTING_GUIDE.md) - Testing procedures
- [`MOBILE_OPTIMIZATION_SUMMARY.md`](./MOBILE_OPTIMIZATION_SUMMARY.md) - Implementation summary

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running at `http://localhost:8082` (or configure via `.env`)
- Super Admin app running at `http://localhost:5173` (for impersonation flow)

## Setup Instructions

### 1. Install Dependencies

```bash
cd hospital-admin
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `hospital-admin` directory:

```env
VITE_API_BASE=http://localhost:8082
VITE_USE_MOCK_API=true
```

**Note**: Currently using mock API for development. Set `VITE_USE_MOCK_API=false` when connecting to real backend.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5174**

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
hospital-admin/
├── src/
│   ├── api/                    # API layer
│   │   ├── http.ts             # HTTP client with mock routing
│   │   ├── endpoints.ts        # API endpoint definitions
│   │   └── mock.ts             # Mock data and API implementations
│   │
│   ├── store/                  # Zustand state management
│   │   ├── auth.ts             # Authentication state
│   │   ├── profile.ts         # User profile state
│   │   ├── ui.ts               # UI preferences (theme, sidebar)
│   │   ├── notifications.ts    # In-app notifications
│   │   └── twoFactor.ts        # 2FA state
│   │
│   ├── routes/                  # Route guards
│   │   ├── ProtectedRoute.tsx  # Auth protection
│   │   ├── RoleRoute.tsx       # Role-based access
│   │   └── PassThroughRoute.tsx # Dev mode bypass
│   │
│   ├── components/              # Reusable components
│   │   ├── layout/             # Layout components
│   │   │   ├── AppShell.tsx   # Main app shell (sidebar, header)
│   │   │   └── PageHeader.tsx # Page header component
│   │   ├── forms/              # Form components
│   │   │   ├── TextField.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DateTimePicker.tsx
│   │   │   ├── PhoneField.tsx
│   │   │   ├── PasswordField.tsx
│   │   │   └── Form.tsx
│   │   ├── tables/             # Table components
│   │   │   └── DataTable.tsx
│   │   ├── charts/              # Chart components
│   │   │   ├── MiniBar.tsx
│   │   │   ├── LineTimeseries.tsx
│   │   │   └── PieChart.tsx
│   │   ├── feedback/            # Feedback components
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── modals/              # Modal/Drawer components
│   │   │   ├── Modal.tsx
│   │   │   └── Drawer.tsx
│   │   └── NotificationBell.tsx # Notification bell component
│   │
│   ├── pages/                   # Page components
│   │   ├── auth/                # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   └── HospitalAdmin/       # Hospital Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── Appointments.tsx
│   │       ├── Patients.tsx
│   │       ├── PatientProfile.tsx
│   │       ├── Clinicians.tsx
│   │       ├── Templates.tsx
│   │       ├── Messaging.tsx
│   │       ├── Settings.tsx
│   │       └── Billings.tsx
│   │
│   ├── utils/                    # Utility functions
│   │   └── date.ts              # Date/time utilities
│   │
│   ├── App.tsx                   # Main app component (routing)
│   ├── main.tsx                  # App entry point
│   ├── index.css                 # Global styles
│   └── App.css                   # App-specific styles
│
├── public/                       # Static assets
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration (port 5174)
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── README.md                     # This file
```

## Key Features

### Authentication
- Cookie-based authentication (JWT)
- Automatic token refresh
- Session persistence
- Impersonation support from Super Admin

### State Management
- **Auth Store**: User authentication state
- **Profile Store**: User profile data (name, email, picture)
- **UI Store**: Theme preferences, sidebar state
- **Notifications Store**: In-app notifications
- All stores use Zustand with localStorage persistence

### API Integration
- Mock API mode for development (default)
- Real API mode for production
- Automatic error handling
- Request/response interceptors

### Design System
- **Primary Color**: `#607AFB`
- **Fonts**: Saira (body), Inconsolata (branding)
- **Dark Mode**: Full support with class-based switching
- **Responsive**: Mobile-first design (360px → desktop)

## Development Workflow

### Adding a New Page

1. Create page component in `src/pages/HospitalAdmin/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/AppShell.tsx`
4. Create API endpoints in `src/api/endpoints.ts` (if needed)
5. Add mock data in `src/api/mock.ts` (if needed)

### Adding a New Component

1. Create component in appropriate `src/components/` subdirectory
2. Follow existing component patterns
3. Use Tailwind classes matching design system
4. Support dark mode with `dark:` classes
5. Make responsive for mobile/tablet/desktop

### API Integration

1. Define types in `src/api/endpoints.ts`
2. Add endpoint function in `HospitalAPI` object
3. Add mock implementation in `src/api/mock.ts`
4. Use in components with React Query:

```tsx
import { useQuery } from '@tanstack/react-query';
import { HospitalAPI } from '../api/endpoints';

const { data, isLoading } = useQuery({
  queryKey: ['patients', hospitalId],
  queryFn: () => HospitalAPI.listPatients(hospitalId),
});
```

## Impersonation Flow

When a Super Admin impersonates a hospital:

1. Super Admin clicks "Impersonate" in Hospitals list
2. Backend sets impersonation cookies
3. Frontend redirects to `http://localhost:5174/hospital/dashboard`
4. Hospital Admin app reads cookies and authenticates
5. User sees Hospital Admin interface

**Note**: Ensure CORS is configured on backend to allow `http://localhost:5174`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API base URL | `http://localhost:8082` |
| `VITE_USE_MOCK_API` | Enable mock API mode | `true` |

## Available Scripts

- `npm run dev` - Start development server (port 5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use

If port 5174 is already in use, update `vite.config.ts`:

```ts
server: {
  port: 5175, // or another available port
  strictPort: true
}
```

### CORS Errors

Ensure backend CORS configuration includes:
- `http://localhost:5174` in allowed origins
- `credentials: true` for cookie-based auth

### Mock API Not Working

Check that `VITE_USE_MOCK_API=true` in `.env` file.

### Theme Not Persisting

Ensure Zustand persist middleware is working. Check browser localStorage for `hospital-ui-storage`.

## Contributing

1. Follow existing code patterns
2. Use TypeScript for all new files
3. Maintain design system consistency
4. Write responsive, mobile-first code
5. Support dark mode
6. Add error handling and loading states
7. Use React Query for data fetching

## Related Documentation

- [Super Admin App README](../frontend/README.md)
- [PRD Documentation](../frontend/PRD.md)
- [Implementation Plan](../hmsa-front-end-complete.implementation.plan.md)

## License

Proprietary - Hospital Management System Admin

