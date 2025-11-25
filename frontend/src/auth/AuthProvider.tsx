import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthTokens, AuthUser } from '../api/auth';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../api/apiClient';
import { fetchCurrentUser, loginRequest, logoutRequest, refreshTokenRequest } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setTokens(tokens: Partial<AuthTokens>) {
  if (tokens.access !== undefined) {
    setAccessToken(tokens.access ?? null);
  }
  if (tokens.refresh !== undefined) {
    setRefreshToken(tokens.refresh ?? null);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
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
      clearTokens();
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

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password);
    setTokens(tokens);
    setAccessTokenState(tokens.access ?? null);
    const profile = tokens.user ?? (await fetchProfile());
    setUser(profile);
    return profile;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await logoutRequest(refresh);
      } catch (error) {
        // ignore network errors while clearing local state
      }
    }
    clearTokens();
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
