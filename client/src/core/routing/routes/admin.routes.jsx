import AdminLogin from '../../../portals/admin/modules/login/AdminLogin';
import AdminLayout from '../../../portals/admin/layouts/AdminLayout';

// Placeholder for Dashboard
const Dashboard = () => (
  <h1 className="text-2xl font-bold p-4">Admin Dashboard</h1>
);

export const adminRoutes = [
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />, // Layout typically contains Sidebar/Header
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Add other admin sub-routes here
    ],
  },
];
