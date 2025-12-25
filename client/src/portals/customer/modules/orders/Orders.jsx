import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBox,
    FaSearch,
    FaFilter,
    FaEye,
    FaFileDownload,
    FaClock,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner
} from 'react-icons/fa';

export default function Orders() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock orders data
    const orders = [
        {
            id: 'ORD-2024-001',
            date: '2024-01-20',
            items: [
                { name: 'Panadol Extra', quantity: 2, price: 150 },
                { name: 'Augmentin 625mg', quantity: 1, price: 850 },
            ],
            total: 1150,
            status: 'delivered',
            deliveryDate: '2024-01-23',
            paymentMethod: 'Cash on Delivery',
        },
        {
            id: 'ORD-2024-002',
            date: '2024-01-22',
            items: [
                { name: 'Centrum Multivitamin', quantity: 1, price: 1200 },
            ],
            total: 1350,
            status: 'shipped',
            trackingNumber: 'TRK123456789',
            paymentMethod: 'JazzCash',
        },
        {
            id: 'ORD-2024-003',
            date: '2024-01-24',
            items: [
                { name: 'Glucophage 500mg', quantity: 2, price: 320 },
                { name: 'Lipitor 20mg', quantity: 1, price: 650 },
            ],
            total: 1440,
            status: 'processing',
            paymentMethod: 'Credit Card',
        },
        {
            id: 'ORD-2024-004',
            date: '2024-01-25',
            items: [
                { name: 'Voltral 50mg', quantity: 3, price: 220 },
            ],
            total: 810,
            status: 'pending',
            paymentMethod: 'EasyPaisa',
        },
        {
            id: 'ORD-2024-005',
            date: '2024-01-18',
            items: [
                { name: 'Dermazole Cream', quantity: 1, price: 350 },
            ],
            total: 500,
            status: 'cancelled',
            cancelReason: 'Customer requested cancellation',
            paymentMethod: 'Cash on Delivery',
        },
    ];

    // Status config
    const statusConfig = {
        pending: {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-700',
            icon: FaClock,
        },
        processing: {
            label: 'Processing',
            color: 'bg-blue-100 text-blue-700',
            icon: FaSpinner,
        },
        shipped: {
            label: 'Shipped',
            color: 'bg-purple-100 text-purple-700',
            icon: FaTruck,
        },
        delivered: {
            label: 'Delivered',
            color: 'bg-green-100 text-green-700',
            icon: FaCheckCircle,
        },
        cancelled: {
            label: 'Cancelled',
            color: 'bg-red-100 text-red-700',
            icon: FaTimesCircle,
        },
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Get status badge
    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className={status === 'processing' ? 'animate-spin' : ''} size={12} />
                {config.label}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Orders</h1>
                <p className="text-gray-500 mt-1">Track and manage your orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by order ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-semibold text-gray-800">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium text-gray-800">{order.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment</p>
                                        <p className="font-medium text-gray-800">{order.paymentMethod}</p>
                                    </div>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            {/* Order Items */}
                            <div className="p-4">
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FaBox className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-800">Rs. {item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Info */}
                                {order.status === 'shipped' && order.trackingNumber && (
                                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                        <p className="text-sm text-purple-700">
                                            <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                                        </p>
                                    </div>
                                )}

                                {/* Delivery Info */}
                                {order.status === 'delivered' && order.deliveryDate && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            <span className="font-medium">Delivered on:</span> {order.deliveryDate}
                                        </p>
                                    </div>
                                )}

                                {/* Cancel Reason */}
                                {order.status === 'cancelled' && order.cancelReason && (
                                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-700">
                                            <span className="font-medium">Reason:</span> {order.cancelReason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Order Footer */}
                            <div className="p-4 border-t flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-blue-600">Rs. {order.total}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <FaEye />
                                        View Details
                                    </Link>
                                    {order.status === 'delivered' && (
                                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                            <FaFileDownload />
                                            Invoice
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBox className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : "You haven't placed any orders yet"}
                    </p>
                    <Link to="/medicines" className="btn-primary inline-block px-6 py-3">
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
