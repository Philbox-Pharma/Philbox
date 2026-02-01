/* eslint-disable react-hooks/exhaustive-deps */
// src/portals/admin/layouts/components/AdminHeader.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaChevronDown,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaUserPlus,
  FaCodeBranch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaExclamationCircle,
  FaUsers,
  FaUserMd,
  FaUserFriends,
} from 'react-icons/fa';
import {
  adminAuthApi,
  activityLogsApi,
  globalSearchApi,
} from '../../../../core/api/admin/adminApi';

export default function AdminHeader({ toggleSidebar, admin }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback(async query => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const results = await globalSearchApi.search(query, 5);
      setSearchResults(results);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchInputChange = e => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handle keyboard navigation
  const handleSearchKeyDown = e => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          navigateToResult(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  // Navigate to search result
  const navigateToResult = result => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(result.path);
  };

  // Get icon for result type
  const getResultIcon = type => {
    switch (type) {
      case 'branch':
        return <FaCodeBranch className="text-blue-500" />;
      case 'admin':
        return <FaShieldAlt className="text-purple-500" />;
      case 'salesperson':
        return <FaUsers className="text-green-500" />;
      case 'customer':
        return <FaUserFriends className="text-orange-500" />;
      case 'doctor':
        return <FaUserMd className="text-teal-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  // Get label for result type
  const getResultLabel = type => {
    const labels = {
      branch: 'Branch',
      admin: 'Admin',
      salesperson: 'Salesperson',
      customer: 'Customer',
      doctor: 'Doctor',
    };
    return labels[type] || 'Item';
  };

  // Fetch notifications (from activity logs)
  useEffect(() => {
    fetchNotifications();
    // Refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      // Get recent activity logs as notifications
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // Last 7 days

      const response = await activityLogsApi.getTimeline({
        startDate,
        endDate,
        limit: 10,
        page: 1,
      });

      if (response.status === 200 || response.data) {
        const logs = response.data?.logs || response.data?.timeline || [];
        const formattedNotifications = logs.slice(0, 10).map((log, index) => ({
          id: log._id || index,
          text: formatNotificationText(log),
          time: formatTimeAgo(log.created_at || log.createdAt),
          type: getNotificationType(log.action_type),
          unread: index < 3, // First 3 are unread
        }));
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => n.unread).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Fallback mock data
      setNotifications([
        {
          id: 1,
          text: 'No recent notifications',
          time: 'Just now',
          type: 'info',
          unread: false,
        },
      ]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Format notification text from activity log
  const formatNotificationText = log => {
    const actionType = log.action_type || '';
    const description = log.description || '';

    // If description exists, use it
    if (description) return description;

    // Otherwise format from action_type
    const actionMap = {
      create_admin: 'New admin was created',
      update_admin: 'Admin profile was updated',
      delete_admin: 'Admin was deleted',
      create_salesperson: 'New salesperson was added',
      update_salesperson: 'Salesperson profile was updated',
      delete_salesperson: 'Salesperson was removed',
      create_branch: 'New branch was created',
      update_branch: 'Branch was updated',
      delete_branch: 'Branch was deleted',
      login: 'Admin logged in',
      logout: 'Admin logged out',
      approve_doctor: 'Doctor application approved',
      reject_doctor: 'Doctor application rejected',
    };

    return (
      actionMap[actionType] ||
      actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  // Get notification icon type
  const getNotificationType = actionType => {
    if (!actionType) return 'info';
    if (actionType.includes('create') || actionType.includes('add'))
      return 'success';
    if (actionType.includes('delete') || actionType.includes('remove'))
      return 'danger';
    if (actionType.includes('update') || actionType.includes('edit'))
      return 'warning';
    if (actionType.includes('approve')) return 'success';
    if (actionType.includes('reject')) return 'danger';
    return 'info';
  };

  // Format time ago
  const formatTimeAgo = dateString => {
    if (!dateString) return 'Just now';

    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon
  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'danger':
        return <FaTrash className="text-red-500" />;
      case 'warning':
        return <FaEdit className="text-yellow-500" />;
      default:
        return <FaExclamationCircle className="text-blue-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  // Get admin display name
  const adminName = admin?.name || admin?.fullName || 'Admin';
  const adminEmail = admin?.email || 'admin@philbox.com';
  const adminCategory =
    admin?.category || admin?.admin_category || 'super-admin';
  const displayCategory =
    adminCategory === 'super-admin' || adminCategory === 'super_admin'
      ? 'Super Admin'
      : 'Branch Admin';

  return (
    <header className="bg-[#1a365d] text-white shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side - Menu Toggle & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>

          <Link to="/admin/dashboard" className="hidden sm:block">
            <h1 className="text-lg font-bold text-white">Philbox Admin</h1>
          </Link>
        </div>

        {/* Center - Search Bar */}
        <div
          className="hidden md:flex flex-1 max-w-md mx-8 relative"
          ref={searchRef}
        >
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search branches, staff, customers..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() =>
                searchQuery.length >= 2 && setShowSearchResults(true)
              }
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d69e2e] focus:border-transparent"
            />
            {searchLoading && (
              <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 animate-spin" />
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-gray-400 text-xl" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => navigateToResult(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedIndex === index ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium truncate">
                            {result.name}
                          </p>
                          <p className="text-gray-500 text-sm truncate">
                            {result.description}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                          {getResultLabel(result.type)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="py-8 text-center text-gray-500">
                    <FaSearch className="text-3xl mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) fetchNotifications();
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
            >
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 bg-[#1a365d] text-white flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-white/70 hover:text-white"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <FaSpinner className="animate-spin text-gray-400 text-xl" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-start gap-3 ${
                            notif.unread ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-sm">
                              {notif.text}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {notif.time}
                            </p>
                          </div>
                          {notif.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <FaBell className="text-3xl mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-gray-50 text-center border-t">
                    <Link
                      to="/admin/analytics/activity-logs"
                      className="text-[#1a365d] text-sm font-medium hover:underline"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View All Activity
                    </Link>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {admin?.profile_img_url ? (
                <img
                  src={admin.profile_img_url}
                  alt={adminName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 rounded-full bg-[#d69e2e] flex items-center justify-center ${
                  admin?.profile_img_url ? 'hidden' : ''
                }`}
              >
                <span className="text-white text-sm font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{adminName}</p>
                <p className="text-xs text-white/70">{displayCategory}</p>
              </div>
              <FaChevronDown
                className={`text-sm transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                  {/* Profile Header */}
                  <div className="p-4 bg-linear-to-r from-[#1a365d] to-[#2c5282] text-white">
                    <div className="flex items-center gap-3">
                      {admin?.profile_img_url ? (
                        <img
                          src={admin.profile_img_url}
                          alt={adminName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#d69e2e] flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {adminName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{adminName}</p>
                        <p className="text-sm text-white/80 truncate">
                          {adminEmail}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          displayCategory === 'Super Admin'
                            ? 'bg-purple-500/30 text-purple-100'
                            : 'bg-blue-500/30 text-blue-100'
                        }`}
                      >
                        {displayCategory}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/admin/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaUser className="text-[#1a365d]" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaCog className="text-[#1a365d]" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/admin/roles-permissions"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaShieldAlt className="text-[#1a365d]" />
                      <span>Roles & Permissions</span>
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
