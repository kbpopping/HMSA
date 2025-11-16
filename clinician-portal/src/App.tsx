import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Schedule from './pages/Schedule';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
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
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:patientId" element={<PatientProfile />} />
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

