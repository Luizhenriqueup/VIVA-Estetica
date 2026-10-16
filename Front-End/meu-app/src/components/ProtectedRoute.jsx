import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
export default function ProtectedRoute() {
  const { session } = useAuth();
  const location = useLocation();
  return session ? <Outlet /> : <Navigate to="/" replace state={{ from: location.pathname }} />;
}
