import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine login path based on current route
  const getLoginPath = () => {
    const path = location.pathname;

    if (path.startsWith('/admin')) {
      return '/admin/login';
    } else if (path.startsWith('/doctor')) {
      return '/doctor/login';
    } else if (path.startsWith('/salesperson')) {
      return '/salesperson/login';
    } else {
      return '/login'; // Customer login
    }
  };

  if (!user) {
    return <Navigate to={getLoginPath()} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
