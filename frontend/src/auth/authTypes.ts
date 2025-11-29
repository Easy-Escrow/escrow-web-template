// src/auth/auth.types.ts
import type { AuthTokens, AuthUser } from '@/api/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<string | null>;
    hasRole: (roles: string | string[]) => boolean;
}

export type { AuthTokens, AuthUser };
