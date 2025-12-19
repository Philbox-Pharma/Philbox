import { useRoutes } from 'react-router-dom';
import { adminRoutes } from './routes/admin.routes.jsx';
import { customerRoutes } from './routes/customer.routes.jsx';
import { doctorRoutes } from './routes/doctor.routes.jsx';
import { salespersonRoutes } from './routes/salesperson.routes.jsx';
import ProtectedRoute from './ProtectedRoute';

// Public routes list
const publicPaths = [
  // Landing
  '/',

  // Admin
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',

  // Customer Auth
  '/register',
  '/login',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/auth/oauth',

  // Customer Protected (Temporary - for testing)
  '/dashboard',
  '/medicines',
  '/cart',
  '/checkout',
  '/orders',
  '/appointments',
  '/prescriptions',
  '/profile',
  '/notifications',

  // Doctor
  '/doctor/register',
  '/doctor/login',
  '/doctor/verify-email',
  '/doctor/forgot-password',
  '/doctor/reset-password',
  '/doctor/submit-application',
  '/doctor/application-status',
  '/doctor/complete-profile',
  '/doctor/auth/oauth',

  // Salesperson
  '/salesperson/login',
  '/salesperson/forgot-password',
  '/salesperson/reset-password',
];

export default function AppRoutes() {
  const routes = [
    // Customer routes (includes '/' landing page)
    ...customerRoutes.map(route => {
      const isPublic = publicPaths.some(path =>
        route.path === path || route.path?.startsWith(path)
      );
      if (isPublic) return route;
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }),

    // Admin routes
    ...adminRoutes.map(route => {
      const isPublic = publicPaths.some(path =>
        route.path === path || route.path?.startsWith(path)
      );
      if (isPublic) return route;
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }),

    // Doctor routes
    ...doctorRoutes.map(route => {
      const isPublic = publicPaths.some(path =>
        route.path === path || route.path?.startsWith(path)
      );
      if (isPublic) return route;
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }),

    // Salesperson routes
    ...salespersonRoutes.map(route => {
      const isPublic = publicPaths.some(path =>
        route.path === path || route.path?.startsWith(path)
      );
      if (isPublic) return route;
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }),

    // 404 Fallback
    {
      path: '*',
      element: <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500">404 - Page Not Found</div>,
    },
  ];

  return useRoutes(routes);
}
