import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: JSX.Element;
  roles?: string[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function withRoleGuard(Component: React.ComponentType, roles: string[]) {
  return function GuardedComponent(props: Record<string, unknown>) {
    return (
      <RequireAuth roles={roles}>
        <Component {...props} />
      </RequireAuth>
    );
  };
}
