// src/portals/admin/modules/doctors/DoctorDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaUserMd,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaStethoscope,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaBan,
  FaClock,
  FaChartLine,
  FaStar,
  FaUsers,
  FaMoneyBillWave,
  FaEdit,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { doctorsService } from '../../../../core/api/admin/doctors.service';

// Status Badge
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
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <Icon />
      {config.label}
    </span>
  );
};

// Stat Card Component

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="text-xl" style={{ color }} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
      </div>
    </div>
  </div>
);

// Status Change Modal
const StatusModal = ({ isOpen, onClose, doctor, onSubmit, loading }) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (doctor) {
      setNewStatus(doctor.accountStatus || 'active');
    }
  }, [doctor]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newStatus !== 'active' && !reason.trim()) {
      alert('Please provide a reason for the status change');
      return;
    }
    onSubmit({ status: newStatus, reason });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Change Account Status
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['active', 'suspended', 'blocked'].map(status => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    newStatus === status
                      ? status === 'active'
                        ? 'bg-green-600 text-white'
                        : status === 'suspended'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {newStatus !== 'active' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Provide a reason for this action..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none resize-none"
                required
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
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
            className="flex-1 px-4 py-2.5 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [doctorRes, metricsRes] = await Promise.all([
          doctorsService.getDoctorById(id),
          doctorsService.getDoctorMetrics(id).catch(() => ({ data: null })),
        ]);

        setDoctor(doctorRes.data?.doctor || doctorRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
        setError(err.message || 'Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctorData();
    }
  }, [id]);

  const handleStatusChange = async data => {
    setStatusLoading(true);
    try {
      await doctorsService.updateDoctorStatus(id, data);
      setDoctor(prev => ({ ...prev, accountStatus: data.status }));
      setStatusModal(false);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Error Loading Doctor
        </h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/admin/doctors')}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <FaUserMd className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-linear-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-6 text-white">
        <Link
          to="/admin/doctors"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
        >
          <FaArrowLeft />
          Back to Doctors
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold shrink-0">
            {doctor.name?.charAt(0) || 'D'}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                Dr. {doctor.name || 'Unknown'}
              </h1>
              <StatusBadge status={doctor.accountStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-white/80">
              <p className="flex items-center gap-2">
                <FaStethoscope />
                {doctor.specialty || 'General'}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope />
                {doctor.email || 'N/A'}
              </p>
              <p className="flex items-center gap-2">
                <FaPhone />
                {doctor.phone || 'N/A'}
              </p>
              <p className="flex items-center gap-2">
                <FaIdCard />
                {doctor.licenseNumber || 'N/A'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStatusModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              <FaEdit />
              Change Status
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaUsers}
          label="Total Patients"
          value={metrics?.totalPatients || 0}
          color="#1a365d"
        />
        <StatCard
          icon={FaCalendarAlt}
          label="Appointments"
          value={metrics?.totalAppointments || 0}
          color="#38a169"
          subtext="This month"
        />
        <StatCard
          icon={FaStar}
          label="Rating"
          value={metrics?.averageRating?.toFixed(1) || '0.0'}
          color="#d69e2e"
          subtext={`${metrics?.totalReviews || 0} reviews`}
        />
        <StatCard
          icon={FaMoneyBillWave}
          label="Revenue"
          value={`Rs. ${(metrics?.totalRevenue || 0).toLocaleString()}`}
          color="#805ad5"
          subtext="This month"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUserMd className="text-[#1a365d]" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-medium text-gray-800">
                Dr. {doctor.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium text-gray-800">
                {doctor.email || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium text-gray-800">
                {doctor.phone || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Specialty</label>
              <p className="font-medium text-gray-800">
                {doctor.specialty || 'General'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">License Number</label>
              <p className="font-medium text-gray-800">
                {doctor.licenseNumber || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Experience</label>
              <p className="font-medium text-gray-800">
                {doctor.experience || 0} years
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                {doctor.address || doctor.clinicAddress || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Joined On</label>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                {doctor.createdAt
                  ? new Date(doctor.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Consultation Fee</label>
              <p className="font-medium text-gray-800">
                Rs. {doctor.consultationFee || 0}
              </p>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="text-sm text-gray-500">About</label>
              <p className="text-gray-700 mt-1">{doctor.bio}</p>
            </div>
          )}
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Performance Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-[#1a365d]" />
              Performance Overview
            </h2>
            <div className="text-center py-8 text-gray-400">
              <FaChartLine className="text-4xl mx-auto mb-2" />
              <p>Performance chart coming soon</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setStatusModal(true)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-3 transition-colors"
              >
                <FaEdit className="text-[#1a365d]" />
                <span className="font-medium">Change Account Status</span>
              </button>
              <Link
                to={`/admin/doctors/${id}/appointments`}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaCalendarAlt className="text-green-600" />
                <span className="font-medium">View Appointments</span>
              </Link>
              <Link
                to={`/admin/doctors/${id}/reviews`}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaStar className="text-yellow-500" />
                <span className="font-medium">View Reviews</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <StatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        doctor={doctor}
        onSubmit={handleStatusChange}
        loading={statusLoading}
      />
    </div>
  );
}
