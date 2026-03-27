import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DoctorHeader from './components/Header';
import DoctorSidebar from './components/DoctorSidebar';
import DoctorFooter from './components/Footer';

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);

  // Load doctor data from localStorage on mount
  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctorData');
    if (storedDoctor) {
      try {
        const parsed = JSON.parse(storedDoctor);
        setDoctor({
          _id: parsed._id || parsed.id,
          name: parsed.name || parsed.fullName || 'Doctor',
          email: parsed.email,
          specialization: parsed.specialization || 'Physician',
          profile_img_url: parsed.profile_img_url || parsed.profileImage || null,
          phone_number: parsed.phone_number || parsed.contactNumber,
          consultation_type: parsed.consultation_type || 'both',
          consultation_fee: parsed.consultation_fee || 0,
          status: parsed.status || 'approved',
        });
      } catch (e) {
        console.error('Failed to parse doctor data:', e);
        setDefaultDoctor();
      }
    } else {
      setDefaultDoctor();
    }
  }, []);

  const setDefaultDoctor = () => {
    setDoctor({
      _id: '1',
      name: 'Doctor',
      email: 'doctor@philbox.com',
      specialization: 'General Physician',
    });
  };

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
