// src/auth/auth.hooks.ts
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    FormEvent,
} from 'react';

import type { AuthContextValue, AuthTokens, AuthUser } from './authTypes';
import {
    clearTokens as apiClearTokens,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from '../api/apiClient';
import {
    fetchCurrentUser,
    loginRequest,
    logoutRequest,
    refreshTokenRequest,
} from '../api/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setTokens(tokens: Partial<AuthTokens>) {
    if (tokens.access !== undefined) {
        setAccessToken(tokens.access ?? null);
    }
    if (tokens.refresh !== undefined) {
        setRefreshToken(tokens.refresh ?? null);
    }
}

export function useAuthProvider(): AuthContextValue {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        const profile = await fetchCurrentUser();
        setUser(profile);
        return profile;
    }, []);

    const refreshSession = useCallback(async (): Promise<string | null> => {
        const refresh = getRefreshToken();
        if (!refresh) {
            setLoading(false);
            return null;
        }
        try {
            const tokens = await refreshTokenRequest(refresh);
            setTokens(tokens);
            setAccessTokenState(tokens.access ?? null);
            await fetchProfile();
            return tokens.access ?? null;
        } catch (error) {
            console.error('Failed to refresh session:', error);
            apiClearTokens();
            setUser(null);
            setAccessTokenState(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchProfile]);

    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    const login = useCallback(
        async (email: string, password: string) => {
            const tokens = await loginRequest(email, password);
            setTokens(tokens);
            setAccessTokenState(tokens.access ?? null);
            const profile = tokens.user ?? (await fetchProfile());
            setUser(profile);
            return profile;
        },
        [fetchProfile],
    );

    const logout = useCallback(async () => {
        const refresh = getRefreshToken();
        if (refresh) {
            try {
                await logoutRequest(refresh);
            } catch (error) {
                console.error('Failed to logout:', error);
            }
        }
        apiClearTokens();
        setUser(null);
        setAccessTokenState(null);
    }, []);

    const hasRole = useCallback(
        (roles: string | string[]) => {
            if (!user) return false;
            const allowed = Array.isArray(roles) ? roles : [roles];
            return allowed.includes(user.role);
        },
        [user],
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accessToken,
            isAuthenticated: Boolean(user && accessToken),
            loading,
            login,
            logout,
            refreshSession,
            hasRole,
        }),
        [user, accessToken, loading, login, logout, refreshSession, hasRole],
    );

    return value;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to encapsulate login form state and submission.
 */
export function useLoginForm(onSuccess?: () => void) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            onSuccess?.();
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid credentials');
        } finally {
            setSubmitting(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        error,
        submitting,
        handleSubmit,
    };
}
