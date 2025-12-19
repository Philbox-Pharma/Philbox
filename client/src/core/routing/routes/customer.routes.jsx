import CustomerLanding from '../../../portals/customer/modules/landing/CustomerLanding';
import Register from '../../../portals/customer/modules/auth/Register';
import Login from '../../../portals/customer/modules/auth/Login';
import ForgotPassword from '../../../portals/customer/modules/auth/ForgotPassword';
import ResetPassword from '../../../portals/customer/modules/auth/ResetPassword';
import VerifyEmail from '../../../portals/customer/modules/auth/VerifyEmail';
import OAuthSuccess from '../../../portals/customer/modules/oauth/OAuthSuccess';
import OAuthError from '../../../portals/customer/modules/oauth/OAuthError';
import CustomerLayout from '../../../portals/customer/layouts/CustomerLayout';
import CustomerDashboard from '../../../portals/customer/modules/dashboard/CustomerDashboard';
import Medicines from '../../../portals/customer/modules/medicines/Medicines';
import MedicineDetail from '../../../portals/customer/modules/medicines/MedicineDetail';
import Cart from '../../../portals/customer/modules/cart/Cart';
import Checkout from '../../../portals/customer/modules/checkout/Checkout';
import Orders from '../../../portals/customer/modules/orders/Orders';
import OrderDetail from '../../../portals/customer/modules/orders/OrderDetail';
import Appointments from '../../../portals/customer/modules/appointments/Appointments';
import BookAppointment from '../../../portals/customer/modules/appointments/BookAppointment';
import AppointmentDetail from '../../../portals/customer/modules/appointments/AppointmentDetail';
import Prescriptions from '../../../portals/customer/modules/prescriptions/Prescriptions';
import Profile from '../../../portals/customer/modules/profile/Profile';
import Notifications from '../../../portals/customer/modules/notifications/Notifications';

export const customerRoutes = [
  // ============================================
  // LANDING PAGE (Public - Root URL)
  // ============================================
  {
    path: '/',
    element: <CustomerLanding />,
  },

  // ============================================
  // PUBLIC AUTH ROUTES (No Layout)
  // ============================================
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/auth/oauth/success',
    element: <OAuthSuccess />,
  },
  {
    path: '/auth/oauth/error',
    element: <OAuthError />,
  },

  // ============================================
  // PROTECTED ROUTES (With CustomerLayout)
  // ============================================
  {
    path: '/dashboard',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerDashboard />,
      },
    ],
  },
  {
    path: '/medicines',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Medicines />,
      },
      {
        path: ':id',
        element: <MedicineDetail />,
      },
    ],
  },
  {
    path: '/cart',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Cart />,
      },
    ],
  },
  {
    path: '/checkout',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Checkout />,
      },
    ],
  },
  {
    path: '/orders',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Orders />,
      },
      {
        path: ':id',
        element: <OrderDetail />,
      },
    ],
  },
  {
    path: '/appointments',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Appointments />,
      },
      {
        path: 'book',
        element: <BookAppointment />,
      },
      {
        path: ':id',
        element: <AppointmentDetail />,
      },
    ],
  },
  {
    path: '/prescriptions',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Prescriptions />,
      },
    ],
  },
  {
    path: '/profile',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
  {
    path: '/notifications',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <Notifications />,
      },
    ],
  },
];
