import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DoctorCustomerLanding from '../pages/common/landing/DoctorCustomerLandingPage';
import DoctorCustomerLogin from '../pages/common/auth/DoctorCustomerLogin';
import DoctorSignup from '../pages/common/auth/DoctorSignup';
import CustomerSignup from '../pages/common/auth/CustomerSignup';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-[#003399] mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page Not Found</p>
      <a
        href="/"
        className="bg-linear-to-r from-[#003399] to-[#4FA64F] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
      >
        Go Back Home
      </a>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <DoctorCustomerLanding />,
    errorElement: <NotFound />,
  },
  {
    path: '/login',
    element: <DoctorCustomerLogin />,
  },
  {
    path: '/doctor/signup',
    element: <DoctorSignup />,
  },
  {
    path: '/customer/signup',
    element: <CustomerSignup />,
  },
  {
    path: '/doctor/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
