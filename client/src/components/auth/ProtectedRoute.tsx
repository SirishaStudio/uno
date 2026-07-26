import { Navigate, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/ui/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking session…" />;
  }

  if (!isConfigured) {
    return <Navigate to={ROUTES.login} replace state={{ from: location, configMissing: true }} />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return children;
}
