import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // TODO: Replace with actual auth logic
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    // Redirect to respective login page
    return <Navigate to={`/${requiredRole}/login`} replace />;
  }

  if (userRole !== requiredRole) {
    // Role mismatch - redirect to unauthorized
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
