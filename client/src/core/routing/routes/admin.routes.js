import { Route } from 'react-router-dom';

// Import Admin Module Components
// import Dashboard from '../../../portals/admin/modules/dashboard/Dashboard';
// import BranchManagement from '../../../portals/admin/modules/branches/BranchManagement';
// import UserManagement from '../../../portals/admin/modules/users/UserManagement';
// import Analytics from '../../../portals/admin/modules/analytics/Analytics';
// import Appointments from '../../../portals/admin/modules/appointments/Appointments';
// import Reviews from '../../../portals/admin/modules/reviews/Reviews';
// import Tasks from '../../../portals/admin/modules/tasks/Tasks';
// import Complaints from '../../../portals/admin/modules/complaints/Complaints';
// import Reports from '../../../portals/admin/modules/reports/Reports';
// import Coupons from '../../../portals/admin/modules/coupons/Coupons';
// import Profile from '../../../portals/admin/modules/profile/Profile';

const AdminRoutes = (
  <>
    {/* <Route path="dashboard" element={<Dashboard />} /> */}
    {/* <Route path="branches" element={<BranchManagement />} /> */}
    {/* <Route path="users" element={<UserManagement />} /> */}
    {/* <Route path="analytics" element={<Analytics />} /> */}
    {/* <Route path="appointments" element={<Appointments />} /> */}
    {/* <Route path="reviews" element={<Reviews />} /> */}
    {/* <Route path="tasks" element={<Tasks />} /> */}
    {/* <Route path="complaints" element={<Complaints />} /> */}
    {/* <Route path="reports" element={<Reports />} /> */}
    {/* <Route path="coupons" element={<Coupons />} /> */}
    {/* <Route path="profile" element={<Profile />} /> */}

    {/* Temporary placeholder */}
    <Route
      path="*"
      element={<div className="p-8">Admin Portal - Routes Coming Soon</div>}
    />
  </>
);

export default AdminRoutes;
