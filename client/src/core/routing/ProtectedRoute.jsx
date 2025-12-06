import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Optional: Add Role based checking here if needed
  // if (allowedRoles.length > 0 && !allowedRoles.includes(user.category)) {
  //   return <Navigate to="/unauthorized" />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;
