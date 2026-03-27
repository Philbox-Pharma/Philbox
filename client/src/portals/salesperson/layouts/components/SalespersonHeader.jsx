import { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../../../shared/components/Dropdown/NotificationDropdown';
import { salespersonAlertsApi } from '../../../../core/api/salesperson/alerts.service';

export default function SalespersonHeader({
  toggleSidebar,
  salesperson,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlertsAsNotifications();
    const interval = setInterval(fetchAlertsAsNotifications, 180000); // 3 mins
    return () => clearInterval(interval);
  }, []);

  const fetchAlertsAsNotifications = async () => {
    try {
      setLoading(true);
      const res = await salespersonAlertsApi.getLowStockAlerts({ limit: 5 });
      const alerts = res.data?.data?.alerts || [];
      
      const formatted = alerts.slice(0, 5).map(alert => ({
        id: alert._id,
        text: `Low stock: ${alert.medicine_id?.name || 'Medicine'} (${alert.current_stock} left)`,
        time: 'Just now',
        type: 'warning',
        unread: true
      }));

      setNotifications(formatted);
      setUnreadCount(formatted.length);
    } catch (err) {
      console.error('Failed to fetch alerts for notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout('salesperson');
    navigate('/salesperson/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaBars size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Dropdown */}
        <NotificationDropdown 
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onMarkAllRead={() => setUnreadCount(0)}
          viewAllPath="/salesperson/alerts"
          portalColor="blue"
        />

        {/* Separator */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-sm">
            {salesperson?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

