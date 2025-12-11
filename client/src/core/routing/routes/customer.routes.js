import { Route } from 'react-router-dom';

// Import Customer Module Components
// import Dashboard from '../../../portals/customer/modules/dashboard/Dashboard';
// import MedicineBrowsing from '../../../portals/customer/modules/medicines/MedicineBrowsing';
// import Cart from '../../../portals/customer/modules/cart/Cart';
// import Orders from '../../../portals/customer/modules/orders/Orders';
// import Appointments from '../../../portals/customer/modules/appointments/Appointments';
// import Prescriptions from '../../../portals/customer/modules/prescriptions/Prescriptions';
// import Feedback from '../../../portals/customer/modules/feedback/Feedback';
// import Profile from '../../../portals/customer/modules/profile/Profile';

const CustomerRoutes = (
  <>
    {/* <Route path="dashboard" element={<Dashboard />} /> */}
    {/* <Route path="medicines" element={<MedicineBrowsing />} /> */}
    {/* <Route path="cart" element={<Cart />} /> */}
    {/* <Route path="orders" element={<Orders />} /> */}
    {/* <Route path="appointments" element={<Appointments />} /> */}
    {/* <Route path="prescriptions" element={<Prescriptions />} /> */}
    {/* <Route path="feedback" element={<Feedback />} /> */}
    {/* <Route path="profile" element={<Profile />} /> */}

    {/* Temporary placeholder */}
    <Route
      path="*"
      element={<div className="p-8">Customer Portal - Routes Coming Soon</div>}
    />
  </>
);

export default CustomerRoutes;
