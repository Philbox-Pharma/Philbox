import { lazy } from 'react';

// Lazy load components
const AdminLanding = lazy(
  () => import('../../../portals/admin/modules/landing/AdminLanding')
);
const AdminLogin = lazy(
  () => import('../../../portals/admin/modules/login/AdminLogin')
);
const ForgotPassword = lazy(
  () => import('../../../portals/admin/modules/forgot-password/ForgotPassword')
);
const ResetPassword = lazy(
  () => import('../../../portals/admin/modules/reset-password/ResetPassword')
);
const AdminLayout = lazy(
  () => import('../../../portals/admin/layouts/AdminLayout')
);
const AdminDashboard = lazy(
  () => import('../../../portals/admin/modules/dashboard/AdminDashboard')
);
const AdminProfile = lazy(
  () => import('../../../portals/admin/modules/profile/AdminProfile')
);

// Branch Management
const BranchList = lazy(
  () => import('../../../portals/admin/modules/branches/BranchList')
);
const AddBranch = lazy(
  () => import('../../../portals/admin/modules/branches/AddBranch')
);
const EditBranch = lazy(
  () => import('../../../portals/admin/modules/branches/EditBranch')
);
const BranchDetails = lazy(
  () => import('../../../portals/admin/modules/branches/BranchDetails')
);
const BranchStatistics = lazy(
  () => import('../../../portals/admin/modules/branches/BranchStatistics')
);

// Staff Management
const AdminList = lazy(
  () => import('../../../portals/admin/modules/staff/admins/AdminList')
);
const AddAdmin = lazy(
  () => import('../../../portals/admin/modules/staff/admins/AddAdmin')
);
const AdminDetails = lazy(
  () => import('../../../portals/admin/modules/staff/admins/AdminDetails')
);
const EditAdmin = lazy(
  () => import('../../../portals/admin/modules/staff/admins/EditAdmin')
);

const SalespersonList = lazy(
  () =>
    import('../../../portals/admin/modules/staff/salespersons/SalespersonList')
);
const AddSalesperson = lazy(
  () =>
    import('../../../portals/admin/modules/staff/salespersons/AddSalesperson')
);
const EditSalesperson = lazy(
  () =>
    import('../../../portals/admin/modules/staff/salespersons/EditSalesperson')
);
const SalespersonDetails = lazy(
  () =>
    import(
      '../../../portals/admin/modules/staff/salespersons/SalespersonDetails'
    )
);

// Roles & Permissions
const RolesPermissions = lazy(
  () =>
    import('../../../portals/admin/modules/roles-permissions/RolesPermissions')
);

// Orders Analytics
const OrdersDashboard = lazy(
  () => import('../../../portals/admin/modules/orders/OrdersDashboard')
);

// Task Management
const TaskManagement = lazy(
  () => import('../../../portals/admin/modules/tasks/TaskManagement')
);

// Customer Management
const CustomerList = lazy(
  () => import('../../../portals/admin/modules/customers/CustomerList')
);
const CustomerDetails = lazy(
  () => import('../../../portals/admin/modules/customers/CustomerDetails')
);

// Doctor Management
const DoctorList = lazy(
  () => import('../../../portals/admin/modules/doctors/DoctorList')
);
const DoctorApplications = lazy(
  () => import('../../../portals/admin/modules/doctors/DoctorApplications')
);
const DoctorApplicationDetails = lazy(
  () =>
    import('../../../portals/admin/modules/doctors/DoctorApplicationDetails')
);
const DoctorDetails = lazy(
  () => import('../../../portals/admin/modules/doctors/DoctorDetails')
);

// Analytics
const RevenueAnalytics = lazy(
  () => import('../../../portals/admin/modules/analytics/RevenueAnalytics')
);
const UserEngagement = lazy(
  () => import('../../../portals/admin/modules/analytics/UserEngagement')
);
const ActivityLogs = lazy(
  () => import('../../../portals/admin/modules/analytics/ActivityLogs')
);
const FeedbackComplaints = lazy(
  () => import('../../../portals/admin/modules/analytics/FeedbackComplaints')
);
const AppointmentAnalytics = lazy(
  () => import('../../../portals/admin/modules/analytics/AppointmentAnalytics')
);

// Notifications
const Notifications = lazy(
  () => import('../../../portals/admin/modules/notifications/Notifications')
);

// Settings
const Settings = lazy(
  () => import('../../../portals/admin/modules/settings/Settings')
);

const adminRoutes = [
  // ---------------- PUBLIC ROUTES ----------------
  {
    path: '/admin',
    element: <AdminLanding />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/admin/reset-password/:token',
    element: <ResetPassword />,
  },

  // ---------------- PROTECTED ROUTES ----------------
  // AdminLayout acts as the "Guard". If no session, it redirects to login.
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'profile',
        element: <AdminProfile />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },

      // --- Branch Management ---
      {
        path: 'branches',
        element: <BranchList />,
      },
      {
        path: 'branches/add',
        element: <AddBranch />,
      },
      {
        path: 'branches/statistics', // Needs to be before :id
        element: <BranchStatistics />,
      },
      {
        path: 'branches/:id',
        element: <BranchDetails />,
      },
      {
        path: 'branches/:id/edit',
        element: <EditBranch />,
      },

      // --- Staff Management ---
      // Staff - Admins
      {
        path: 'staff/admins',
        element: <AdminList />,
      },
      {
        path: 'staff/admins/add',
        element: <AddAdmin />,
      },
      {
        path: 'staff/admins/:id',
        element: <AdminDetails />,
      },
      {
        path: 'staff/admins/:id/edit',
        element: <EditAdmin />,
      },
      {
        path: 'staff/salespersons',
        element: <SalespersonList />,
      },
      {
        path: 'staff/salespersons/add',
        element: <AddSalesperson />,
      },
      {
        path: 'staff/salespersons/:id/edit',
        element: <EditSalesperson />,
      },
      {
        path: 'staff/salespersons/:id',
        element: <SalespersonDetails />,
      },

      // --- Roles & Permissions ---
      {
        path: 'roles-permissions',
        element: <RolesPermissions />,
      },

      // --- Orders Analytics ---
      {
        path: 'orders',
        element: <OrdersDashboard />,
      },

      // --- Task Management ---
      {
        path: 'tasks',
        element: <TaskManagement />,
      },

      // --- Customer Management ---
      {
        path: 'customers',
        element: <CustomerList />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetails />,
      },

      // --- Doctor Management ---
      {
        path: 'doctors',
        element: <DoctorList />,
      },
      {
        path: 'doctors/applications',
        element: <DoctorApplications />,
      },
      {
        path: 'doctors/applications/:id',
        element: <DoctorApplicationDetails />,
      },
      {
        path: 'doctors/:id',
        element: <DoctorDetails />,
      },

      // --- Analytics ---
      {
        path: 'analytics/revenue',
        element: <RevenueAnalytics />,
      },
      {
        path: 'analytics/engagement',
        element: <UserEngagement />,
      },
      {
        path: 'analytics/activity-logs',
        element: <ActivityLogs />,
      },
      {
        path: 'analytics/feedback-complaints',
        element: <FeedbackComplaints />,
      },
      {
        path: 'analytics/appointments',
        element: <AppointmentAnalytics />,
      },

      // --- Notifications ---
      {
        path: 'notifications',
        element: <Notifications />,
      },

      // --- Settings ---
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
];

export default adminRoutes;
