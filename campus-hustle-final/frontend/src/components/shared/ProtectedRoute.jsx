// frontend/src/components/shared/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from './index';

/**
 * Wraps a route so only authenticated (and optionally admin) users can access it.
 * Redirects to /login with the intended destination saved in location state.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <Spinner label="Restoring your session..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
