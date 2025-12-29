/* eslint-disable no-unused-vars */
// src/portals/admin/layouts/components/AdminSidebar.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaCodeBranch,
  FaUsers,
  FaShieldAlt,
  FaChartBar,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaBoxes,
  FaClipboardList,
  FaUserMd,
  FaBell,
  FaQuestionCircle,
  FaUserShield,
} from 'react-icons/fa';

export default function AdminSidebar({ isOpen, closeSidebar, admin }) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = menuKey => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const hasPermission = permission => {
    if (!admin?.role?.permissions) return true;
    return admin.role.permissions.includes(permission);
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/admin/dashboard',
      permission: null,
    },
    {
      key: 'branches',
      label: 'Branch Management',
      icon: FaCodeBranch,
      permission: 'read_branches',
      submenu: [
        {
          label: 'All Branches',
          path: '/admin/branches',
          permission: 'read_branches',
        },
        {
          label: 'Add Branch',
          path: '/admin/branches/add',
          permission: 'create_branches',
        },
        {
          label: 'Statistics & Analytics',
          path: '/admin/branches/statistics',
          permission: 'read_branches',
        },
      ],
    },
    {
      key: 'staff',
      label: 'Staff Management',
      icon: FaUsers,
      permission: 'read_users',
      submenu: [
        {
          label: 'All Admins',
          path: '/admin/staff/admins',
          permission: 'read_users',
        },
        {
          label: 'Add Admin',
          path: '/admin/staff/admins/add',
          permission: 'create_users',
        },
        {
          label: 'Salespersons',
          path: '/admin/staff/salespersons',
          permission: 'read_users',
        },
        {
          label: 'Add Salesperson',
          path: '/admin/staff/salespersons/add',
          permission: 'create_users',
        },
      ],
    },
    {
      key: 'doctors',
      label: 'Doctors',
      icon: FaUserMd,
      permission: 'read_doctors',
      submenu: [
        {
          label: 'All Doctors',
          path: '/admin/doctors',
          permission: 'read_doctors',
        },
        {
          label: 'Applications',
          path: '/admin/doctors/applications',
          permission: 'read_doctors',
        },
      ],
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: FaClipboardList,
      permission: 'read_orders',
      submenu: [
        {
          label: 'All Orders',
          path: '/admin/orders',
          permission: 'read_orders',
        },
        {
          label: 'Pending Orders',
          path: '/admin/orders?status=pending',
          permission: 'read_orders',
        },
        {
          label: 'Completed Orders',
          path: '/admin/orders?status=completed',
          permission: 'read_orders',
        },
      ],
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: FaBoxes,
      path: '/admin/inventory',
      permission: 'read_medicines',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: FaChartBar,
      permission: 'read_reports',
      submenu: [
        {
          label: 'Revenue Analytics',
          path: '/admin/analytics/revenue',
          permission: 'read_reports',
        },
        {
          label: 'User Engagement',
          path: '/admin/analytics/engagement',
          permission: 'read_reports',
        },
        {
          label: 'Activity Logs',
          path: '/admin/analytics/activity-logs',
          permission: 'read_reports',
        },
      ],
    },
    {
      key: 'permissions',
      label: 'Roles & Permissions',
      icon: FaShieldAlt,
      path: '/admin/roles-permissions',
      permission: 'read_users',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: FaBell,
      path: '/admin/notifications',
      permission: null,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: FaCog,
      path: '/admin/settings',
      permission: null,
    },
  ];

  const NavItem = ({ item }) => {
    if (item.permission && !hasPermission(item.permission)) return null;

    const isActive = item.path
      ? location.pathname === item.path
      : item.submenu?.some(
          sub =>
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
                ? 'bg-[#d69e2e] text-white shadow-md'
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
                  {item.submenu.map(subItem => {
                    if (
                      subItem.permission &&
                      !hasPermission(subItem.permission)
                    )
                      return null;
                    const subPath = subItem.path.split('?')[0];

                    return (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() =>
                          window.innerWidth < 1024 && closeSidebar()
                        }
                        className={({ isActive }) => `
                                                    block py-2 px-3 rounded-lg text-sm transition-all duration-200
                                                    ${
                                                      isActive ||
                                                      location.pathname ===
                                                        subPath
                                                        ? 'text-[#d69e2e] font-medium bg-white/5'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }
                                                `}
                      >
                        {subItem.label}
                      </NavLink>
                    );
                  })}
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
                        ? 'bg-[#d69e2e] text-white shadow-md'
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
                    fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#1a365d] z-50
                    transform transition-transform duration-300 ease-in-out border-r border-white/5
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col shadow-xl
                `}
      >
        {/* Header - Gradient Blue-Green */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-linear-to-r from-[#2f855a] to-[#1a365d]">
          <div className="flex items-center justify-center w-full lg:w-auto">
            <img
              src="/Philbox.PNG"
              alt="Philbox Admin"
              className="h-10 w-auto object-contain drop-shadow-md"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback if image fails */}
            <div className="hidden items-center gap-2 text-white font-bold text-xl tracking-wide">
              <FaUserShield className="text-[#d69e2e]" />
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {menuItems.map(item => (
            <NavItem key={item.key} item={item} />
          ))}
        </nav>

        {/* Footer - Gradient Blue-Green */}
        <div className="p-4 border-t border-white/10 bg-linear-to-r from-[#2f855a] to-[#1a365d]">
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <FaQuestionCircle />
            <span>Need Help?</span>
          </div>
          <a
            href="mailto:support@philbox.com"
            className="text-[#d69e2e] text-sm hover:underline mt-1 block pl-7"
          >
            Contact Support
          </a>
        </div>
      </aside>
    </>
  );
}
