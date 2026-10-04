import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'superadmin' | 'operator' | 'support';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user.role !== 'superadmin' && user.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
