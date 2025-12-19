import Login from '../../../portals/salesperson/modules/auth/Login';
import ForgotPassword from '../../../portals/salesperson/modules/auth/ForgotPassword';
import ResetPassword from '../../../portals/salesperson/modules/auth/ResetPassword';

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
];
