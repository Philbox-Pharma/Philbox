// src/core/routing/routes/admin.routes.jsx
import { lazy } from 'react';

// Lazy load components
const AdminLogin = lazy(() => import('../../../portals/admin/modules/login/Login'));
const ForgotPassword = lazy(() => import('../../../portals/admin/modules/forgot-password/ForgotPassword'));
const ResetPassword = lazy(() => import('../../../portals/admin/modules/reset-password/ResetPassword'));

// Export routes array (not a constant, just default export)
const adminRoutes = [
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/admin/reset-password/:token',
    element: <ResetPassword />,
  },
];

export default adminRoutes;
