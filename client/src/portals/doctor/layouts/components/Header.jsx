import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaChevronDown,
  FaUserMd,
} from 'react-icons/fa';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';
import { doctorAppointmentsApi } from '../../../../core/api/doctor/appointments.service';
import NotificationDropdown from '../../../../shared/components/Dropdown/NotificationDropdown';

export default function DoctorHeader({ toggleSidebar, doctor }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDoctorNotifications();
    const interval = setInterval(fetchDoctorNotifications, 180000);
    return () => clearInterval(interval);
  }, []);

  const fetchDoctorNotifications = async () => {
    try {
      setLoading(true);
      // Fetch latest appointment requests as notifications
      const res = await doctorAppointmentsApi.getAppointmentRequests();
      const appointments = res.data?.data || res.data || [];
      
      const formatted = appointments.slice(0, 5).map(app => ({
        id: app._id,
        text: `New appointment request from ${app.patient_id?.fullName || 'Patient'}`,
        time: new Date(app.appointment_date).toLocaleDateString(),
        type: 'info',
        unread: app.status === 'pending'
      }));

      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => n.unread).length);
    } catch (err) {
      console.error('Failed to fetch doctor notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await doctorAuthApi.logout();
      localStorage.removeItem('doctorData');
      navigate('/doctor/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('doctorData');
      navigate('/doctor/login');
    }
  };

  const doctorName = (doctor?.fullName || doctor?.name || 'Doctor').toLowerCase().startsWith('dr')
    ? (doctor?.fullName || doctor?.name || 'Doctor')
    : `Dr. ${doctor?.fullName || doctor?.name || 'Doctor'}`;
  const initials = (doctor?.fullName || doctor?.name || 'D').charAt(0).toUpperCase();
  const specialization = doctor?.specialization || 'Physician';

  return (
    <header className="bg-[#0f2b3d] text-white shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>

          <Link to="/doctor/dashboard" className="hidden sm:flex items-center gap-2">
            <FaUserMd className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Doctor Portal</h1>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications Dropdown */}
          <NotificationDropdown 
            notifications={notifications}
            loading={loading}
            unreadCount={unreadCount}
            onMarkAllRead={() => setUnreadCount(0)}
            viewAllPath="/doctor/appointments/requests"
            portalColor="emerald"
          />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {doctor?.profile_img_url ? (
                <img
                  src={doctor.profile_img_url}
                  alt={doctorName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-400/50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.profile-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`profile-fallback w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ${
                  doctor?.profile_img_url ? 'hidden' : ''
                }`}
              >
                <span className="text-white text-sm font-bold">
                  {initials}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">
                  {doctorName}
                </p>
                <p className="text-xs text-white/70">{specialization}</p>
              </div>
              <FaChevronDown
                className={`text-sm transition-transform hidden sm:block ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 pointer-events-auto"
                >
                  {/* Profile Header */}
                  <div className="p-4 bg-gradient-to-r from-[#0f2b3d] to-emerald-800 text-white">
                    <div className="flex items-center gap-3">
                      {doctor?.profile_img_url ? (
                        <>
                          <img
                            src={doctor.profile_img_url}
                            alt={doctorName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden items-center justify-center w-12 h-12 rounded-full bg-emerald-500 border-2 border-white/30">
                            <span className="text-white text-lg font-bold">
                              {initials}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white/30">
                          <span className="text-white text-lg font-bold">
                            {initials}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{doctorName}</p>
                        <p className="text-sm text-white/80 truncate">
                          {doctor?.email || ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/30 text-emerald-100">
                        {specialization}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/doctor/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaUser className="text-emerald-600" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/doctor/slots"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaCog className="text-emerald-600" />
                      <span>Manage Availability</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

