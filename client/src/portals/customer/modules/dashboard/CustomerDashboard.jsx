import { Link } from 'react-router-dom';
import {
    FaShoppingBag,
    FaCalendarCheck,
    FaFilePrescription,
    FaShoppingCart,
    FaPills,
    FaUserMd,
    FaClipboardList
} from 'react-icons/fa';

export default function CustomerDashboard() {
    // Mock data - baad mein API se aayega
    const userName = "John";
    const stats = {
        orders: 12,
        appointments: 3,
        prescriptions: 5,
        cartItems: 2
    };

    const recentOrders = [
        { id: '#ORD-001', date: '2024-01-15', status: 'Delivered', amount: 1250 },
        { id: '#ORD-002', date: '2024-01-18', status: 'Processing', amount: 850 },
        { id: '#ORD-003', date: '2024-01-20', status: 'Pending', amount: 2100 },
    ];

    const upcomingAppointments = [
        { doctor: 'Dr. Ahmed Khan', specialty: 'Cardiologist', date: '2024-01-25', time: '10:00 AM' },
        { doctor: 'Dr. Sara Ali', specialty: 'Dermatologist', date: '2024-01-28', time: '2:30 PM' },
    ];

    // Status badge
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'badge badge-success';
            case 'processing': return 'badge badge-info';
            case 'pending': return 'badge badge-warning';
            case 'cancelled': return 'badge badge-error';
            default: return 'badge badge-gray';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    Here's what's happening with your account today.
                </p>
            </div>

            {/* Stats Cards - Using new 3D classes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.orders}</p>
                        </div>
                        <div className="icon-circle bg-blue-100">
                            <FaShoppingBag className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Appointments</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.appointments}</p>
                        </div>
                        <div className="icon-circle bg-green-100">
                            <FaCalendarCheck className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Prescriptions</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.prescriptions}</p>
                        </div>
                        <div className="icon-circle bg-purple-100">
                            <FaFilePrescription className="text-purple-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Cart Items</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.cartItems}</p>
                        </div>
                        <div className="icon-circle bg-orange-100">
                            <FaShoppingCart className="text-orange-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Upload Prescription REMOVED */}
            <div className="card-3d p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Link
                        to="/medicines"
                        className="quick-action-btn bg-blue-50 border-blue-100 hover:bg-blue-100"
                    >
                        <FaPills className="text-blue-600 text-2xl mb-2" />
                        <span className="text-sm font-medium text-gray-700">Browse Medicines</span>
                    </Link>

                    <Link
                        to="/appointments/book"
                        className="quick-action-btn bg-green-50 border-green-100 hover:bg-green-100"
                    >
                        <FaUserMd className="text-green-600 text-2xl mb-2" />
                        <span className="text-sm font-medium text-gray-700">Book Appointment</span>
                    </Link>

                    <Link
                        to="/orders"
                        className="quick-action-btn bg-orange-50 border-orange-100 hover:bg-orange-100"
                    >
                        <FaClipboardList className="text-orange-600 text-2xl mb-2" />
                        <span className="text-sm font-medium text-gray-700">Track Orders</span>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="card-3d p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                        <Link to="/orders" className="text-sm text-blue-600 hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="card-item flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">{order.id}</p>
                                    <p className="text-sm text-gray-500">{order.date}</p>
                                </div>
                                <div className="text-right">
                                    <span className={getStatusBadge(order.status)}>
                                        {order.status}
                                    </span>
                                    <p className="text-sm font-medium text-gray-800 mt-1">Rs. {order.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="card-3d p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                        <Link to="/appointments" className="text-sm text-blue-600 hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingAppointments.map((apt, index) => (
                            <div key={index} className="card-item flex items-center gap-4">
                                <div className="icon-circle bg-blue-100">
                                    <FaUserMd className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{apt.doctor}</p>
                                    <p className="text-sm text-gray-500">{apt.specialty}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">{apt.date}</p>
                                    <p className="text-sm text-gray-500">{apt.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
