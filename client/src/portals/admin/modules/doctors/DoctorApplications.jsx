// src/portals/admin/modules/doctors/DoctorApplications.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserMd,
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaIdCard,
  FaArrowLeft,
} from 'react-icons/fa';
import { doctorsService } from '../../../../core/api/admin/doctors.service';

// Application Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending Review',
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Rejected',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Approve/Reject Modal
const ActionModal = ({
  isOpen,
  onClose,
  type,
  application,
  onSubmit,
  loading,
}) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (type === 'reject' && !reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onSubmit(type === 'approve' ? { comment } : { reason });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {type === 'approve'
            ? '✅ Approve Application'
            : '❌ Reject Application'}
        </h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Applicant:</strong> Dr. {application?.name || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {application?.email || 'N/A'}
          </p>
        </div>

        {type === 'approve' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Add a welcome note or instructions..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              required
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors text-white ${
              type === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {loading
              ? 'Processing...'
              : type === 'approve'
                ? 'Approve'
                : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Application Card
const ApplicationCard = ({ application, onApprove, onReject }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#d69e2e] to-[#b7891f] flex items-center justify-center text-white text-lg font-bold shrink-0">
        {application.name?.charAt(0) || 'D'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-800">
              Dr. {application.name || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <FaGraduationCap className="text-xs" />
              {application.specialty || 'General'}
            </p>
          </div>
          <StatusBadge status={application.applicationStatus || 'pending'} />
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaEnvelope className="text-gray-400 text-xs" />
            <span className="truncate">{application.email || 'N/A'}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaPhone className="text-gray-400 text-xs" />
            {application.phone || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaIdCard className="text-gray-400 text-xs" />
            License: {application.licenseNumber || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaClock className="text-gray-400 text-xs" />
            Applied:{' '}
            {application.createdAt
              ? new Date(application.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>

    {/* Actions */}
    {application.applicationStatus === 'pending' && (
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <Link
          to={`/admin/doctors/applications/${application._id}`}
          className="inline-flex items-center gap-1.5 text-[#1a365d] hover:text-[#d69e2e] text-sm font-medium transition-colors"
        >
          <FaEye />
          View Full Application
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => onReject(application)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
          >
            <FaTimes />
            Reject
          </button>
          <button
            onClick={() => onApprove(application)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
          >
            <FaCheck />
            Approve
          </button>
        </div>
      </div>
    )}
  </div>
);

// Loading Skeleton
const ApplicationSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function DoctorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    application: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await doctorsService.getApplications({
        page,
        limit,
        status: statusFilter,
        search,
      });

      setApplications(response.data?.applications || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = application => {
    setModal({ isOpen: true, type: 'approve', application });
  };

  const handleReject = application => {
    setModal({ isOpen: true, type: 'reject', application });
  };

  const handleModalSubmit = async data => {
    setActionLoading(true);
    try {
      if (modal.type === 'approve') {
        await doctorsService.approveApplication(
          modal.application._id,
          data.comment
        );
      } else {
        await doctorsService.rejectApplication(
          modal.application._id,
          data.reason
        );
      }
      setModal({ isOpen: false, type: '', application: null });
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = applications.filter(
    a => a.applicationStatus === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-[#d69e2e] to-[#b7891f] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              to="/admin/doctors"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm"
            >
              <FaArrowLeft />
              Back to Doctors
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FaClock />
              Doctor Applications
            </h1>
            <p className="text-white/80 mt-1">
              Review and manage new doctor registration requests
            </p>
          </div>
          <div className="bg-white/20 rounded-xl px-6 py-4 text-center">
            <p className="text-3xl font-bold">{pendingCount}</p>
            <p className="text-sm text-white/80">Pending Review</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d69e2e] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-[#1a365d] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {loading
          ? [...Array(5)].map((_, i) => <ApplicationSkeleton key={i} />)
          : applications.length > 0
            ? applications.map(application => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            : !error && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <FaUserMd className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No applications found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {statusFilter === 'pending'
                      ? 'All caught up! No pending applications.'
                      : `No ${statusFilter} applications to show.`}
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

      {/* Action Modal */}
      <ActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, type: '', application: null })}
        type={modal.type}
        application={modal.application}
        onSubmit={handleModalSubmit}
        loading={actionLoading}
      />
    </div>
  );
}
