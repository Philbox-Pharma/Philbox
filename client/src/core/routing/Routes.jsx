import { useRoutes, Navigate } from 'react-router-dom';
import { adminRoutes } from './routes/admin.routes.jsx';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  const routes = [
    {
      // Public Routes
      path: '/',
      element: <Navigate to="/admin/login" replace />,
    },
    ...adminRoutes.map(route => {
      if (route.path === '/admin/login') return route;

      // Wrap protected routes
      return {
        ...route,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      };
    }),
    {
      path: '*',
      element: <div>404 Not Found</div>,
    },
  ];

  return useRoutes(routes);
}
