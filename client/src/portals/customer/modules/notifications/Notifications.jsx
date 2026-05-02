import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaShoppingBag, FaCalendarCheck, FaFilePrescription, FaTruck, FaCheckCircle, FaExclamationCircle, FaTrash, FaCheck, FaFilter, FaSpinner } from 'react-icons/fa';
import notificationService from '../../../../core/api/customer/notification.service';

export default function Notifications() {
    const [filter, setFilter] = useState('all');

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ page: 1, limit: 50 });
            const fetched = response.data?.data?.notifications || response.data?.notifications || [];
            
            const formatted = fetched.map(n => {
                const date = new Date(n.created_at);
                let timeAgo = '';
                const diffMins = Math.floor((new Date() - date) / 60000);
                if (diffMins < 60) timeAgo = `${diffMins || 1} mins ago`;
                else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
                else timeAgo = `${Math.floor(diffMins / 1440)} days ago`;

                let icon = FaBell;
                let iconBg = 'bg-gray-100';
                let iconColor = 'text-gray-600';
                let type = 'system';
                
                if (n.notification_type === 'order_status') {
                    type = 'order';
                    icon = FaTruck;
                    iconBg = 'bg-purple-100';
                    iconColor = 'text-purple-600';
                } else if (n.notification_type === 'appointment_reminder') {
                    type = 'appointment';
                    icon = FaCalendarCheck;
                    iconBg = 'bg-blue-100';
                    iconColor = 'text-blue-600';
                }

                return {
                    id: n._id,
                    type,
                    title: n.title || 'Notification',
                    message: n.message,
                    link: n.action_url || '#',
                    time: timeAgo,
                    read: n.status === 'read',
                    icon,
                    iconBg,
                    iconColor,
                };
            });
            setNotifications(formatted);
        } catch (error) {
            console.error('Failed to load notifications page:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    // Unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark as read
    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (e) {
            console.error('Failed to mark as read', e);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {
        try {
            // Need an API for delete if one exists. For now just local update:
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            console.error('Failed to delete notification', e);
        }
    };

    // Clear all notifications
    const clearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                // await notificationService.deleteAll(); // if exists
                setNotifications([]);
            } catch (e) {
                console.error('Failed to clear notifications', e);
            }
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
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
            ) : filteredNotifications.length > 0 ? (
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
