import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'operator' | 'support';
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('retailer_auth_token'));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('retailer_auth_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'admin-1',
          email: 'admin@retailer-system.com',
          name: 'Lead Operations',
          role: 'superadmin',
        };
  });

  const login = (email: string, authToken: string, authUser: AdminUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('retailer_auth_token', authToken);
    localStorage.setItem('retailer_auth_user', JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('retailer_auth_token');
    localStorage.removeItem('retailer_auth_user');
  };

  useEffect(() => {
    // If no token exists, provide dev default token
    if (!token) {
      const devToken = 'dev_demo_jwt_token_retailer_system';
      setToken(devToken);
      localStorage.setItem('retailer_auth_token', devToken);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
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
