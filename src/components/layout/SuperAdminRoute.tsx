import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/**
 * SuperAdminRoute component
 * Protects routes that require Super Admin access
 */
export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Redirect non-super-admin users trying to access admin routes
    if (isAuthenticated && user && !user.is_superadmin) {
      console.warn('Unauthorized access attempt to Super Admin route:', location.pathname);
    }
  }, [isAuthenticated, user, location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.is_superadmin) {
    // Redirect to dashboard if not a super admin
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
