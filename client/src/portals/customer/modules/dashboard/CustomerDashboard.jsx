import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingBag,
  FaCalendarCheck,
  FaPills,
  FaUserMd,
  FaClipboardList,
  FaClock,
  FaShoppingCart,
} from 'react-icons/fa';
import cartService from '../../../../core/api/customer/cart.service';
import appointmentsService from '../../../../core/api/customer/appointments.service';
import catalogService from '../../../../core/api/customer/catalog.service';
import profileService from '../../../../core/api/customer/profile.service';

export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile name
        const profileRes = await profileService.getProfile();
        const profile = profileRes.data || profileRes;
        setUserName(profile.fullName || profile.first_name || '');
      } catch { /* ignore */ }

      try {
        // Fetch cart count
        const cartRes = await cartService.getCartCount();
        const cartData = cartRes.data?.data || cartRes.data;
        setCartCount(cartData?.itemCount || 0);
      } catch { /* ignore */ }

      try {
        // Fetch upcoming appointments (accepted)
        const aptRes = await appointmentsService.getAppointments({
          page: 1,
          limit: 3,
          status: 'pending',
          sort_order: 'asc',
        });
        setAppointments(aptRes.data?.data?.appointments || []);
      } catch { /* ignore */ }

      try {
        // Fetch pending requests
        const reqRes = await appointmentsService.getRequests({
          page: 1,
          limit: 3,
          status: 'processing',
        });
        setRequests(reqRes.data?.data?.appointments || []);
      } catch { /* ignore */ }

      try {
        // Fetch some recommended medicines
        const medRes = await catalogService.browseMedicines({ page: 1, limit: 5 });
        setRecommendedMedicines(medRes.data?.data?.medicines || []);
      } catch { /* ignore */ }

      setIsLoading(false);
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = status => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDoctorName = (apt) => {
    if (apt.doctor_id && typeof apt.doctor_id === 'object') {
      return `Dr. ${apt.doctor_id.first_name || ''} ${apt.doctor_id.last_name || ''}`.trim();
    }
    return 'Doctor';
  };

  const getDoctorSpecialty = (apt) => {
    if (apt.doctor_id?.specialization) {
      return Array.isArray(apt.doctor_id.specialization)
        ? apt.doctor_id.specialization.join(', ')
        : apt.doctor_id.specialization;
    }
    return '';
  };

  const getDateTime = (apt) => {
    if (apt.slot_id && typeof apt.slot_id === 'object') {
      return {
        date: apt.slot_id.date
          ? new Date(apt.slot_id.date).toLocaleDateString()
          : 'TBD',
        time: apt.slot_id.start_time || 'TBD',
      };
    }
    if (apt.preferred_date) {
      return {
        date: new Date(apt.preferred_date).toLocaleDateString(),
        time: apt.preferred_time || 'TBD',
      };
    }
    return { date: 'TBD', time: 'TBD' };
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
          Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your account activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Cart Items</p>
            <p className="text-3xl font-bold text-gray-800">{cartCount}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
            <FaShoppingCart className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Upcoming Appointments
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {appointments.length}
            </p>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
            <FaCalendarCheck className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Pending Requests
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {requests.length}
            </p>
          </div>
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center">
            <FaClock className="text-yellow-500 text-2xl" />
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
            {appointments.length > 0 ? (
              appointments.map(apt => {
                const dt = getDateTime(apt);
                return (
                  <Link
                    key={apt._id}
                    to={`/appointments/${apt._id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUserMd className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">
                              {getDoctorName(apt)}
                            </p>
                            {getDoctorSpecialty(apt) && (
                              <p className="text-sm text-blue-600">
                                {getDoctorSpecialty(apt)}
                              </p>
                            )}
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
                            {dt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-gray-400" />
                            {dt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaCalendarCheck className="mx-auto text-3xl text-gray-300 mb-3" />
                <p>No upcoming appointments scheduled.</p>
                <Link
                  to="/appointments/book"
                  className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                >
                  Book an appointment →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests Widget */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Pending Requests</h2>
            <Link
              to="/appointments"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {requests.length > 0 ? (
              requests.map(req => {
                const dt = getDateTime(req);
                return (
                  <Link
                    key={req._id}
                    to={`/appointments/${req._id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">
                              {getDoctorName(req)}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {req.appointment_type || 'Consultation'}
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                            Processing
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <span className="flex items-center gap-1">
                            <FaCalendarCheck className="text-gray-400" />
                            {dt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-gray-400" />
                            {dt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingBag className="mx-auto text-3xl text-gray-300 mb-3" />
                <p>No pending requests.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Medicines */}
      {recommendedMedicines.length > 0 && (
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
            {recommendedMedicines.map(med => (
              <Link
                key={med._id}
                to={`/medicines/${med._id}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-32 bg-gray-50 p-2 flex items-center justify-center">
                  <img
                    src={
                      med.img_urls && med.img_urls.length > 0
                        ? med.img_urls[0]
                        : 'https://via.placeholder.com/150?text=Medicine'
                    }
                    alt={med.Name}
                    className="max-h-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Medicine';
                    }}
                  />
                </div>
                <div className="p-3 border-t">
                  <h3
                    className="text-sm font-semibold text-gray-800 truncate"
                    title={med.Name}
                  >
                    {med.Name || med.alias_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{med.mgs || med.dosage_form || ''}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">
                    Rs. {med.sale_price || med.unit_price || 0}
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
