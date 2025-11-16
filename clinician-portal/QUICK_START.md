# HMSA Clinician Portal - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd clinician-portal
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The portal will be available at: **http://localhost:5175**

### 3. Test the Application

#### Default Test Credentials
- **Email**: `doctor@hospital.com` (or any valid email)
- **Password**: `password` (or any 4+ character password)

## 📝 Testing the Complete Flow

### Step 1: Login
1. Open http://localhost:5175
2. Enter email and password
3. Click "Sign In"

### Step 2: Change Password
You'll be redirected to the password change page.

**Requirements:**
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

**Example valid password**: `MyPassword123!`

1. Enter current password (same as login)
2. Enter new password meeting requirements
3. Confirm new password
4. Click "Change Password"

### Step 3: Complete Onboarding
Navigate through 7 steps:

1. **Welcome** - Introduction screen
2. **Personal Information** - Pre-filled with your data, you can edit
3. **Professional Information** - Add specialty, qualifications, etc.
4. **Documents** - Optional, can upload later in Settings
5. **Availability** - Set your weekly schedule
6. **App Tour** - Optionally enable tour (checkbox)
7. **Complete** - Click "Get Started"

### Step 4: Explore Dashboard
After onboarding, you'll see:
- KPI cards (appointments, patients, earnings)
- Today's schedule
- Quick actions menu
- Team updates

## 🎯 Features to Test

### Navigation
- Click through sidebar menu items
- Try mobile view (responsive hamburger menu)
- Test dark mode toggle (top-right or profile dropdown)

### Dashboard
- View KPI cards with live data
- See today's appointments
- Use quick action buttons

### Permission-Based Access
The Patients menu is visible for:
- Users with role: `clinician` or `nurse`
- Users with permission: `Patient Management`

To test permission restrictions:
- The current mock user is a clinician, so Patients menu is visible
- Other roles would not see this menu

## 🔧 Mock Data Available

The application includes:
- **User**: Dr. Sarah Johnson (Clinician)
- **Appointments**: 3 sample appointments
- **Patients**: 3 sample patients
- **Earnings**: Sample earnings data
- **Permissions**: Patient Management, Appointments, Medical Records

## 📱 Responsive Testing

Test on different screen sizes:
- **Mobile**: 360px - 767px (hamburger menu)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (full sidebar)

## 🎨 Dark Mode

Toggle dark mode via:
1. Top-right icon (desktop)
2. Profile dropdown → Dark Mode button
3. Theme persists across sessions

## 🔐 Security Features in Action

### Password Change
- Try entering a weak password → see validation errors
- Password strength indicator updates in real-time
- Cannot proceed without meeting all requirements

### Protected Routes
- Try accessing `/dashboard` without login → redirected to login
- Try accessing `/patients` as a receptionist role → menu hidden

### Onboarding
- Cannot skip onboarding steps
- Progress is saved if you refresh
- Must complete before accessing main app

## 🛠️ Development Tips

### Mock API
- Mock data is in `src/api/mock.ts`
- Simulate network delays (500ms on login, 300ms on data fetch)
- Edit mock data to test different scenarios

### State Management
- Auth state persists in localStorage
- Clear storage to reset: `localStorage.clear()`
- Zustand DevTools available in browser

### Debugging
- Console logs show API routing in `http.ts`
- Toast notifications for all actions
- React Query DevTools (if enabled)

## 📊 Test Scenarios

### Scenario 1: First-Time User
1. Login with new credentials
2. Forced to change password
3. Complete 7-step onboarding
4. Access dashboard

### Scenario 2: Returning User
1. Login (no password change needed)
2. Skip onboarding (already complete)
3. Direct to dashboard

### Scenario 3: Role-Based Access
1. Login as clinician → see Patients menu
2. Login as receptionist → no Patients menu
3. All other features available

## 🎉 What's Working

✅ Complete authentication flow  
✅ Password validation and strength meter  
✅ 7-step onboarding wizard  
✅ Dashboard with live data  
✅ Role-based navigation  
✅ Permission checks  
✅ Dark mode  
✅ Responsive design  
✅ Toast notifications  
✅ Loading states  
✅ Error handling  

## 🚦 Ports

- **Clinician Portal**: http://localhost:5175 (this app)
- **Hospital Admin**: http://localhost:5174
- **Super Admin**: http://localhost:5173
- **Backend API**: http://localhost:8082

## 💡 Tips

1. **Refresh Issues?** Clear localStorage and try again
2. **Can't login?** Any email + 4+ char password works in mock mode
3. **No data showing?** Check browser console for API routing logs
4. **Dark mode not working?** Try toggling from profile dropdown

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5175 (Windows)
npx kill-port 5175

# Or change port in vite.config.ts
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check TypeScript
npm run build

# Fix linting
npm run lint
```

## 📚 Next Steps

1. Explore the dashboard and navigation
2. Test the onboarding flow completely
3. Try different screen sizes
4. Toggle dark/light mode
5. Check the implementation summary: `IMPLEMENTATION_SUMMARY.md`

---

**Ready to go?** Run `npm run dev` and visit http://localhost:5175!

