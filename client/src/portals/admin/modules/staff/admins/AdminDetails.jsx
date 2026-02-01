/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/portals/admin/modules/staff/admins/AdminDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaSpinner,
  FaCodeBranch,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { staffApi, rolesApi } from '../../../../../core/api/admin/adminApi';
import ConfirmModal from '../../../../../shared/components/Modal/ConfirmModal';

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear location state
  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchAdminDetails();
  }, [id]);

  const fetchAdminDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffApi.getAdminById(id);
      console.log('Admin Details API Response:', response);

      if (response.success || response.status === 200) {
        // Handle different response structures
        const adminData = response.data?.admin || response.data;
        console.log('Parsed Admin Data:', adminData);
        setAdmin(adminData);
      } else {
        throw new Error(response.message || 'Failed to fetch admin');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load admin details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await staffApi.deleteAdmin(id);
      if (response.success || response.status === 200) {
        navigate('/admin/staff/admins', {
          state: { message: 'Admin deleted successfully!' },
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete admin');
    } finally {
      setActionLoading(false);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-3xl text-[#1a365d]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/staff/admins"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAdminDetails}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center p-12 text-gray-500">Admin not found</div>
    );
  }

  // Determine admin type - handle different field names
  const isSuperAdmin =
    admin.category === 'super-admin' ||
    admin.category === 'super_admin' ||
    admin.admin_category === 'super-admin' ||
    admin.admin_category === 'super_admin';

  // Handle different field names from API
  const adminName = admin.name || admin.fullName || 'Unknown';
  const adminEmail = admin.email || 'No email';
  const adminPhone =
    admin.phone_number || admin.contactNumber || admin.phone || null;
  const adminStatus = admin.status || admin.account_status || 'active';
  const adminProfileImg =
    admin.profile_img_url || admin.profileImg || admin.avatar || null;
  const adminCoverImg = admin.cover_img_url || admin.coverImg || null;
  const adminBranches = admin.branches_managed || admin.branches || [];
  const adminRole = admin.role || admin.roleId || null;
  const adminPermissions = admin.role?.permissions || admin.permissions || [];
  const admin2FA = admin.isTwoFactorEnabled ?? admin.twoFactorEnabled ?? false;
  const adminCreatedAt =
    admin.created_at || admin.createdAt || new Date().toISOString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/staff/admins"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {adminName}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">{adminEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/staff/admins/${id}/edit`)}
            className="px-3 sm:px-4 py-2 bg-[#d69e2e] text-white rounded-lg flex items-center gap-2 hover:bg-[#b8860b] text-sm sm:text-base"
          >
            <FaEdit /> <span className="hidden sm:inline">Edit</span>
          </button>
          {!isSuperAdmin && (
            <button
              onClick={() => setDeleteModal(true)}
              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm sm:text-base"
            >
              <FaTrash /> <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2"
        >
          <FaCheckCircle />
          {successMessage}
        </motion.div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 sm:h-40 bg-linear-to-r from-[#1a365d] to-[#2c5282] relative">
          {adminCoverImg ? (
            <img
              src={adminCoverImg}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FaUserShield className="text-6xl sm:text-8xl text-white/10" />
            </div>
          )}

          {/* Status Badge on Cover */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${
                adminStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : adminStatus === 'suspended'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {adminStatus}
            </span>
          </div>
        </div>

        {/* Profile Info - FIXED POSITIONING */}
        <div className="px-4 sm:px-6 pb-6 pt-14 sm:pt-16 relative">
          {/* Avatar - Absolute positioned to overlap cover */}
          <div className="absolute -top-10 sm:-top-12 left-4 sm:left-6">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden ${
                isSuperAdmin ? 'bg-purple-100' : 'bg-blue-100'
              }`}
            >
              {adminProfileImg ? (
                <img
                  src={adminProfileImg}
                  alt={adminName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <FaUserShield
                  className={`text-3xl sm:text-4xl ${isSuperAdmin ? 'text-purple-600' : 'text-blue-600'}`}
                />
              )}
            </div>
          </div>

          {/* Name & Role - Positioned after avatar space */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {adminName}
                </h2>
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    isSuperAdmin
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isSuperAdmin ? 'Super Admin' : 'Branch Admin'}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">{adminEmail}</p>
            </div>
          </div>

          {/* Info Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <InfoCard icon={FaEnvelope} label="Email" value={adminEmail} />
            <InfoCard
              icon={FaPhone}
              label="Phone"
              value={adminPhone || 'Not set'}
            />
            <InfoCard
              icon={FaCalendar}
              label="Joined"
              value={new Date(adminCreatedAt).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            />
            <InfoCard
              icon={FaKey}
              label="2FA Status"
              value={admin2FA ? 'Enabled' : 'Disabled'}
              valueClass={admin2FA ? 'text-green-600' : 'text-gray-500'}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Managed Branches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCodeBranch className="text-[#1a365d]" />
            Managed Branches
            <span className="ml-auto text-sm font-normal text-gray-500">
              {adminBranches.length}{' '}
              {adminBranches.length === 1 ? 'branch' : 'branches'}
            </span>
          </h3>

          {adminBranches.length > 0 ? (
            <div className="space-y-3">
              {adminBranches.map(branch => {
                const branchId = branch._id || branch.id;
                const branchName = branch.name || 'Unknown Branch';
                const branchCode = branch.code || '';
                const branchStatus = branch.status || 'Active';

                return (
                  <Link
                    key={branchId}
                    to={`/admin/branches/${branchId}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#1a365d]/10 flex items-center justify-center shrink-0">
                        <FaCodeBranch className="text-[#1a365d]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {branchName}
                        </p>
                        <p className="text-xs text-gray-500">{branchCode}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                        branchStatus === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {branchStatus}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              {isSuperAdmin ? (
                <>
                  <FaCodeBranch className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>Super Admin has access to all branches</p>
                </>
              ) : (
                <>
                  <FaCodeBranch className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No branches assigned</p>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Role & Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-[#1a365d]" />
            Role & Permissions
          </h3>

          {/* Role Badge */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Assigned Role</p>
            <p className="font-semibold text-gray-800">
              {typeof adminRole === 'object'
                ? adminRole.name
                : adminRole || 'No Role Assigned'}
            </p>
          </div>

          {/* Permissions */}
          {adminPermissions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">
                Permissions ({adminPermissions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {adminPermissions.map((perm, index) => {
                  const permName = typeof perm === 'object' ? perm.name : perm;
                  return (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <FaCheckCircle className="text-green-500 text-[10px]" />
                      {permName.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              {isSuperAdmin ? (
                <p className="text-sm">Super Admin has all permissions</p>
              ) : (
                <p className="text-sm">No specific permissions assigned</p>
              )}
            </div>
          )}

          {/* Manage Permissions Link */}
          <Link
            to="/admin/roles-permissions"
            className="mt-4 inline-flex items-center gap-2 text-[#1a365d] hover:underline text-sm"
          >
            <FaShieldAlt /> Manage Roles & Permissions
          </Link>
        </motion.div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${adminName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}

// Sub-component - Responsive InfoCard
const InfoCard = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
      <Icon />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium text-gray-800 truncate ${valueClass}`}>
        {value}
      </p>
    </div>
  </div>
);
