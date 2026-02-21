// src/portals/admin/modules/notifications/Notifications.jsx
import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FaBell,
  FaSpinner,
  FaCheck,
  FaTrash,
  FaEdit,
  FaExclamationCircle,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaFilter,
  FaSearch,
  FaCheckDouble,
  FaCodeBranch,
  FaUserShield,
  FaUserTie,
} from 'react-icons/fa';
import { activityLogsApi } from '../../../../core/api/admin/adminApi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, admin, salesperson
  const [searchQuery, setSearchQuery] = useState('');
  const [markedAsRead, setMarkedAsRead] = useState(new Set());

  // Date range for fetching
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await activityLogsApi.getTimeline({
          startDate: new Date(dateRange.startDate).toISOString(),
          endDate: new Date(dateRange.endDate + 'T23:59:59').toISOString(),
          limit: 20,
          page,
          userType: filter === 'all' ? undefined : filter,
        });

        if (response.status === 200 || response.data) {
          const logs =
            response.data?.logs ||
            response.data?.timeline ||
            response.data ||
            [];
          const formattedNotifications = Array.isArray(logs)
            ? logs.map((log, index) => ({
                id: log._id || `notif-${index}`,
                text: formatNotificationText(log),
                description: log.description || '',
                time: formatTimeAgo(log.created_at || log.createdAt),
                timestamp: new Date(log.created_at || log.createdAt),
                type: getNotificationType(log.action_type),
                actionType: log.action_type,
                user:
                  log.admin_id?.name ||
                  log.salesperson_id?.fullName ||
                  'System',
                userType: log.admin_id
                  ? 'admin'
                  : log.salesperson_id
                    ? 'salesperson'
                    : 'system',
                ipAddress: log.ip_address,
                userAgent: log.user_agent,
              }))
            : [];

          setNotifications(formattedNotifications);
          setTotalPages(response.data?.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page, dateRange, filter]);

  // Format notification text from activity log

  const formatNotificationText = log => {
    const actionType = log.action_type || '';
    const description = log.description || '';

    if (description) return description;

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
      login: 'User logged in',
      logout: 'User logged out',
      approve_doctor: 'Doctor application approved',
      reject_doctor: 'Doctor application rejected',
      create_customer: 'New customer registered',
      update_customer: 'Customer profile updated',
      create_order: 'New order placed',
      update_order: 'Order status updated',
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
    if (actionType.includes('login')) return 'info';
    if (actionType.includes('logout')) return 'info';
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
  const getNotificationIcon = (type, actionType) => {
    if (actionType?.includes('login'))
      return <FaSignInAlt className="text-blue-500" />;
    if (actionType?.includes('logout'))
      return <FaSignOutAlt className="text-gray-500" />;
    if (actionType?.includes('branch'))
      return <FaCodeBranch className="text-indigo-500" />;
    if (actionType?.includes('admin'))
      return <FaUserShield className="text-purple-500" />;
    if (actionType?.includes('salesperson'))
      return <FaUserTie className="text-green-500" />;

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

  const markAsRead = id => {
    setMarkedAsRead(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setMarkedAsRead(new Set(allIds));
  };

  const filteredNotifications = notifications.filter(
    n =>
      searchQuery === '' ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBell className="text-[#1a365d]" />
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            Activity logs and system notifications
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
        >
          <FaCheckDouble />
          Mark All as Read
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
            />
          </div>

          {/* User Type Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins Only</option>
              <option value="salesperson">Salespersons Only</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <FaExclamationCircle />
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-[#1a365d]" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map((notif, index) => (
                <Motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !markedAsRead.has(notif.id) ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      {getNotificationIcon(notif.type, notif.actionType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">{notif.text}</p>
                      {notif.description &&
                        notif.description !== notif.text && (
                          <p className="text-gray-500 text-sm mt-1">
                            {notif.description}
                          </p>
                        )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          {notif.userType === 'admin' && (
                            <FaUserShield className="text-purple-400" />
                          )}
                          {notif.userType === 'salesperson' && (
                            <FaUserTie className="text-green-400" />
                          )}
                          {notif.user}
                        </span>
                        <span>{notif.time}</span>
                        {notif.ipAddress && (
                          <span className="hidden md:inline">
                            IP: {notif.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!markedAsRead.has(notif.id) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                    )}
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FaBell className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm">Try adjusting your filters or date range</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
