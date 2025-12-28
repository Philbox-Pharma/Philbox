import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBell,
    FaShoppingBag,
    FaCalendarCheck,
    FaFilePrescription,
    FaTruck,
    FaCheckCircle,
    FaExclamationCircle,
    FaTrash,
    FaCheck,
    FaFilter
} from 'react-icons/fa';

export default function Notifications() {
    const [filter, setFilter] = useState('all');

    // Mock notifications data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'order',
            title: 'Order Shipped',
            message: 'Your order #ORD-2024-002 has been shipped. Track your package now.',
            link: '/orders/ORD-2024-002',
            time: '2 hours ago',
            read: false,
            icon: FaTruck,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            id: 2,
            type: 'appointment',
            title: 'Appointment Reminder',
            message: 'Your appointment with Dr. Ahmed Khan is tomorrow at 10:00 AM.',
            link: '/appointments',
            time: '5 hours ago',
            read: false,
            icon: FaCalendarCheck,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            id: 3,
            type: 'prescription',
            title: 'New Prescription',
            message: 'Dr. Sara Ali has sent you a new prescription. View and order medicines.',
            link: '/prescriptions',
            time: '1 day ago',
            read: false,
            icon: FaFilePrescription,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            id: 4,
            type: 'order',
            title: 'Order Delivered',
            message: 'Your order #ORD-2024-001 has been delivered successfully.',
            link: '/orders/ORD-2024-001',
            time: '2 days ago',
            read: true,
            icon: FaCheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            id: 5,
            type: 'appointment',
            title: 'Appointment Confirmed',
            message: 'Your appointment with Dr. Fatima Noor has been confirmed for Jan 30.',
            link: '/appointments',
            time: '3 days ago',
            read: true,
            icon: FaCalendarCheck,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            id: 6,
            type: 'system',
            title: 'Profile Incomplete',
            message: 'Please complete your profile to get personalized recommendations.',
            link: '/profile',
            time: '5 days ago',
            read: true,
            icon: FaExclamationCircle,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
        },
        {
            id: 7,
            type: 'order',
            title: 'Order Placed',
            message: 'Your order #ORD-2024-003 has been placed successfully.',
            link: '/orders/ORD-2024-003',
            time: '1 week ago',
            read: true,
            icon: FaShoppingBag,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ]);

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    // Unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark as read
    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    // Delete notification
    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Clear all notifications
    const clearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-gray-500 mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                </div>
                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                            >
                                <FaCheck />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={clearAll}
                            className="inline-flex items-center gap-1 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                            <FaTrash />
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <FaFilter className="text-gray-400 flex-shrink-0" />
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'order', label: 'Orders' },
                    { id: 'appointment', label: 'Appointments' },
                    { id: 'prescription', label: 'Prescriptions' },
                    { id: 'system', label: 'System' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-sm border p-4 transition-all ${!notification.read ? 'border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.iconBg}`}>
                                        <Icon className={`text-xl ${notification.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                            </div>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-400">{notification.time}</span>
                                            <div className="flex items-center gap-2">
                                                {notification.link && (
                                                    <Link
                                                        to={notification.link}
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-sm text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBell className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
                    <p className="text-gray-500">
                        {filter !== 'all' ? 'No notifications in this category' : "You're all caught up!"}
                    </p>
                </div>
            )}
        </div>
    );
}
