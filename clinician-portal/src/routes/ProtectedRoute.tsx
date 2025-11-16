import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

/**
 * Protected route guard - requires authentication
 */
export default function ProtectedRoute() {
  const { status, user } = useAuth();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (status === 'idle' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render child routes
  if (status === 'authenticated') {
    return <Outlet />;
  }
  
  // Loading state
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-subtle-light dark:text-subtle-dark">Loading...</p>
      </div>
    </div>
  );
}

