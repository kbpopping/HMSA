import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import FirstLoginRoute from './routes/FirstLoginRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes (authenticated) */}
        <Route element={<ProtectedRoute />}>
          {/* Password change required before accessing other routes */}
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          {/* Onboarding route - accessible after password change */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          {/* Routes that require password change and onboarding to be complete */}
          <Route element={<FirstLoginRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<div className="p-6"><h1 className="text-2xl">Appointments - Coming Soon</h1></div>} />
            <Route path="/schedule" element={<div className="p-6"><h1 className="text-2xl">Schedule - Coming Soon</h1></div>} />
            <Route path="/patients" element={<div className="p-6"><h1 className="text-2xl">Patients - Coming Soon</h1></div>} />
            <Route path="/patients/:patientId" element={<div className="p-6"><h1 className="text-2xl">Patient Profile - Coming Soon</h1></div>} />
            <Route path="/earnings" element={<div className="p-6"><h1 className="text-2xl">Earnings - Coming Soon</h1></div>} />
            <Route path="/availability" element={<div className="p-6"><h1 className="text-2xl">Availability - Coming Soon</h1></div>} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl">Settings - Coming Soon</h1></div>} />
          </Route>
        </Route>
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

