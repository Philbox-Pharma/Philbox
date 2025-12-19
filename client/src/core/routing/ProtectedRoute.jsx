import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const ProtectedRoute = ({ allowedRoles: _allowedRoles = [] }) => {
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

  // Optional: Role based checking
  // if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;
