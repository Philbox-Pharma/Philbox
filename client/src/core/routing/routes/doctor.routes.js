import { Route } from 'react-router-dom';

// Import Doctor Module Components
// import Dashboard from '../../../portals/doctor/modules/dashboard/Dashboard';
// import Appointments from '../../../portals/doctor/modules/appointments/Appointments';
// import Schedule from '../../../portals/doctor/modules/schedule/Schedule';
// import Consultations from '../../../portals/doctor/modules/consultations/Consultations';
// import Patients from '../../../portals/doctor/modules/patients/Patients';
// import Feedback from '../../../portals/doctor/modules/feedback/Feedback';
// import Profile from '../../../portals/doctor/modules/profile/Profile';

const DoctorRoutes = (
  <>
    {/* <Route path="dashboard" element={<Dashboard />} /> */}
    {/* <Route path="appointments" element={<Appointments />} /> */}
    {/* <Route path="schedule" element={<Schedule />} /> */}
    {/* <Route path="consultations" element={<Consultations />} /> */}
    {/* <Route path="patients" element={<Patients />} /> */}
    {/* <Route path="feedback" element={<Feedback />} /> */}
    {/* <Route path="profile" element={<Profile />} /> */}

    {/* Temporary placeholder */}
    <Route
      path="*"
      element={<div className="p-8">Doctor Portal - Routes Coming Soon</div>}
    />
  </>
);

export default DoctorRoutes;
