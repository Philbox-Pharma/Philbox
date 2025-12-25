// src/portals/admin/layouts/components/AdminHeader.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBars,
    FaBell,
    FaUserCircle,
    FaSignOutAlt,
    FaCog,
    FaUser,
    FaChevronDown,
    FaSearch,
    FaMoon,
    FaSun,
    FaShieldAlt
} from 'react-icons/fa';
import { adminAuthApi } from '../../../../core/api/admin/adminApi';

export default function AdminHeader({ toggleSidebar, sidebarOpen, admin }) {
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await adminAuthApi.logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/admin/login');
        }
    };

    // Mock notifications
    const notifications = [
        { id: 1, text: 'New branch request pending', time: '5 min ago', unread: true },
        { id: 2, text: 'Salesperson added to Lahore Branch', time: '1 hour ago', unread: true },
        { id: 3, text: 'System update completed', time: '2 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="bg-[#1a365d] text-white shadow-lg sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left Side - Menu Toggle & Logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                    >
                        <FaBars className="text-xl" />
                    </button>

                    <Link to="/admin/dashboard" className="flex items-center gap-3">

                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold">Philbox Admin</h1>
                            <p className="text-xs text-white/70">Management Portal</p>
                        </div>
                    </Link>
                </div>

                {/* Center - Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search branches, staff, orders..."
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d69e2e] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
                    >
                        {darkMode ? <FaSun className="text-[#d69e2e]" /> : <FaMoon />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                        >
                            <FaBell className="text-xl" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notificationsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-4 bg-[#1a365d] text-white">
                                        <h3 className="font-semibold">Notifications</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                    notif.unread ? 'bg-blue-50/50' : ''
                                                }`}
                                            >
                                                <p className="text-gray-800 text-sm">{notif.text}</p>
                                                <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-gray-50 text-center">
                                        <Link
                                            to="/admin/notifications"
                                            className="text-[#1a365d] text-sm font-medium hover:underline"
                                        >
                                            View All Notifications
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#d69e2e] flex items-center justify-center">
                                <FaUserCircle className="text-white text-lg" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium">{admin?.fullName || 'Admin'}</p>
                                <p className="text-xs text-white/70">{admin?.admin_category || 'Super Admin'}</p>
                            </div>
                            <FaChevronDown className={`text-sm transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {profileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-4 bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white">
                                        <p className="font-semibold">{admin?.fullName || 'Admin User'}</p>
                                        <p className="text-sm text-white/80">{admin?.email || 'admin@philbox.com'}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            to="/admin/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FaUser className="text-[#1a365d]" />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            to="/admin/settings"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FaCog className="text-[#1a365d]" />
                                            <span>Settings</span>
                                        </Link>
                                        <Link
                                            to="/admin/permissions"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FaShieldAlt className="text-[#1a365d]" />
                                            <span>Permissions</span>
                                        </Link>
                                        <hr className="my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                                        >
                                            <FaSignOutAlt />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
