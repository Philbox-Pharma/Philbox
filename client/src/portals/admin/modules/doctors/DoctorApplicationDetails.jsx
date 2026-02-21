// src/portals/admin/modules/doctors/DoctorApplicationDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaStethoscope,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa';
import { doctorsService } from '../../../../core/api/admin/doctors.service';

// Status Badge
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
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Action Modal
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

        {application && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              <strong>Applicant:</strong> Dr. {application.name || 'Unknown'}
            </p>
          </div>
        )}

        {type === 'approve' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message (Optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Add a welcome note..."
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
              placeholder="Provide a reason..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              required
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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

export default function DoctorApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await doctorsService.getApplicationById(id);
        setApplication(response.data?.application || response.data);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError(err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  const handleAction = async data => {
    setActionLoading(true);
    try {
      if (modal.type === 'approve') {
        await doctorsService.approveApplication(id, data.comment);
      } else {
        await doctorsService.rejectApplication(id, data.reason);
      }
      navigate('/admin/doctors/applications');
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/admin/doctors/applications')}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Application not found</p>
      </div>
    );
  }

  const isPending = application.applicationStatus === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-[#d69e2e] to-[#b7891f] rounded-2xl p-6 text-white">
        <Link
          to="/admin/doctors/applications"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
        >
          <FaArrowLeft />
          Back to Applications
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
            {application.name?.charAt(0) || 'D'}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">
                Dr. {application.name || 'Unknown'}
              </h1>
              <StatusBadge status={application.applicationStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-white/80">
              <p className="flex items-center gap-2">
                <FaStethoscope />
                {application.specialty || 'General'}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope />
                {application.email || 'N/A'}
              </p>
              <p className="flex items-center gap-2">
                <FaClock />
                Applied:{' '}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex gap-3">
              <button
                onClick={() => setModal({ isOpen: true, type: 'reject' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                <FaTimes />
                Reject
              </button>
              <button
                onClick={() => setModal({ isOpen: true, type: 'approve' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
              >
                <FaCheck />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-[#d69e2e]" />
            Personal Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium text-gray-800">
                  Dr. {application.name || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400 text-xs" />
                  {application.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <FaPhone className="text-gray-400 text-xs" />
                  {application.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium text-gray-800">
                  {application.dateOfBirth
                    ? new Date(application.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                {application.address || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaStethoscope className="text-[#1a365d]" />
            Professional Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Specialty</label>
                <p className="font-medium text-gray-800">
                  {application.specialty || 'General'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">License Number</label>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <FaIdCard className="text-gray-400 text-xs" />
                  {application.licenseNumber || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Experience</label>
                <p className="font-medium text-gray-800">
                  {application.experience || 0} years
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Consultation Fee
                </label>
                <p className="font-medium text-gray-800">
                  Rs. {application.consultationFee || 0}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Qualifications</label>
              <p className="font-medium text-gray-800">
                {application.qualifications || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaFileAlt className="text-[#805ad5]" />
            Uploaded Documents
          </h2>

          <div className="space-y-3">
            {application.documents?.length > 0 ? (
              application.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">
                        {doc.name || `Document ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {doc.type || 'PDF'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1a365d] hover:text-[#d69e2e] transition-colors"
                  >
                    <FaDownload />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No documents uploaded
              </p>
            )}
          </div>
        </div>

        {/* Bio / About */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">About</h2>
          <p className="text-gray-700">
            {application.bio || 'No bio provided by the applicant.'}
          </p>
        </div>
      </div>

      {/* Rejection Reason (if rejected) */}
      {application.applicationStatus === 'rejected' &&
        application.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <FaTimes />
              Rejection Reason
            </h3>
            <p className="text-red-600">{application.rejectionReason}</p>
            {application.rejectedAt && (
              <p className="text-sm text-red-400 mt-2">
                Rejected on:{' '}
                {new Date(application.rejectedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

      {/* Approval Info (if approved) */}
      {application.applicationStatus === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
            <FaCheck />
            Application Approved
          </h3>
          {application.approvalComment && (
            <p className="text-green-600">{application.approvalComment}</p>
          )}
          {application.approvedAt && (
            <p className="text-sm text-green-500 mt-2">
              Approved on:{' '}
              {new Date(application.approvedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Action Modal */}
      <ActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, type: '' })}
        type={modal.type}
        application={application}
        onSubmit={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}
