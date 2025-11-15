import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import type { Role } from '../api/endpoints';

interface RoleRouteProps {
  allow: Role[];
}

export default function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

