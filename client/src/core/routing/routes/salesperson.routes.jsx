import { Navigate } from 'react-router-dom';
import Login from '../../../portals/salesperson/modules/auth/Login';
import ForgotPassword from '../../../portals/salesperson/modules/auth/ForgotPassword';
import ResetPassword from '../../../portals/salesperson/modules/auth/ResetPassword';
import SalespersonLayout from '../../../portals/salesperson/layouts/SalespersonLayout';
import SalespersonDashboard from '../../../portals/salesperson/modules/dashboard/SalespersonDashboard';
import LowStockAlerts from '../../../portals/salesperson/modules/lowStockAlerts/LowStockAlerts';
import SalespersonTasks from '../../../portals/salesperson/modules/tasks/SalespersonTasks';
import SalespersonProfile from '../../../portals/salesperson/modules/profile/SalespersonProfile';
import InventoryManagement from '../../../portals/salesperson/modules/inventory/InventoryManagement';
import InventoryUpload from '../../../portals/salesperson/modules/inventory/InventoryUpload';

export const salespersonRoutes = [
  {
    path: '/salesperson/login',
    element: <Login />,
  },
  {
    path: '/salesperson/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/salesperson/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/salesperson',
    element: <SalespersonLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SalespersonDashboard />,
      },
      {
        path: 'inventory',
        element: <InventoryManagement />,
      },
      {
        path: 'inventory/upload',
        element: <InventoryUpload />,
      },
      {
        path: 'alerts',
        element: <LowStockAlerts />,
      },
      {
        path: 'tasks',
        element: <SalespersonTasks />,
      },
      {
        path: 'profile',
        element: <SalespersonProfile />,
      },
      {
        path: 'orders',
        element: <div className="p-8 text-center"><h2 className="text-xl font-bold text-gray-400">Orders feature coming soon</h2><p className="text-sm text-gray-400 mt-2">This module will be available once the backend endpoint is ready.</p></div>,
      },
    ],
  },
];
