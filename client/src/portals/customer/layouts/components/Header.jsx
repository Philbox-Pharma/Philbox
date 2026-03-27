import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
  FaUser,
  FaClipboardList,
  FaCalendarAlt,
} from 'react-icons/fa';
import { customerAuthApi } from '../../../../core/api/customer/auth';
import profileService from '../../../../core/api/customer/profile.service';
import SearchBar from './SearchBar';
import NotificationDropdown from '../../../../shared/components/Dropdown/NotificationDropdown';

export default function Header() {
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    profile_img: '',
  });

  // Mock data for cart/notifications - baad mein API se aayega
  const cartCount = 3;
  const notificationCount = 5;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileService.getProfile();
        setProfile(response.data || response);
      } catch (error) {
        console.error('Failed to load profile in header:', error);
      }
    };
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () =>
      window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await customerAuthApi.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center ml-4">
            <img
              src="/Philbox.PNG"
              alt="PhilBox"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <SearchBar isMobile={false} />

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            <NotificationDropdown 
              notifications={[
                { id: 1, text: 'Your order #123 has been shipped!', time: '2 hours ago', type: 'info', unread: true },
                { id: 2, text: 'Appointment confirmed with Dr. Smith', time: '1 day ago', type: 'success', unread: true },
                { id: 3, text: 'New prescription available from Dr. Khan', time: '2 days ago', type: 'info', unread: false },
              ]}
              unreadCount={notificationCount}
              viewAllPath="/notifications"
              portalColor="blue"
            />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                {profile.profile_img ? (
                  <img
                    src={profile.profile_img}
                    className="w-8 h-8 rounded-full border object-cover"
                    alt="Profile"
                  />
                ) : (
                  <FaUserCircle size={24} />
                )}
                <span className="hidden lg:block text-sm font-medium max-w-24 truncate">
                  {profile.fullName || 'User'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="fixed sm:absolute top-[64px] sm:top-full left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 mt-0 sm:mt-2 sm:right-0 w-[92vw] max-w-[280px] sm:max-w-none sm:w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b">
                    <p className="font-medium text-gray-800">
                      {profile.fullName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {profile.email || ''}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaUser size={14} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaClipboardList size={14} />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/appointments"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaCalendarAlt size={14} />
                      <span>Appointments</span>
                    </Link>
                  </div>

                  <div className="border-t pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBar isMobile={true} />
        </div>
      </div>
    </header>
  );
}
