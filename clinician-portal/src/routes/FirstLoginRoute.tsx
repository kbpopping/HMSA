import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

/**
 * First login route guard - redirects to password change if needed
 */
export default function FirstLoginRoute() {
  const { needsPasswordChange, onboardingComplete } = useAuth();
  
  // If needs password change, redirect to change password page
  if (needsPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }
  
  // If onboarding not complete, redirect to onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Otherwise, allow access to the route
  return <Outlet />;
}

