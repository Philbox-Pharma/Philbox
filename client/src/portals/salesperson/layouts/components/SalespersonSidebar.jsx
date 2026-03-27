import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaExclamationTriangle,
  FaTasks,
  FaBoxOpen,
  FaBoxes,
  FaTimes,
  FaHeadset,
  FaUserTie,
  FaUser,
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function SalespersonSidebar({ isOpen, closeSidebar, salesperson }) {
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/salesperson/dashboard',
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: FaBoxes,
      path: '/salesperson/inventory',
    },
    {
      key: 'tasks',
      label: 'My Tasks',
      icon: FaTasks,
      path: '/salesperson/tasks',
    },
    {
      key: 'alerts',
      label: 'Low Stock Alerts',
      icon: FaExclamationTriangle,
      path: '/salesperson/alerts',
    },
    {
      key: 'orders',
      label: 'Orders to Process',
      icon: FaBoxOpen,
      path: '/salesperson/orders',
    },
    {
      key: 'profile',
      label: 'My Profile',
      icon: FaUser,
      path: '/salesperson/profile',
    },
  ];

  const NavItem = ({ item }) => {
    return (
      <NavLink
        to={item.path}
        onClick={() => window.innerWidth < 1024 && closeSidebar()}
        className={({ isActive }) => `
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${
            isActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <item.icon className="text-lg" />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-[#1e293b] z-50
          transform transition-transform duration-300 ease-in-out border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-xl
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-gradient-to-r from-blue-700 to-indigo-800">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
            <FaUserTie className="text-blue-300" />
            <span>Philbox Sales</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Salesperson Info Card */}
        {salesperson && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {salesperson.fullName ? salesperson.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {salesperson.fullName || 'Salesperson'}
                </p>
                <p className="text-blue-300 text-xs truncate">Sales Agent</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-blue-800 to-indigo-900">
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-300 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <FaHeadset size={16} />
            <span>Help & Support</span>
          </button>
        </div>
      </aside>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}
