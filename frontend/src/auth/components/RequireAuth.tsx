// src/auth/components/RequireAuth.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../authHooks';
import { AuthLoading } from './AuthLoading';
import { AccessDenied } from './AccessDenied';

interface RequireAuthProps {
    children: JSX.Element;
    roles?: string[];
    loadingFallback?: JSX.Element;
    unauthorizedFallback?: JSX.Element;
}

export function RequireAuth({
                                children,
                                roles,
                                loadingFallback,
                                unauthorizedFallback,
                            }: RequireAuthProps) {
    const { isAuthenticated, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return loadingFallback ?? <AuthLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && roles.length && !hasRole(roles)) {
        // Either render a custom unauthorized UI or redirect
        if (unauthorizedFallback) {
            return unauthorizedFallback;
        }
        return <AccessDenied />;
        // or: return <Navigate to="/" replace />;
    }

    return children;
}

// HOC for quick role-guarded components
export function withRoleGuard<P extends object>(
    Component: React.ComponentType<P>,
    roles: string[],
) {
    return function GuardedComponent(props: P) {
        return (
            <RequireAuth roles={roles}>
                <Component {...props} />
            </RequireAuth>
        );
    };
}
