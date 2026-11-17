import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider.jsx';
import { PageMeta } from '../components/public/PageMeta.jsx';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <><PageMeta title="Workspace" description="Private PTMS workspace." noindex /><Outlet /></>
    : <Navigate to="/login" replace />;
}
