import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../portals/admin/layouts/AdminLayout';
import CustomerLayout from '../portals/customer/layouts/CustomerLayout';
import DoctorLayout from '../portals/doctor/layouts/DoctorLayout';
import SalespersonLayout from '../portals/salesperson/layouts/SalespersonLayout';

// Landing Pages
import MainLanding from '../portals/shared/components/MainLanding';
import AdminLanding from '../portals/admin/modules/landing/AdminLanding';
import CustomerLanding from '../portals/customer/modules/landing/CustomerLanding';
import DoctorLanding from '../portals/doctor/modules/landing/DoctorLanding';
import PharmacyLanding from '../portals/salesperson/modules/landing/PharmacyLanding';

// Auth Pages
import AdminLogin from '../portals/admin/modules/login/AdminLogin';
import CustomerLogin from '../portals/customer/modules/login/CustomerLogin';
import DoctorLogin from '../portals/doctor/modules/login/DoctorLogin';
import PharmacyLogin from '../portals/salesperson/modules/login/PharmacyLogin';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute';

// Admin Routes
import AdminRoutes from './routes/admin.routes';
import CustomerRoutes from './routes/customer.routes';
import DoctorRoutes from './routes/doctor.routes';
import SalespersonRoutes from './routes/salesperson.routes';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<MainLanding />} />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin/landing" element={<AdminLanding />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {AdminRoutes}
        </Route>

        {/* ==================== CUSTOMER ROUTES ==================== */}
        <Route path="/customer/landing" element={<CustomerLanding />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerLogin />} />

        {/* Protected Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {CustomerRoutes}
        </Route>

        {/* ==================== DOCTOR ROUTES ==================== */}
        <Route path="/doctor/landing" element={<DoctorLanding />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorLogin />} />

        {/* Protected Doctor Routes */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          {DoctorRoutes}
        </Route>

        {/* ==================== PHARMACY/SALESPERSON ROUTES ==================== */}
        <Route path="/pharmacy/landing" element={<PharmacyLanding />} />
        <Route path="/pharmacy/login" element={<PharmacyLogin />} />

        {/* Protected Salesperson Routes */}
        <Route
          path="/pharmacy/*"
          element={
            <ProtectedRoute requiredRole="salesperson">
              <SalespersonLayout />
            </ProtectedRoute>
          }
        >
          {SalespersonRoutes}
        </Route>

        {/* 404 Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Simple 404 Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-[#003399]">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
      <a
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-[#003399] text-white rounded-md hover:bg-[#002266]"
      >
        Go Home
      </a>
    </div>
  </div>
);

export default AppRoutes;
