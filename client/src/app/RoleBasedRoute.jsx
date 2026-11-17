import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider.jsx';

export function RoleBasedRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
