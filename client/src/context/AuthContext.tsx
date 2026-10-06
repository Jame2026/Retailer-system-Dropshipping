import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api.client.js';
import { clearCachedProfile } from '../utils/profileCache.js';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'operator' | 'support' | string;
  lastLoginAt?: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Password login for the simple admin UI (throws when 2FA requires the OTP page). */
  login: (email: string, password: string) => Promise<AdminUser>;
  register: (data: { email: string; password: string; name: string; role?: string }) => Promise<AdminUser>;
  /** Completes the TOTP login flow (called by LoginPage after verify-otp / 2fa setup). */
  setSession: (email: string, token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'retailer_auth_token';
const USER_KEY = 'retailer_auth_user';

const readStoredUser = (): AdminUser | null => {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AdminUser;
  } catch {
    return null;
  }
};

/** Both auth backends are mounted: our OTP API nests payloads under `data`,
 *  the mockup API returns them flat — accept either. */
const unwrap = (body: any): any => body?.data ?? body;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate the stored session against the backend on mount.
  useEffect(() => {
    let cancelled = false;
    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get('/api/auth/me');
        const payload = unwrap(response.data);
        const fresh = (payload?.user ?? payload) as AdminUser | undefined;
        if (!cancelled && fresh?.id) {
          setUser(fresh);
          localStorage.setItem(USER_KEY, JSON.stringify(fresh));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    verifySession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSession = (email: string, authToken: string, authUser: AdminUser) => {
    const next = { ...authUser, email: authUser.email || email };
    setToken(authToken);
    setUser(next);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  };

  const login = async (email: string, password: string): Promise<AdminUser> => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: email.trim(),
        password,
      });
      const payload = unwrap(response.data);

      if (payload?.token && payload?.user) {
        setSession(email, payload.token, payload.user as AdminUser);
        return payload.user as AdminUser;
      }

      if (payload?.status === 'otp_required' || payload?.status === '2fa_setup_required') {
        throw new Error(
          'Two-factor authentication is on for this account — sign in from the Login page to enter your authenticator code.'
        );
      }
      throw new Error(payload?.error || 'Authentication failed against database');
    } catch (err: any) {
      throw err instanceof Error ? err : new Error('Authentication failed against database');
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<AdminUser> => {
    try {
      const response = await apiClient.post('/api/auth/register', data);
      const payload = unwrap(response.data);
      if (!payload?.token || !payload?.user) {
        throw new Error(payload?.error || 'Registration failed in database');
      }
      setSession(data.email, payload.token, payload.user as AdminUser);
      return payload.user as AdminUser;
    } catch (err: any) {
      throw err instanceof Error ? err : new Error('Registration failed in database');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Drop the cached profile so a different account can't show stale data.
    clearCachedProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
