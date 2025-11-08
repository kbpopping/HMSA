# Troubleshooting Login Issues with Mock API

If you're having trouble logging in with Mock API mode enabled, follow these steps:

## Step 1: Verify Environment Variable

1. **Check `.env.local` exists and has correct value:**
   ```bash
   # In frontend directory
   cat .env.local
   ```
   
   Should show:
   ```
   VITE_USE_MOCK_API=true
   ```

2. **If missing or incorrect:**
   - Create/update `.env.local` file
   - Set `VITE_USE_MOCK_API=true`
   - **IMPORTANT:** Restart the dev server after changing `.env.local`

## Step 2: Restart Dev Server

**Vite requires a restart to pick up environment variables!**

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 3: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for these messages:
   - `[API Config] Mock Mode: true` ✅ (Should be true)
   - `[Mock API] Routing request: ...` ✅ (Should appear on login)
   - `[Mock API] Login result: ...` ✅ (Should show success)

## Step 4: Test Login

1. Go to login page
2. Enter **ANY** email and password (e.g., `test@example.com` / `password123`)
3. Click "Sign In"
4. Check console for:
   - `[LoginPage] Attempting login with: ...`
   - `[Mock API] Routing request: ...`
   - `[Mock API] Login result: ...`
   - `[LoginPage] Login successful, user: ...`
   - `[LoginPage] Navigating to super admin dashboard`

## Common Issues

### Issue: Still trying to connect to backend

**Solution:**
- Verify `VITE_USE_MOCK_API=true` (not `True` or `TRUE`)
- Restart dev server completely
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Console shows "Mock Mode: false"

**Solution:**
- `.env.local` file might not be in the correct location (`frontend/.env.local`)
- Environment variable might be misspelled
- Restart dev server

### Issue: Login succeeds but doesn't navigate

**Solution:**
- Check browser console for navigation logs
- Verify routes are correctly set up in `src/App.tsx`
- Check if ProtectedRoute is blocking navigation

### Issue: "Cannot read property of undefined" errors

**Solution:**
- Make sure all mock API handlers are properly implemented
- Check console for which endpoint is failing
- Verify mock data structure matches expected API response

## Quick Test

Run this in browser console after page loads:

```javascript
console.log('Mock Mode:', import.meta.env.VITE_USE_MOCK_API);
```

Should output: `Mock Mode: true`

## Still Having Issues?

1. **Clear browser storage:**
   - Open DevTools → Application → Storage
   - Clear Local Storage (especially `auth-storage`)
   - Refresh page

2. **Check for errors:**
   - Look for red error messages in console
   - Check Network tab for failed requests
   - Verify no CORS errors

3. **Verify files:**
   - `src/api/mock.ts` exists
   - `src/api/http.ts` has mock routing logic
   - `.env.local` is in `frontend/` directory

## Need Help?

Check these files for reference:
- `MOCK_API_GUIDE.md` - Complete mock API guide
- `README.md` - Frontend setup instructions
- Browser console logs - Detailed debugging info

