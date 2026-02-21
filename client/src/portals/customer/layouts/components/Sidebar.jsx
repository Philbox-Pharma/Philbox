import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaPills,
  FaShoppingCart,
  FaClipboardList,
  FaCalendarAlt,
  FaFilePrescription,
  FaUser,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaUserMd,
  FaHeadset,
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FaHome },
    { label: 'Medicines', path: '/medicines', icon: FaPills },
    { label: 'Cart', path: '/cart', icon: FaShoppingCart },
    { label: 'My Orders', path: '/orders', icon: FaClipboardList },
    { label: 'Appointments', path: '/appointments', icon: FaCalendarAlt },
    {
      label: 'Prescriptions',
      path: '/prescriptions',
      icon: FaFilePrescription,
    },
    { label: 'Notifications', path: '/notifications', icon: FaBell },
    { label: 'My Profile', path: '/profile', icon: FaUser },
  ];

  // Check if path is active
  const isActive = path => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2 border-b">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <FaChevronRight size={14} />
            ) : (
              <FaChevronLeft size={14} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
              Quick Actions
            </p>
            <Link
              to="/appointments/book"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-green-600 bg-green-50 hover:bg-green-100"
            >
              <FaUserMd size={18} />
              <span className="text-sm font-medium">Book Appointment</span>
            </Link>
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              <FaHeadset size={18} />
              <span className="text-sm font-medium">Help & Support</span>
            </button>
          </div>
        )}

        {/* Collapsed Quick Actions */}
        {collapsed && (
          <div className="p-2 border-t space-y-2">
            <Link
              to="/appointments/book"
              className="flex items-center justify-center p-2.5 rounded-lg transition-colors text-green-600 bg-green-50 hover:bg-green-100"
              title="Book Appointment"
            >
              <FaUserMd size={18} />
            </Link>
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-center p-2.5 rounded-lg transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100"
              title="Help & Support"
            >
              <FaHeadset size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 5).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Contact Support Modal - Reusable Component */}
      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}
