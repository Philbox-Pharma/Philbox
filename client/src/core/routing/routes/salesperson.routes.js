import { Route } from 'react-router-dom';

// Import Salesperson Module Components
// import Dashboard from '../../../portals/salesperson/modules/dashboard/Dashboard';
// import Inventory from '../../../portals/salesperson/modules/inventory/Inventory';
// import Orders from '../../../portals/salesperson/modules/orders/Orders';
// import Tasks from '../../../portals/salesperson/modules/tasks/Tasks';
// import Profile from '../../../portals/salesperson/modules/profile/Profile';

const SalespersonRoutes = (
  <>
    {/* <Route path="dashboard" element={<Dashboard />} /> */}
    {/* <Route path="inventory" element={<Inventory />} /> */}
    {/* <Route path="orders" element={<Orders />} /> */}
    {/* <Route path="tasks" element={<Tasks />} /> */}
    {/* <Route path="profile" element={<Profile />} /> */}

    {/* Temporary placeholder */}
    <Route
      path="*"
      element={<div className="p-8">Pharmacy Portal - Routes Coming Soon</div>}
    />
  </>
);

export default SalespersonRoutes;
