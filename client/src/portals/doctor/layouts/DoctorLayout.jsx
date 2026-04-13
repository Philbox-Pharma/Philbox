import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DoctorHeader from './components/Header';
import DoctorSidebar from './components/DoctorSidebar';
import DoctorFooter from './components/Footer';
import { useAuth } from '../../../shared/context/AuthContext';
import { doctorProfileApi } from '../../../core/api/doctor/profile.service';

export default function DoctorLayout() {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const updateDoctor = (newDoctorData) => {
    if (!newDoctorData) return;
    
    // Ensure consistency in field names for header/sidebar
    const formatted = {
      ...newDoctorData,
      fullName: newDoctorData.fullName || newDoctorData.name || 'Doctor',
      specialization: Array.isArray(newDoctorData.specialization) 
        ? newDoctorData.specialization[0] 
        : (newDoctorData.specialization || 'Physician'),
      profile_img_url: newDoctorData.profile_img_url || newDoctorData.profileImage || null,
    };
    
    setDoctor(formatted);
    localStorage.setItem('doctorData', JSON.stringify(formatted));
  };

  // Sync state with auth context user and fetch full profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Initial set from auth context to avoid blank state
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

        try {
          setProfileLoading(true);
          // Fetch complete profile from dedicated API
          const response = await doctorProfileApi.getProfile();
          const data = response.data || response;
          
          if (data) {
            updateDoctor({
              ...user,
              ...data,
              _id: data._id || data.id || user._id || user.id
            });
          }
        } catch (err) {
          console.error('Failed to fetch full doctor profile:', err);
        } finally {
          setProfileLoading(false);
        }
      } else if (!authLoading) {
        // Fallback only if no auth user and not loading (should be guarded by private route)
        setDoctor({
          _id: '1',
          fullName: 'Doctor',
          email: 'doctor@philbox.com',
          specialization: 'General Physician',
        });
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Loading state while verifying auth
  if (authLoading && !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  // Final fallback if something is fundamentally wrong
  if (!doctor && !authLoading) {
     return null; // Or redirect
  }

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
          <Outlet context={{ doctor, setDoctor: updateDoctor, profileLoading }} />
        </main>

        <DoctorFooter />
      </div>
    </div>
  );
}
