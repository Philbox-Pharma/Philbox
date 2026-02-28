import { useState } from 'react';
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
import { customerAuthApi } from '../../../../core/api/customer/auth.service';

export default function Header() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data - baad mein API se aayega
  const cartCount = 3;
  const notificationCount = 5;
  const userName = 'John Doe';

  // Handle search
  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${searchQuery}`);
    }
  };

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
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search medicines, healthcare products..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 text-white rounded-r-full hover:bg-blue-600 transition-colors"
              >
                <FaSearch />
              </button>
            </div>
          </form>

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

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaBell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                      <p className="text-sm text-gray-800">
                        Your order #123 has been shipped!
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                      <p className="text-sm text-gray-800">
                        Appointment confirmed with Dr. Smith
                      </p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-blue-500 bg-blue-50">
                      <p className="text-sm text-gray-800">
                        New prescription available from Dr. Khan
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t">
                    <Link
                      to="/notifications"
                      className="text-sm text-blue-600 hover:underline font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaUserCircle size={24} />
                <span className="hidden lg:block text-sm font-medium max-w-24 truncate">
                  {userName}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b">
                    <p className="font-medium text-gray-800">{userName}</p>
                    <p className="text-sm text-gray-500">john@example.com</p>
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
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 text-white rounded-r-full"
              >
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
