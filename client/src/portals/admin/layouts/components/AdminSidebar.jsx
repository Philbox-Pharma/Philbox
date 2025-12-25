// src/portals/admin/layouts/components/AdminSidebar.jsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTachometerAlt,
    FaCodeBranch,
    FaUsers,
    FaUserTie,
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
    FaQuestionCircle
} from 'react-icons/fa';

export default function AdminSidebar({ isOpen, closeSidebar, admin }) {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const hasPermission = (permission) => {
        if (!admin?.role?.permissions) return true;
        return admin.role.permissions.includes(permission);
    };

    const menuItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: FaTachometerAlt,
            path: '/admin/dashboard',
            permission: null
        },
        {
            key: 'branches',
            label: 'Branch Management',
            icon: FaCodeBranch,
            permission: 'read_branches',
            submenu: [
                { label: 'All Branches', path: '/admin/branches', permission: 'read_branches' },
                { label: 'Add Branch', path: '/admin/branches/add', permission: 'create_branches' },
                { label: 'Branch Statistics', path: '/admin/branches/statistics', permission: 'read_branches' },
            ]
        },
        {
            key: 'staff',
            label: 'Staff Management',
            icon: FaUsers,
            permission: 'read_users',
            submenu: [
                { label: 'All Admins', path: '/admin/staff/admins', permission: 'read_users' },
                { label: 'Salespersons', path: '/admin/staff/salespersons', permission: 'read_users' },
                { label: 'Add Salesperson', path: '/admin/staff/salespersons/add', permission: 'create_users' },
            ]
        },
        {
            key: 'doctors',
            label: 'Doctors',
            icon: FaUserMd,
            path: '/admin/doctors',
            permission: 'read_doctors'
        },
        {
            key: 'orders',
            label: 'Orders',
            icon: FaClipboardList,
            permission: 'read_orders',
            submenu: [
                { label: 'All Orders', path: '/admin/orders', permission: 'read_orders' },
                { label: 'Pending Orders', path: '/admin/orders/pending', permission: 'read_orders' },
                { label: 'Completed Orders', path: '/admin/orders/completed', permission: 'read_orders' },
            ]
        },
        {
            key: 'inventory',
            label: 'Inventory',
            icon: FaBoxes,
            path: '/admin/inventory',
            permission: 'read_medicines'
        },
        {
            key: 'permissions',
            label: 'Roles & Permissions',
            icon: FaShieldAlt,
            path: '/admin/permissions',
            permission: 'read_users'
        },
        {
            key: 'reports',
            label: 'Reports & Analytics',
            icon: FaChartBar,
            path: '/admin/reports',
            permission: 'read_reports'
        },
        {
            key: 'notifications',
            label: 'Notifications',
            icon: FaBell,
            path: '/admin/notifications',
            permission: null
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: FaCog,
            path: '/admin/settings',
            permission: null
        },
    ];

    const NavItem = ({ item }) => {
        if (item.permission && !hasPermission(item.permission)) return null;

        const isActive = item.path
            ? location.pathname === item.path
            : item.submenu?.some(sub => location.pathname === sub.path);

        const isExpanded = expandedMenus[item.key];

        if (item.submenu) {
            return (
                <div>
                    <button
                        onClick={() => toggleMenu(item.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                                ? 'bg-[#d69e2e] text-white'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="text-lg" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/20 pl-4">
                                    {item.submenu.map((subItem) => {
                                        if (subItem.permission && !hasPermission(subItem.permission)) return null;
                                        return (
                                            <NavLink
                                                key={subItem.path}
                                                to={subItem.path}
                                                onClick={() => window.innerWidth < 1024 && closeSidebar()}
                                                className={({ isActive }) => `
                                                    block py-2 px-3 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-white/20 text-[#d69e2e] font-medium'
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
                    ${isActive
                        ? 'bg-[#d69e2e] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}
            >
                {/* Header - Mobile close button only */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between lg:justify-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-lg">
                            <img
                                src="/Philbox.PNG"
                                alt="Philbox"
                                className="h-8 w-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/vite.svg';
                                }}
                            />
                        </div>


                    </div>

                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                    {menuItems.map((item) => (
                        <NavItem key={item.key} item={item} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <FaQuestionCircle />
                        <span>Need Help?</span>
                    </div>
                    <a
                        href="mailto:support@philbox.com"
                        className="text-[#d69e2e] text-sm hover:underline mt-1 block"
                    >
                        Contact Support
                    </a>
                </div>
            </aside>
        </>
    );
}
