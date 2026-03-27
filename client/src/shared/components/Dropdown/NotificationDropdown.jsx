import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner, FaHistory } from 'react-icons/fa';

/**
 * Reusable Notification Dropdown
 * @param {Array} notifications - List of notification objects
 * @param {Boolean} loading - Loading state
 * @param {Number} unreadCount - unread notifications count
 * @param {Function} onMarkRead - mark one as read
 * @param {Function} onMarkAllRead - mark all as read
 * @param {String} viewAllPath - link to view full notification history
 * @param {String} portalColor - primary color for the portal (e.g., 'blue', 'emerald', 'indigo')
 */
export default function NotificationDropdown({
  notifications = [],
  loading = false,
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  viewAllPath = '#',
  portalColor = 'blue',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'danger': return <FaTimes className="text-red-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100 ring-blue-500',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 ring-indigo-500',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 ring-purple-500',
  };

  const selectedColor = colors[portalColor] || colors.blue;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all group ${
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        <FaBell className={`text-xl transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed sm:absolute top-[64px] sm:top-full left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 mt-0 sm:mt-2 sm:right-0 w-[92vw] max-w-[360px] sm:max-w-none sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className={`px-5 py-4 flex items-center justify-between border-b ${selectedColor}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FaBell className="text-sm" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs font-semibold hover:underline opacity-80 hover:opacity-100"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <FaSpinner className="animate-spin text-2xl mb-2" />
                  <p className="text-xs">Fetching notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      onClick={() => onMarkRead?.(n._id || n.id)}
                      className={`px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer group ${
                        n.unread ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 transition-transform">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.unread ? 'text-gray-900 font-semibold' : 'text-gray-600 font-medium'}`}>
                          {n.message || n.text}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <FaHistory size={10} /> {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <FaBell className="text-2xl opacity-20" />
                  </div>
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">We'll alert you when there's an update</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <Link
                to={viewAllPath}
                className={`text-sm font-bold hover:underline py-1 px-4 inline-block ${selectedColor.split(' ')[0]}`}
                onClick={() => setIsOpen(false)}
              >
                View All Activity
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
