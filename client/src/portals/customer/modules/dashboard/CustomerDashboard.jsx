import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingBag,
  FaCalendarCheck,
  FaPills,
  FaUserMd,
  FaClipboardList,
  FaClock,
} from 'react-icons/fa';
import dashboardService from '../../../../core/api/customer/dashboard.service';

export default function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: { totalOrders: 0, upcomingAppointments: 0 },
    recentOrders: [],
    upcomingAppointments: [],
    medicineRecommendations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getDashboard();
        // Fallback for empty states while reading data
        setDashboardData(response.data || response || {});
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const { stats, recentOrders, upcomingAppointments, medicineRecommendations } =
    dashboardData;

  const getStatusBadge = status => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your recent account activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Orders
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.totalOrders || 0}
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-50 focus:bg-blue-100 rounded-full flex items-center justify-center">
            <FaShoppingBag className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Upcoming Appointments
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.upcomingAppointments || 0}
            </p>
          </div>
          <div className="w-14 h-14 bg-green-50 focus:bg-green-100 rounded-full flex items-center justify-center">
            <FaCalendarCheck className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/medicines"
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <FaPills className="text-blue-600 text-xl" />
            </div>
            <span className="font-semibold text-blue-900">Order Medicine</span>
          </Link>

          <Link
            to="/appointments/book"
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition-colors"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <FaUserMd className="text-green-600 text-xl" />
            </div>
            <span className="font-semibold text-green-900">
              Book Appointment
            </span>
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <FaClipboardList className="text-orange-600 text-xl" />
            </div>
            <span className="font-semibold text-orange-900">Track Orders</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout for Order & Appointment Widgets */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders Widget */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link
              to="/orders"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div
                  key={order._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800">
                        Order #{order._id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      {order.itemCount} item{order.itemCount !== 1 && 's'}
                    </p>
                    <p className="font-bold text-gray-800">Rs. {order.total}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingBag className="mx-auto text-3xl text-gray-300 mb-3" />
                <p>No recent orders found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments Widget */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
              Upcoming Appointments
            </h2>
            <Link
              to="/appointments"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(apt => (
                <div
                  key={apt._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        apt.doctor?.profile_img_url ||
                        'https://via.placeholder.com/50'
                      }
                      alt={apt.doctor?.fullName}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800">
                            {apt.doctor?.fullName}
                          </p>
                          <p className="text-sm text-blue-600">
                            {apt.doctor?.specialization}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(apt.status)}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          <FaCalendarCheck className="text-gray-400" />
                          {apt.slot?.date
                            ? new Date(apt.slot.date).toLocaleDateString()
                            : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {apt.slot?.start_time || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaCalendarCheck className="mx-auto text-3xl text-gray-300 mb-3" />
                <p>No upcoming appointments scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Recommendations Section */}
      {medicineRecommendations && medicineRecommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Recommended Medicines
            </h2>
            <Link
              to="/medicines"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Browse More
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {medicineRecommendations.map(med => (
              <Link
                key={med._id}
                to={`/medicines/${med._id}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-32 bg-gray-50 p-2 flex items-center justify-center">
                  <img
                    src={med.img_url || 'https://via.placeholder.com/150'}
                    alt={med.Name}
                    className="max-h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 border-t">
                  <h3
                    className="text-sm font-semibold text-gray-800 truncate"
                    title={med.Name}
                  >
                    {med.Name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{med.mgs}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">
                    Rs. {med.sale_price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
