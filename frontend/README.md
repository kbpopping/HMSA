# HMSA Frontend

React + TypeScript frontend for the Hospital Management System Admin (HMSA) application.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## Installation

```bash
cd frontend
npm install
```

## Development Mode

### Option 1: Mock API Mode (No Backend Required) ⭐ Recommended for UI Development

This mode allows you to build and test the frontend UI without needing a running backend server or database.

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Verify mock mode is enabled** in `.env.local`:
   ```env
   VITE_USE_MOCK_API=true
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open http://localhost:5173
   - **Login:** Use any email and password (mock mode accepts all credentials)
   - Email containing "hospital" or "admin" will log you in as `hospital_admin`
   - Any other email will log you in as `super_admin`

### Option 2: Real Backend Mode (Full Integration)

Use this when you want to test with the actual backend API.

1. **Update `.env.local`:**
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE=http://localhost:8082
   ```

2. **Start the backend server** (see `../Backend/README.md`):
   ```bash
   cd ../Backend
   npm start
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Switching Between Mock and Real API

### To Use Mock API (No Backend):
1. Edit `frontend/.env.local`
2. Set `VITE_USE_MOCK_API=true`
3. Restart the dev server (`npm run dev`)

### To Use Real Backend:
1. Make sure backend server is running (see `../Backend/README.md`)
2. Edit `frontend/.env.local`
3. Set `VITE_USE_MOCK_API=false`
4. Set `VITE_API_BASE=http://localhost:8082` (or your backend URL)
5. Restart the dev server

## Environment Variables

Create a `.env.local` file in the `frontend` directory with:

```env
# Enable/disable mock API mode
VITE_USE_MOCK_API=true

# Backend API URL (only used when mock mode is disabled)
VITE_API_BASE=http://localhost:8082
```

**Note:** `.env.local` is git-ignored and won't be committed to the repository.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library (Radix primitives)
- **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API clients and mock data
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── routes/        # Route guards and protected routes
│   ├── store/         # Zustand stores (auth, UI state)
│   └── main.tsx       # App entry point
├── public/            # Static assets
└── .env.local         # Environment variables (git-ignored)
```

## Mock API Features

When `VITE_USE_MOCK_API=true`, the frontend uses mock data that:
- ✅ Accepts any login credentials
- ✅ Returns realistic mock data for all API endpoints
- ✅ Simulates network delays
- ✅ Supports CRUD operations (data persists in memory during session)
- ✅ Matches the real API structure exactly

### Mock Data Includes:
- 3 sample hospitals
- Sample patients
- Sample clinicians
- Mock metrics and dashboard data

## Troubleshooting

### Issue: "Cannot connect to backend"

**If using Mock Mode:**
- Verify `VITE_USE_MOCK_API=true` in `.env.local`
- Restart the dev server

**If using Real Backend:**
- Verify backend server is running on `http://localhost:8082`
- Check `VITE_USE_MOCK_API=false` in `.env.local`
- Check `VITE_API_BASE` matches your backend URL

### Issue: "Login fails"

**In Mock Mode:**
- Mock mode accepts ANY email and password
- If login still fails, check browser console for errors

**In Real Backend Mode:**
- Verify backend server is running
- Check backend logs for errors
- Use correct credentials (see `../Backend/README.md`)

### Issue: "Page not found after login"

- Check browser console for routing errors
- Verify routes in `src/App.tsx` match your navigation
- In mock mode, ensure user role is set correctly (check `src/api/mock.ts`)

## Development Workflow

1. **UI Development Phase** (Mock Mode):
   - Set `VITE_USE_MOCK_API=true`
   - Build all UI components and pages
   - Test user flows and interactions
   - No backend or database required

2. **Integration Phase** (Real Backend):
   - Set up backend server (see `../Backend/README.md`)
   - Set `VITE_USE_MOCK_API=false`
   - Test API integration
   - Fix any integration issues

3. **Production Deployment**:
   - Build with `npm run build`
   - Deploy to your hosting platform
   - Configure environment variables in your hosting platform

## Further Documentation

- Backend setup: See `../Backend/README.md`
- Docker setup: See `../Backend/DOCKER_SETUP.md`
- Product requirements: See `PRD.md`
- UI design guide: See `UI_style_design. prd`

