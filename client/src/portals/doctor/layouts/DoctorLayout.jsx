import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DoctorHeader from './components/Header';
import DoctorSidebar from './components/DoctorSidebar';
import DoctorFooter from './components/Footer';
import { useAuth } from '../../../shared/context/AuthContext';

export default function DoctorLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);

  // Sync state with auth context user
  useEffect(() => {
    if (user) {
      setDoctor({
        _id: user._id || user.id,
        fullName: user.fullName || user.name || 'Doctor',
        email: user.email,
        specialization: Array.isArray(user.specialization) 
          ? user.specialization[0] 
          : (user.specialization || 'Physician'),
        profile_img_url: user.profile_img_url || user.profileImage || null,
        phone_number: user.phone_number || user.contactNumber,
        consultation_type: user.consultation_type || 'both',
        consultation_fee: user.consultation_fee || 0,
        status: user.status || 'approved',
      });
    } else {
      // Fallback only if no auth user (should be guarded by private route)
      setDoctor({
        _id: '1',
        fullName: 'Doctor',
        email: 'doctor@philbox.com',
        specialization: 'General Physician',
      });
    }
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const updateDoctor = (newDoctorData) => {
    setDoctor(newDoctorData);
    localStorage.setItem('doctorData', JSON.stringify(newDoctorData));
  };

  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <DoctorSidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        doctor={doctor}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 min-w-0 overflow-x-hidden">
        <DoctorHeader
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          doctor={doctor}
        />

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <Outlet context={{ doctor, setDoctor: updateDoctor }} />
        </main>

        <DoctorFooter />
      </div>
    </div>
  );
}
