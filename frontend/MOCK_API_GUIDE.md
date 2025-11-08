# Mock API Mode - Quick Reference Guide

This guide explains how to use the Mock API mode for frontend development without requiring a backend server or database.

## What is Mock API Mode?

Mock API Mode allows you to develop and test the frontend UI without connecting to a real backend server. All API calls are intercepted and return realistic mock data.

## Quick Start

### Enable Mock Mode

1. **Create `.env.local` file** in the `frontend` directory:
   ```env
   VITE_USE_MOCK_API=true
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Login with any credentials:**
   - Email: Any email (e.g., `test@example.com`)
   - Password: Any password (e.g., `password123`)
   - Mock mode accepts ALL credentials

### Disable Mock Mode (Use Real Backend)

1. **Update `.env.local`:**
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE=http://localhost:8082
   ```

2. **Ensure backend server is running** (see `../Backend/README.md`)

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Mock Data Features

When Mock Mode is enabled, you get:

### Authentication
- ✅ Accepts any email/password combination
- ✅ Email containing "hospital" or "admin" → logs in as `hospital_admin`
- ✅ Other emails → logs in as `super_admin`

### Mock Data Includes:
- **3 Sample Hospitals:** Demo General Hospital, City Medical Center, Regional Health Clinic
- **3 Sample Patients:** John Doe, Jane Smith, Michael Johnson
- **3 Sample Clinicians:** Dr. Emily Carter, Dr. Michael Brown, Dr. Sarah Williams
- **Dashboard Metrics:** Realistic appointment and notification data

### CRUD Operations
- ✅ Create operations (hospitals, patients, clinicians) persist in memory during session
- ✅ List operations return mock data
- ✅ Search functionality works with mock data
- ⚠️ Data resets when you refresh the page (in-memory storage)

## Testing Different User Roles

### Super Admin
- Login with: `superadmin@test.com` (or any email)
- Access to: All super admin pages
- Can view: All hospitals, users, system settings

### Hospital Admin
- Login with: `hospital@test.com` or `admin@test.com` (emails containing "hospital" or "admin")
- Access to: Hospital admin pages
- Can view: Hospital-specific data

## Switching Between Modes

### Scenario: Developing UI First

1. **Start with Mock Mode:**
   ```env
   VITE_USE_MOCK_API=true
   ```
   - Build all UI components
   - Test user flows
   - Verify designs and interactions

2. **Switch to Real Backend when ready:**
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE=http://localhost:8082
   ```
   - Test with real data
   - Verify API integration
   - Fix any integration issues
## Troubleshooting

### Issue: Mock mode not working
- ✅ Verify `.env.local` exists and has `VITE_USE_MOCK_API=true`
- ✅ Restart the dev server after changing `.env.local`
- ✅ Check browser console for errors

### Issue: Still trying to connect to backend
- ✅ Ensure `VITE_USE_MOCK_API=true` (check spelling: it's `true` not `True`)
- ✅ Restart dev server completely
- ✅ Clear browser cache

### Issue: Login not working
- ✅ In mock mode, ANY credentials should work
- ✅ Check browser console for errors
- ✅ Verify routes are correctly configured

## File Locations

- **Mock API Implementation:** `src/api/mock.ts`
- **HTTP Client (with routing):** `src/api/http.ts`
- **Environment Config:** `.env.local` (create from `.env.example`)

## Benefits

✅ **No Backend Required** - Develop UI independently  
✅ **Fast Iteration** - No network delays  
✅ **Realistic Data** - Mock responses match real API structure  
✅ **Easy Testing** - Test different scenarios without backend setup  
✅ **Isolated Development** - Frontend and backend teams can work independently  

## Next Steps

Once you're ready to connect to the real backend:
1. See `../Backend/README.md` for backend setup
2. See `../Backend/DOCKER_SETUP.md` for Docker setup
3. Update `.env.local` to disable mock mode
4. Start backend server and test integration

