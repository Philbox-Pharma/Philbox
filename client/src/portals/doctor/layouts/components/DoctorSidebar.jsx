import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCalendarAlt,
  FaStethoscope,
  FaComments,
  FaUserMd,
  FaPrescriptionBottleAlt,
  FaTimes,
  FaHeadset,
  FaChevronDown,
  FaChevronRight,
  FaClock,
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function DoctorSidebar({ isOpen, closeSidebar, doctor }) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      [menuKey]: !prev[menuKey],
    }));
  };

  // Lock body scroll when mobile sidebar is open
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
      path: '/doctor/dashboard',
    },
    {
      key: 'appointments',
      label: 'Appointments',
      icon: FaCalendarCheck,
      submenu: [
        { label: 'Pending Requests', path: '/doctor/appointments/requests' },
        { label: 'My Schedule', path: '/doctor/appointments/schedule' },
      ],
    },
    {
      key: 'slots',
      label: 'Availability',
      icon: FaClock,
      path: '/doctor/slots',
    },
    {
      key: 'consultations',
      label: 'Consultations',
      icon: FaStethoscope,
      path: '/doctor/consultations',
    },
    {
      key: 'prescriptions',
      label: 'Prescriptions',
      icon: FaPrescriptionBottleAlt,
      path: '/doctor/prescriptions',
    },
    {
      key: 'feedback',
      label: 'Patient Feedback',
      icon: FaComments,
      path: '/doctor/feedback',
    },
    {
      key: 'profile',
      label: 'My Profile',
      icon: FaUserMd,
      path: '/doctor/profile',
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = item.path
      ? location.pathname === item.path
      : item.submenu?.some(
          (sub) =>
            location.pathname === sub.path ||
            location.pathname.startsWith(sub.path.split('?')[0])
        );

    const isExpanded = expandedMenus[item.key];

    if (item.submenu) {
      return (
        <div>
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <FaChevronDown className="text-xs" />
            ) : (
              <FaChevronRight className="text-xs" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1 pl-3 border-l border-white/10">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      end
                      onClick={() =>
                        window.innerWidth < 1024 && closeSidebar()
                      }
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm transition-all duration-200
                        ${
                          isActive
                            ? 'text-emerald-400 font-medium bg-white/5'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        onClick={() => window.innerWidth < 1024 && closeSidebar()}
        className={({ isActive }) => `
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${
            isActive
              ? 'bg-emerald-500 text-white shadow-md'
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
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-[#0f2b3d] z-50
          transform transition-transform duration-300 ease-in-out border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-xl
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-gradient-to-r from-emerald-700 to-[#0f2b3d]">
          <div className="flex items-center justify-center w-full lg:w-auto">
            <img
              src="/Philbox.PNG"
              alt="Philbox Doctor"
              className="h-10 w-auto object-contain drop-shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2 text-white font-bold text-xl tracking-wide">
              <FaUserMd className="text-emerald-400" />
              <span>Philbox</span>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Doctor Info Card */}
        {doctor && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  Dr. {doctor.name || 'Doctor'}
                </p>
                <p className="text-emerald-400/70 text-xs truncate">
                  {doctor.specialization || 'Physician'}
                </p>
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
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-emerald-700 to-[#0f2b3d]">
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-400 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
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
