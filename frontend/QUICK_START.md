# Quick Start - Mock API Mode

## ✅ NO Backend Required!

**You do NOT need to start the backend server to use mock mode.**

Mock API mode allows you to develop the frontend UI completely independently without any backend, database, or Docker setup.

## Steps to Login with Mock Mode

### 1. Verify `.env.local` exists and is correct

Make sure `frontend/.env.local` contains:
```
VITE_USE_MOCK_API=true
```

**No spaces, no quotes, just exactly:** `VITE_USE_MOCK_API=true`

### 2. Restart Dev Server

**IMPORTANT:** Vite must be restarted to pick up environment variables!

```bash
# Stop current server (Ctrl+C)
# Then start again:
cd frontend
npm run dev
```

### 3. Check Browser Console

When the page loads, you should see:
```
==================================================
[API Config] Environment check:
  VITE_USE_MOCK_API (raw): true string
  USE_MOCK_API (resolved): true
  API Base: http://localhost:8082
  All env vars: ['VITE_USE_MOCK_API', ...]
==================================================
```

### 4. Login with ANY Credentials

- **Email:** Any email (e.g., `test@example.com`, `kingsw12@gmail.com`)
- **Password:** Any password (e.g., `password123`, `test123`)
- **Mock mode accepts ALL credentials!**

### 5. Watch Console During Login

When you click "Sign In", you should see:
```
[LoginPage] Attempting login with: { email: 'test@example.com' }
[Mock API] Routing request: { path: '/api/auth/login', method: 'POST', ... }
[Mock API] Handling login request
[Mock API] Login result: { ok: true, role: 'super_admin' }
[LoginPage] Login successful, user: { role: 'super_admin', hospital_id: null }
[LoginPage] Navigating to super admin dashboard
```

## Troubleshooting

### If you see "Mock Mode: false" in console:

1. **Check `.env.local` file:**
   - Must be in `frontend/` directory (not root)
   - Must be exactly: `VITE_USE_MOCK_API=true` (no spaces before)
   - No quotes, no semicolons

2. **Restart dev server completely:**
   ```bash
   # Stop server (Ctrl+C)
   # Wait 2 seconds
   # Start again:
   npm run dev
   ```

3. **Hard refresh browser:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### If no console logs appear at all:

1. **Check if dev server is running:**
   - Should see Vite server running on `http://localhost:5173`
   - Check terminal for any errors

2. **Verify you're on the right URL:**
   - Should be `http://localhost:5173/login`
   - Not a cached version

3. **Clear browser cache and storage:**
   - Open DevTools (F12)
   - Application tab → Clear Storage
   - Refresh page

## What to Expect

### ✅ Mock Mode Working:
- Console shows `[API Config] Mock Mode: true`
- No network requests in Network tab (or only to mock)
- Login works with any credentials
- Navigation to dashboard works

### ❌ Mock Mode NOT Working:
- Console shows `[API Config] Mock Mode: false`
- Network requests to `localhost:8082` fail
- Login fails with network errors
- Need to start backend server

## Summary

**Mock Mode = No Backend Needed!**

- ✅ No backend server
- ✅ No database
- ✅ No Docker
- ✅ Just frontend development

Switch to real backend later when ready!

