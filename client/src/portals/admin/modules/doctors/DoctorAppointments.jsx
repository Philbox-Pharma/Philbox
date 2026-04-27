// src/portals/admin/modules/doctors/DoctorAppointments.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaUserMd,
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaVideo,
  FaMapMarkerAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import { doctorApi } from '../../../../core/api/admin/adminApi';

// Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: FaClock,
      label: 'Pending',
    },
    confirmed: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: FaCheckCircle,
      label: 'Confirmed',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: FaCheckCircle,
      label: 'Completed',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: FaTimesCircle,
      label: 'Cancelled',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="text-xs" />
      {config.label}
    </span>
  );
};

// Appointment Card
const AppointmentCard = ({ appointment }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
        {appointment.patient_id?.fullName?.charAt(0) || 'P'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-800 truncate">
              {appointment.patient_id?.fullName || 'Unknown Patient'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              {appointment.appointment_date
                ? new Date(appointment.appointment_date).toLocaleDateString()
                : 'N/A'}{' '}
              at {appointment.appointment_time || 'N/A'}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaVideo className="text-gray-400 text-xs" />
            {appointment.type === 'online'
              ? 'Online Consultation'
              : 'In-Person Visit'}
          </p>
          {appointment.type === 'in-person' && appointment.branch_id && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400 text-xs" />
              {appointment.branch_id.name || 'Branch'}
            </p>
          )}
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaClock className="text-gray-400 text-xs" />
            Duration: {appointment.duration || 30} minutes
          </p>
        </div>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div className="text-xs text-gray-400">
        Booked:{' '}
        {appointment.created_at
          ? new Date(appointment.created_at).toLocaleDateString()
          : 'N/A'}
      </div>
      <Link
        to={`/admin/appointments/${appointment._id}`}
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
      >
        <FaEye />
        View Details
      </Link>
    </div>
  </div>
);

// Loading Skeleton
const AppointmentSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default function DoctorAppointments() {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await doctorApi.getDoctorAppointments(id, {
        page,
        limit,
        ...filters,
      });

      setAppointments(response.data?.list || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalAppointments(response.data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [id, page, filters]);

  useEffect(() => {
    if (id) {
      fetchAppointments();
    }
  }, [fetchAppointments]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', date: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <Link
          to={`/admin/doctors/${id}`}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
        >
          <FaArrowLeft />
          Back to Doctor Details
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaCalendarAlt />
          Doctor Appointments
        </h1>
        <p className="text-white/80 mt-1">
          View and manage appointments for this doctor
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={filters.search || ''}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filters.date}
            onChange={e => handleFilterChange('date', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />

          {/* Clear Filters */}
          {(filters.status || filters.date || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {totalAppointments}
          </p>
          <p className="text-sm text-gray-500">Total Appointments</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {appointments.filter(a => a.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {appointments.filter(a => a.status === 'cancelled').length}
          </p>
          <p className="text-sm text-gray-500">Cancelled</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => <AppointmentSkeleton key={i} />)
          : appointments.length > 0
            ? appointments.map(appointment => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))
            : !error && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
                  <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No appointments found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    This doctor has no appointments matching the current
                    filters.
                  </p>
                </div>
              )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft />
          </button>

          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
