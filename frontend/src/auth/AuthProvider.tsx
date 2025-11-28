// src/auth/AuthProvider.tsx
import type { ReactNode } from 'react';
import { AuthContext, useAuthProvider } from './authHooks';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useAuthProvider();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
