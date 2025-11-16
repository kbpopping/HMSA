import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { hasPermission } from '../utils/permissions';

type RoleRouteProps = {
  requiredPermission?: string;
  fallback?: string;
};

/**
 * Role/Permission-based route guard
 */
export default function RoleRoute({ requiredPermission, fallback = '/dashboard' }: RoleRouteProps) {
  const { user } = useAuth();
  
  // If no permission required, allow access
  if (!requiredPermission) {
    return <Outlet />;
  }
  
  // Check if user has the required permission
  if (hasPermission(user, requiredPermission)) {
    return <Outlet />;
  }
  
  // Otherwise, redirect to fallback route (403-style)
  return <Navigate to={fallback} replace />;
}

