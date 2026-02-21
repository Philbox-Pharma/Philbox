// src/portals/admin/modules/doctors/DoctorList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserMd,
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaBan,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaStethoscope,
} from 'react-icons/fa';
import { doctorsService } from '../../../../core/api/admin/doctors.service';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: FaCheckCircle,
      label: 'Active',
    },
    suspended: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: FaClock,
      label: 'Suspended',
    },
    blocked: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: FaBan,
      label: 'Blocked',
    },
    pending: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: FaClock,
      label: 'Pending',
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

// Doctor Card Component
const DoctorCard = ({ doctor }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#1a365d] to-[#2c5282] flex items-center justify-center text-white text-xl font-bold shrink-0">
        {doctor.name?.charAt(0) || 'D'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-800 truncate">
              Dr. {doctor.name || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <FaStethoscope className="text-xs" />
              {doctor.specialty || 'General'}
            </p>
          </div>
          <StatusBadge status={doctor.accountStatus || doctor.status} />
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaEnvelope className="text-gray-400 text-xs" />
            <span className="truncate">{doctor.email || 'N/A'}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaPhone className="text-gray-400 text-xs" />
            {doctor.phone || 'N/A'}
          </p>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div className="text-xs text-gray-400">
        Joined:{' '}
        {doctor.createdAt
          ? new Date(doctor.createdAt).toLocaleDateString()
          : 'N/A'}
      </div>
      <Link
        to={`/admin/doctors/${doctor._id}`}
        className="inline-flex items-center gap-1.5 text-[#1a365d] hover:text-[#d69e2e] text-sm font-medium transition-colors"
      >
        <FaEye />
        View Details
      </Link>
    </div>
  </div>
);

// Loading Skeleton
const DoctorSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    specialty: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await doctorsService.getAllDoctors({
        page,
        limit,
        ...filters,
      });

      setDoctors(response.data?.doctors || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalDoctors(response.data?.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearch = e => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', specialty: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FaUserMd />
              Doctor Management
            </h1>
            <p className="text-white/80 mt-1">
              Manage registered doctors on the platform
            </p>
          </div>
          <Link
            to="/admin/doctors/applications"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d69e2e] hover:bg-[#b7891f] text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <FaClock />
            Pending Applications
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-gray-500 text-sm">Total Doctors</p>
          <p className="text-2xl font-bold text-gray-800">{totalDoctors}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {doctors.filter(d => d.accountStatus === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-gray-500 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-yellow-600">
            {doctors.filter(d => d.accountStatus === 'suspended').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-gray-500 text-sm">Blocked</p>
          <p className="text-2xl font-bold text-red-600">
            {doctors.filter(d => d.accountStatus === 'blocked').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or specialty..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="text-gray-500" />
            Filters
          </button>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
          >
            Search
          </button>
        </form>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={e => handleFilterChange('specialty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none"
              >
                <option value="">All Specialties</option>
                <option value="General Physician">General Physician</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-[#d69e2e] hover:text-[#b7891f] font-medium text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => <DoctorSkeleton key={i} />)
          : doctors.length > 0
            ? doctors.map(doctor => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))
            : !error && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
                  <FaUserMd className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No doctors found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Try adjusting your search or filters
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

          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-[#1a365d] text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

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
