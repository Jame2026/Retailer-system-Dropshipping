import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api.client.js';

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
  login: (email: string, password: string) => Promise<AdminUser>;
  register: (data: { email: string; password: string; name: string; role?: string }) => Promise<AdminUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('retailer_auth_token'));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('retailer_auth_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount with backend database
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('retailer_auth_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/api/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('retailer_auth_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        // If token is expired or invalid on server, reset
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('retailer_auth_token', receivedToken);
      localStorage.setItem('retailer_auth_user', JSON.stringify(receivedUser));

      return receivedUser;
    } catch (err: any) {
      throw new Error(err.message || 'Authentication failed against database');
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
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('retailer_auth_token', receivedToken);
      localStorage.setItem('retailer_auth_user', JSON.stringify(receivedUser));

      return receivedUser;
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed in database');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('retailer_auth_token');
    localStorage.removeItem('retailer_auth_user');
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
