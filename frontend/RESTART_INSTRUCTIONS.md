# 🔄 Complete Restart Instructions

## Step-by-Step: Fix Login with Mock API

### Step 1: Stop Dev Server
- Press `Ctrl+C` in the terminal where `npm run dev` is running
- Wait until it's fully stopped

### Step 2: Clear All Caches

```powershell
# In frontend directory
cd frontend

# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

# Clear browser cache (or do this manually in browser)
# Chrome/Edge: Ctrl+Shift+Delete → Clear cached images and files
```

### Step 3: Verify .env.local

```powershell
# Check file exists and has correct content
Get-Content .env.local
```

Should show exactly:
```
VITE_USE_MOCK_API=true
```

**NO spaces before, NO quotes, NO semicolons**

### Step 4: Start Dev Server Fresh

```powershell
npm run dev
```

Wait until you see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 5: Open Browser

1. Open a **NEW Incognito/Private window** (to avoid cache)
2. Go to: `http://localhost:5173/login`
3. Open DevTools (F12) → Console tab

### Step 6: Check Console

You should **immediately** see these logs when page loads:

```
🚀 [main.tsx] App starting...
🚀 [http.ts] Module loaded!
🚀 [http.ts] Mock API check:
  VITE_USE_MOCK_API (raw): true string
  USE_MOCK_API (resolved): true
  API Base: http://localhost:8082
==================================================
```

### Step 7: Try Login

1. Enter any email: `test@example.com`
2. Enter any password: `password123`
3. Click "Sign In"
4. **Watch console** - you should see:

```
🚀 [LoginPage] Form submitted! {email: 'test@example.com', password: 'password123'}
🚀 [LoginPage] Attempting login with: {email: 'test@example.com'}
[Mock API] Routing request: {path: '/api/auth/login', method: 'POST', ...}
[Mock API] Handling login request
[Mock API] Login result: {ok: true, role: 'super_admin'}
[LoginPage] Login successful, user: {role: 'super_admin', hospital_id: null}
[LoginPage] Navigating to super admin dashboard
```

## If Still No Logs Appear

### Check 1: Is dev server actually running?
- Look at terminal - should show Vite server info
- Try accessing `http://localhost:5173` directly

### Check 2: Are files saved?
- Check `src/api/http.ts` - should have `🚀 [http.ts] Module loaded!` at top
- Check `src/pages/LoginPage.tsx` - should have `🚀 [LoginPage] Form submitted!`

### Check 3: Browser issue?
- Try a different browser
- Try incognito/private mode
- Disable browser extensions

### Check 4: Port conflict?
- Make sure port 5173 is available
- Check if another dev server is running

## Emergency Fallback

If nothing works, we can hardcode mock mode temporarily:

```typescript
// In src/api/http.ts, change line 6 to:
const USE_MOCK_API = true; // Force enabled
```

This bypasses environment variable entirely.

