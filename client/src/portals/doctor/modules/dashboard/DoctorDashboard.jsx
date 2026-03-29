import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaStethoscope,
  FaStar,
  FaClock,
  FaUserInjured,
  FaChevronRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaVideo,
  FaClinicMedical,
  FaChartLine,
} from 'react-icons/fa';
import { doctorDashboardApi } from '../../../../core/api/doctor/dashboard.service';

// Helper to get patient display name from either fullName or first_name+last_name
const getPatientName = (patient) => {
  if (patient.fullName) return patient.fullName;
  if (patient.first_name || patient.last_name) {
    return [patient.first_name, patient.last_name].filter(Boolean).join(' ');
  }
  return 'Patient';
};

export default function DoctorDashboard() {
  const { doctor } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    upcomingAppointments: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    averageRating: 0,
    totalReviews: 0,
    totalSlots: 0,
    availableSlots: 0,
  });
  const [upcomingList, setUpcomingList] = useState([]);
  const [pendingList, setPendingList] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [pendingRes, upcomingRes, consultationStatsRes, reviewStatsRes, slotsRes] =
        await Promise.allSettled([
          doctorDashboardApi.getPendingRequests({ page: 1, limit: 5 }),
          doctorDashboardApi.getUpcomingAppointments({ page: 1, limit: 5 }),
          doctorDashboardApi.getConsultationStats(),
          doctorDashboardApi.getReviewStats(),
          doctorDashboardApi.getSlots({
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }),
        ]);

      const pending = pendingRes.status === 'fulfilled' ? pendingRes.value?.data : {};
      const upcoming = upcomingRes.status === 'fulfilled' ? upcomingRes.value?.data : {};
      const consultationStats = consultationStatsRes.status === 'fulfilled' ? consultationStatsRes.value?.data : {};
      const reviewStats = reviewStatsRes.status === 'fulfilled' ? reviewStatsRes.value?.data : {};
      const slots = slotsRes.status === 'fulfilled' ? slotsRes.value?.data : {};

      setPendingList(pending?.appointments || []);
      setUpcomingList(upcoming?.appointments || []);

      const slotsList = slots?.slots || [];

      setStats({
        pendingRequests: pending?.pagination?.total_items || 0,
        upcomingAppointments: upcoming?.pagination?.total_items || 0,
        totalConsultations: consultationStats?.total_consultations || 0,
        completedConsultations: consultationStats?.with_prescriptions || 0,
        averageRating: reviewStats?.average_rating || 0,
        totalReviews: reviewStats?.total_reviews || 0,
        totalSlots: slotsList.length,
        availableSlots: slotsList.filter((s) => s.status === 'available').length,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <svg
          className="animate-spin h-12 w-12 text-emerald-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium mb-1">{greeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Dr. {doctor?.name || 'Doctor'} 👋
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
            Here's an overview of your practice today. You have{' '}
            <span className="font-semibold text-white">{stats.pendingRequests}</span> pending
            request{stats.pendingRequests !== 1 ? 's' : ''} and{' '}
            <span className="font-semibold text-white">{stats.upcomingAppointments}</span> upcoming
            appointment{stats.upcomingAppointments !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <Link
          to="/doctor/appointments/requests"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaHourglassHalf className="text-orange-500 text-lg" />
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-orange-400 transition-colors" size={12} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Requests</p>
        </Link>

        {/* Upcoming Appointments */}
        <Link
          to="/doctor/appointments/schedule"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCalendarCheck className="text-blue-500 text-lg" />
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-blue-400 transition-colors" size={12} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.upcomingAppointments}</p>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming Appointments</p>
        </Link>

        {/* Consultations */}
        <Link
          to="/doctor/consultations"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaStethoscope className="text-emerald-500 text-lg" />
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-emerald-400 transition-colors" size={12} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalConsultations}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Consultations</p>
        </Link>

        {/* Rating */}
        <Link
          to="/doctor/feedback"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaStar className="text-yellow-500 text-lg" />
            </div>
            <FaChevronRight className="text-gray-300 group-hover:text-yellow-400 transition-colors" size={12} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Avg Rating ({stats.totalReviews} reviews)
          </p>
        </Link>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaHourglassHalf className="text-orange-500" size={14} />
              Pending Requests
            </h2>
            <Link
              to="/doctor/appointments/requests"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View All <FaChevronRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingList.length > 0 ? (
              pendingList.slice(0, 4).map((appt) => {
                const patient = appt.patient_id || appt.patient || {};
                return (
                  <div
                    key={appt._id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {getPatientName(patient).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {getPatientName(patient)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt size={9} />
                          {appt.preferred_date
                            ? new Date(appt.preferred_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                            appt.appointment_type === 'online'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {appt.appointment_type === 'online' ? (
                            <FaVideo size={8} />
                          ) : (
                            <FaClinicMedical size={8} />
                          )}
                          {appt.appointment_type === 'online' ? 'Online' : 'In-Person'}
                        </span>
                      </div>
                    </div>
                    <FaClock className="text-orange-400 flex-shrink-0" size={12} />
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <FaCalendarCheck className="text-gray-200 text-3xl mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaCalendarCheck className="text-blue-500" size={14} />
              Upcoming Schedule
            </h2>
            <Link
              to="/doctor/appointments/schedule"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View All <FaChevronRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingList.length > 0 ? (
              upcomingList.slice(0, 4).map((appt) => {
                const patient = appt.patient_id || appt.patient || {};
                const isCompleted = appt.status === 'completed';
                return (
                  <div
                    key={appt._id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {getPatientName(patient).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {getPatientName(patient)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FaClock size={9} />
                          {appt.slot_id?.start_time || appt.preferred_time || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt size={9} />
                          {appt.slot_id?.date
                            ? new Date(appt.slot_id.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : appt.preferred_date
                            ? new Date(appt.preferred_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <FaCheckCircle className="text-green-400 flex-shrink-0" size={14} />
                    ) : (
                      <FaCalendarCheck className="text-blue-400 flex-shrink-0" size={14} />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <FaCalendarAlt className="text-gray-200 text-3xl mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine className="text-emerald-500" size={14} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/doctor/slots"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaClock className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">Manage Slots</span>
          </Link>

          <Link
            to="/doctor/appointments/requests"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUserInjured className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">View Requests</span>
          </Link>

          <Link
            to="/doctor/consultations"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaStethoscope className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">Consultations</span>
          </Link>

          <Link
            to="/doctor/profile"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUserInjured className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">My Profile</span>
          </Link>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FaClock className="text-emerald-600 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Availability Status
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              You have <span className="font-semibold text-emerald-700">{stats.availableSlots}</span> available
              slots out of <span className="font-semibold">{stats.totalSlots}</span> total this month
            </p>
          </div>
        </div>
        <Link
          to="/doctor/slots"
          className="btn-primary !w-auto px-5 text-sm flex items-center gap-1.5 !bg-emerald-600 hover:!bg-emerald-700"
        >
          <FaClock size={12} />
          Manage Slots
        </Link>
      </div>
    </div>
  );
}
