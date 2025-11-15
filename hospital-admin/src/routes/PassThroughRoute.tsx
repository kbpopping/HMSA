import { Outlet } from 'react-router-dom';

/**
 * PassThroughRoute - Development mode route component
 * 
 * This component bypasses all authentication checks and simply renders child routes.
 * Used during UI development when authentication is temporarily disabled.
 * 
 * To re-enable authentication:
 * 1. Replace PassThroughRoute with ProtectedRoute in App.tsx
 * 2. Add RoleRoute back for role-based access control
 * 3. Update root redirect to /login
 */
export default function PassThroughRoute() {
  return <Outlet />;
}

