import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaVideo,
  FaHospital,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlus,
  FaFilter,
  FaChevronDown,
} from 'react-icons/fa';
import appointmentsService from '../../../../core/api/customer/appointments.service';

export default function Appointments() {
  const [activeView, setActiveView] = useState('requests'); // 'requests' or 'confirmed'
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    appointment_type: '',
  });

  // Fetch appointments based on active view
  const fetchAppointments = async (page = 1) => {
    setIsLoading(true);
    try {
      let response;
      const params = {
        page,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (filters.appointment_type) {
        params.appointment_type = filters.appointment_type;
      }

      if (activeView === 'requests') {
        if (filters.status) params.status = filters.status;
        response = await appointmentsService.getRequests(params);
      } else {
        if (filters.status) params.status = filters.status;
        response = await appointmentsService.getAppointments(params);
      }

      const data = response.data?.data || {};
      setAppointments(data.appointments || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, filters]);

  // Cancel a request
  const handleCancelRequest = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      await appointmentsService.cancelRequest(appointmentId, 'Cancelled by customer');
      alert('Appointment request cancelled successfully.');
      fetchAppointments(1);
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Get doctor's full name
  const getDoctorName = (apt) => {
    if (apt.doctor_id && typeof apt.doctor_id === 'object') {
      return `Dr. ${apt.doctor_id.first_name || ''} ${apt.doctor_id.last_name || ''}`.trim();
    }
    return 'Doctor';
  };

  // Get doctor specialization
  const getDoctorSpecialty = (apt) => {
    if (apt.doctor_id?.specialization) {
      if (Array.isArray(apt.doctor_id.specialization)) {
        return apt.doctor_id.specialization.join(', ');
      }
      return apt.doctor_id.specialization;
    }
    return '';
  };

  // Get appointment date/time display
  const getDateTime = (apt) => {
    if (apt.slot_id && typeof apt.slot_id === 'object') {
      const date = apt.slot_id.date
        ? new Date(apt.slot_id.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'TBD';
      const time = apt.slot_id.start_time || 'TBD';
      return { date, time };
    }
    if (apt.preferred_date) {
      return {
        date: new Date(apt.preferred_date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        time: apt.preferred_time || 'TBD',
      };
    }
    return { date: 'Not scheduled', time: 'TBD' };
  };

  // Status badge configuration
  const getStatusConfig = (apt) => {
    if (activeView === 'requests') {
      const requestStatus = apt.appointment_request;
      const configs = {
        processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
        accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
        cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle },
      };
      return configs[requestStatus] || configs.processing;
    } else {
      const status = apt.status;
      const configs = {
        pending: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: FaClock },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
        'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
      };
      return configs[status] || configs.pending;
    }
  };

  // Appointment type icon
  const TypeIcon = ({ type }) => {
    if (type === 'video' || type === 'online') {
      return <FaVideo className="text-purple-500" />;
    }
    return <FaHospital className="text-blue-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Appointments
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your appointment requests and consultations
          </p>
        </div>
        <Link
          to="/appointments/book"
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <FaPlus />
          Book Appointment
        </Link>
      </div>

      {/* View Toggle */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setActiveView('requests'); setFilters({ status: '', appointment_type: '' }); }}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            activeView === 'requests'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => { setActiveView('confirmed'); setFilters({ status: '', appointment_type: '' }); }}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            activeView === 'confirmed'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confirmed
        </button>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaFilter />
          Filters
          <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeView === 'requests' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All</option>
                  <option value="processing">Processing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All</option>
                  <option value="pending">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.appointment_type}
                onChange={(e) => setFilters(prev => ({ ...prev, appointment_type: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const statusConfig = getStatusConfig(apt);
            const StatusIcon = statusConfig.icon;
            const dateTime = getDateTime(apt);

            return (
              <div
                key={apt._id}
                className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Doctor Info */}
                  <div className="flex items-start gap-4">
                    {/* Doctor Avatar */}
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {apt.doctor_id?.profile_picture ? (
                        <img
                          src={apt.doctor_id.profile_picture}
                          alt={getDoctorName(apt)}
                          className="w-14 h-14 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <FaUserMd className="text-blue-600 text-xl" style={{ display: apt.doctor_id?.profile_picture ? 'none' : 'block' }} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {getDoctorName(apt)}
                      </h3>
                      {getDoctorSpecialty(apt) && (
                        <p className="text-sm text-blue-600">{getDoctorSpecialty(apt)}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" />
                          {dateTime.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {dateTime.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <TypeIcon type={apt.appointment_type} />
                          <span className="capitalize">{apt.appointment_type || 'General'}</span>
                        </span>
                      </div>
                      {apt.consultation_reason && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                          Reason: {apt.consultation_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      <StatusIcon className={apt.appointment_request === 'processing' ? 'animate-spin' : ''} size={14} />
                      {statusConfig.label}
                    </span>

                    {apt.doctor_id?.consultation_fee && (
                      <p className="text-sm font-medium text-gray-700">
                        Rs. {apt.doctor_id.consultation_fee}
                      </p>
                    )}

                    {/* Cancel button for processing requests */}
                    {activeView === 'requests' && apt.appointment_request === 'processing' && (
                      <button
                        onClick={() => handleCancelRequest(apt._id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Cancel Request
                      </button>
                    )}

                    {/* View Details */}
                    <Link
                      to={`/appointments/${apt._id}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => fetchAppointments(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => fetchAppointments(pagination.current_page + 1)}
                disabled={!pagination.has_next}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {activeView === 'requests' ? 'requests' : 'appointments'} found
          </h3>
          <p className="text-gray-500 mb-6">
            {activeView === 'requests'
              ? "You haven't made any appointment requests yet."
              : "You don't have any confirmed appointments."}
          </p>
          <Link
            to="/appointments/book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPlus />
            Book an Appointment
          </Link>
        </div>
      )}
    </div>
  );
}
