import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  module?: string;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  module,
  allowedRoles 
}) => {
  const { isAuthenticated, currentUser, rolePermissions } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    // Redirect to login but keep the redirect location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check dynamic permissions
  if (module) {
    const userPerms = rolePermissions[currentUser.role] || [];
    if (!userPerms.includes(module)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check fallback static roles
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If user's role is not authorized for this screen, redirect to Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
