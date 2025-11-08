import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function ProtectedRoute() {
  const { status, user } = useAuth();

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-text-light/70 dark:text-text-dark/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'idle' || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render protected routes
  return <Outlet />;
}
