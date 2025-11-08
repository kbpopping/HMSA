# Development Mode - Authentication Disabled

## Current Status

Authentication has been **temporarily disabled** to allow UI development and testing without login requirements.

## What This Means

- ✅ All routes are accessible directly via URL
- ✅ No login required to access any page
- ✅ Root URL (`/`) redirects to `/super/dashboard`
- ✅ AppShell displays mock user data (Super Admin)
- ✅ Navigation works for all pages

## How to Access Pages

Simply navigate directly to any route:
- `/super/dashboard` - Super Admin Dashboard
- `/super/hospitals` - Hospitals Page
- `/super/users` - Users Page
- `/super/settings` - Settings Page
- `/super/create-hospital` - Create Hospital
- `/super/users-roles` - Users & Roles
- `/hospital/dashboard` - Hospital Admin Dashboard

## Re-enabling Authentication

When ready to re-enable authentication:

1. **Update `frontend/src/App.tsx`:**
   - Replace `PassThroughRoute` with `ProtectedRoute`
   - Add `RoleRoute` wrappers for role-based access
   - Change root redirect from `/super/dashboard` to `/login`

2. **Update `frontend/src/components/layout/AppShell.tsx`:**
   - Import `useAuth` from `'../../store/auth'`
   - Replace mock user data with `user` from auth store
   - Update `handleLogout` to call `logout()` and navigate to `/login`

3. **Test authentication flow:**
   - Verify login page works
   - Test role-based routing
   - Ensure ProtectedRoute redirects work

## Files Modified

- `frontend/src/routes/PassThroughRoute.tsx` - Simple route bypass component
- `frontend/src/App.tsx` - Removed auth guards, updated redirects
- `frontend/src/components/layout/AppShell.tsx` - Uses mock user instead of auth store
- `frontend/src/config/dev.ts` - Dev mode flag (for future use)

## Benefits

- ✅ Build UI features without authentication blocking
- ✅ Test all pages and components directly
- ✅ Faster development iteration
- ✅ Easy to toggle auth back on later

