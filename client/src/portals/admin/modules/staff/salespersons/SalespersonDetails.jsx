// src/portals/admin/modules/staff/salespersons/SalespersonDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaSpinner,
  FaCodeBranch,
  FaVenusMars,
  FaBirthdayCake,
  FaIdCard,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTasks,
  FaClipboardList,
  FaExclamationTriangle,
  FaBan,
} from 'react-icons/fa';
import { staffService } from '../../../../../core/api/admin/staff.service';
import ConfirmModal from '../../../../../shared/components/Modal/ConfirmModal';

export default function SalespersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  // Task Performance
  const [taskPerformance, setTaskPerformance] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);

  // Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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

  // Fetch Data
  useEffect(() => {
    fetchSalespersonDetails();
    fetchTaskPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSalespersonDetails = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    try {
      const response = await staffService.getSalespersonById(id);
      if (response.status === 200 || response.data) {
        setPerson(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch salesperson');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load salesperson details');
      setUsingMockData(true);

      // Mock data for development
      setPerson({
        _id: id,
        fullName: 'Ali Raza',
        email: 'ali.raza@philbox.com',
        contactNumber: '03001111111',
        gender: 'Male',
        dateOfBirth: '1995-05-15',
        status: 'active',
        isTwoFactorEnabled: false,
        branches_to_be_managed: [
          {
            _id: '1',
            name: 'Lahore Main Branch',
            code: 'PHIL25#001',
            status: 'Active',
          },
        ],
        created_at: '2025-01-01T00:00:00.000Z',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskPerformance = async () => {
    setTaskLoading(true);
    try {
      const response = await staffService.getSalespersonTaskPerformance({
        salesperson_id: id,
        limit: 5,
      });
      if (response.status === 200 || response.data) {
        setTaskPerformance(response.data);
      }
    } catch (err) {
      console.warn('Task performance fetch failed:', err);
      // Mock data
      setTaskPerformance({
        metrics: {
          totalTasks: 45,
          statusBreakdown: {
            pending: 5,
            in_progress: 8,
            completed: 30,
            cancelled: 2,
          },
          priorityBreakdown: {
            low: 10,
            medium: 25,
            high: 10,
          },
          completionRate: '66.67%',
          overdueTasks: 2,
          averageCompletionDays: 3.5,
        },
        tasks: {
          docs: [
            {
              _id: '1',
              title: 'Complete inventory check',
              priority: 'high',
              status: 'in_progress',
              deadline: '2025-01-20',
            },
            {
              _id: '2',
              title: 'Process pending orders',
              priority: 'medium',
              status: 'pending',
              deadline: '2025-01-22',
            },
          ],
        },
      });
    } finally {
      setTaskLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await staffService.deleteSalesperson(id);
      if (response.status === 200 || response.success) {
        navigate('/admin/staff/salespersons', {
          state: { message: 'Salesperson deleted successfully!' },
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete salesperson');
    } finally {
      setActionLoading(false);
      setDeleteModal(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = async () => {
    setActionLoading(true);
    try {
      const response = await staffService.changeSalespersonStatus(
        id,
        newStatus
      );
      if (response.status === 200 || response.success) {
        setPerson(prev => ({ ...prev, status: newStatus }));
        setSuccessMessage(`Status changed to ${newStatus} successfully!`);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      alert(err.message || 'Failed to change status');
    } finally {
      setActionLoading(false);
      setStatusModal(false);
      setNewStatus('');
    }
  };

  const openStatusModal = status => {
    setNewStatus(status);
    setStatusModal(true);
  };

  // Get status badge styles
  const getStatusBadge = status => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  // Get status modal config
  const getStatusModalConfig = () => {
    switch (newStatus) {
      case 'active':
        return {
          title: 'Activate Salesperson',
          type: 'success',
          confirmText: 'Activate',
        };
      case 'suspended':
        return {
          title: 'Suspend Salesperson',
          type: 'warning',
          confirmText: 'Suspend',
        };
      case 'blocked':
        return {
          title: 'Block Salesperson',
          type: 'danger',
          confirmText: 'Block',
        };
      default:
        return {
          title: 'Change Status',
          type: 'warning',
          confirmText: 'Confirm',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-3xl text-[#1a365d]" />
      </div>
    );
  }

  if (error && !person) {
    return (
      <div className="text-center p-12">
        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Link
          to="/admin/staff/salespersons"
          className="text-[#1a365d] hover:underline mt-4 inline-block"
        >
          ← Back to Salespersons
        </Link>
      </div>
    );
  }

  const modalConfig = getStatusModalConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Back + Title */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/staff/salespersons"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
              {person?.fullName}
            </h1>
            <p className="text-gray-500 text-sm truncate">{person?.email}</p>
          </div>
        </div>

        {/* Action Buttons - Scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
          {/* Status Buttons */}
          {person?.status === 'active' && (
            <>
              <button
                onClick={() => openStatusModal('suspended')}
                className="shrink-0 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg flex items-center gap-2 hover:bg-yellow-200 text-sm"
              >
                <FaToggleOff /> Suspend
              </button>
              <button
                onClick={() => openStatusModal('blocked')}
                className="shrink-0 px-3 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 hover:bg-red-200 text-sm"
              >
                <FaBan /> Block
              </button>
            </>
          )}
          {person?.status === 'suspended' && (
            <>
              <button
                onClick={() => openStatusModal('active')}
                className="shrink-0 px-3 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 hover:bg-green-200 text-sm"
              >
                <FaToggleOn /> Activate
              </button>
              <button
                onClick={() => openStatusModal('blocked')}
                className="shrink-0 px-3 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 hover:bg-red-200 text-sm"
              >
                <FaBan /> Block
              </button>
            </>
          )}
          {person?.status === 'blocked' && (
            <button
              onClick={() => openStatusModal('active')}
              className="shrink-0 px-3 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 hover:bg-green-200 text-sm"
            >
              <FaToggleOn /> Activate
            </button>
          )}

          <button
            onClick={() => navigate(`/admin/staff/salespersons/${id}/edit`)}
            className="shrink-0 px-3 py-2 bg-[#d69e2e] text-white rounded-lg flex items-center gap-2 hover:bg-[#b8860b] text-sm"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="shrink-0 px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2"
        >
          <FaCheckCircle className="shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Warning Banner (Mock Data) */}
      {error && usingMockData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 flex items-center gap-2"
        >
          <FaExclamationTriangle className="shrink-0" />
          <span>{error} - Showing demo data</span>
        </motion.div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="h-5=10 sm:h-13 bg-linear-to-r from-orange-500 to-orange-600 relative">
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${getStatusBadge(person?.status)}`}
            >
              {person?.status}
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-6 pb-6">
          {/* Avatar + Name Section - Fixed overlap */}
          <div className="flex items-end sm:items-center gap-4 -mt-0.1">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-orange-100 border-4 border-white shadow-lg flex items-center justify-center shrink-0">
              <FaUserTie className="text-2xl sm:text-3xl text-orange-600" />
            </div>

            {/* Name + Role */}
            <div className="pb-1 sm:pb-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {person?.fullName}
              </h2>
              <p className="text-gray-500 text-sm">Salesperson</p>
            </div>
          </div>

          {/* Info Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            <InfoCard icon={FaEnvelope} label="Email" value={person?.email} />
            <InfoCard
              icon={FaPhone}
              label="Phone"
              value={person?.contactNumber || 'Not set'}
            />
            <InfoCard
              icon={FaVenusMars}
              label="Gender"
              value={person?.gender || 'Not set'}
            />
            <InfoCard
              icon={FaBirthdayCake}
              label="Date of Birth"
              value={
                person?.dateOfBirth
                  ? new Date(person.dateOfBirth).toLocaleDateString()
                  : 'Not set'
              }
            />
            <InfoCard
              icon={FaCalendar}
              label="Joined"
              value={new Date(person?.created_at).toLocaleDateString()}
            />
            <InfoCard
              icon={FaIdCard}
              label="2FA Status"
              value={person?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              valueClass={
                person?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-500'
              }
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Branches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCodeBranch className="text-[#1a365d]" />
            <span>Assigned Branches</span>
            <span className="ml-auto text-sm font-normal text-gray-500">
              {person?.branches_to_be_managed?.length || 0}
            </span>
          </h3>

          {person?.branches_to_be_managed?.length > 0 ? (
            <div className="space-y-3">
              {person.branches_to_be_managed.map(branch => (
                <Link
                  key={branch._id}
                  to={`/admin/branches/${branch._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#1a365d]/10 flex items-center justify-center shrink-0">
                      <FaCodeBranch className="text-[#1a365d]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {branch.name}
                      </p>
                      <p className="text-xs text-gray-500">{branch.code}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                      branch.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {branch.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaCodeBranch className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No branches assigned</p>
            </div>
          )}
        </motion.div>

        {/* Task Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTasks className="text-[#1a365d]" />
            Task Performance
          </h3>

          {taskLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-2xl text-gray-400" />
            </div>
          ) : taskPerformance?.metrics ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <StatBox
                  value={taskPerformance.metrics.totalTasks}
                  label="Total Tasks"
                  color="blue"
                />
                <StatBox
                  value={taskPerformance.metrics.completionRate}
                  label="Completion Rate"
                  color="green"
                />
                <StatBox
                  value={
                    taskPerformance.metrics.statusBreakdown?.in_progress || 0
                  }
                  label="In Progress"
                  color="yellow"
                />
                <StatBox
                  value={taskPerformance.metrics.overdueTasks}
                  label="Overdue"
                  color="red"
                />
              </div>

              {/* Status Breakdown */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Status Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    Pending:{' '}
                    {taskPerformance.metrics.statusBreakdown?.pending || 0}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    In Progress:{' '}
                    {taskPerformance.metrics.statusBreakdown?.in_progress || 0}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                    Completed:{' '}
                    {taskPerformance.metrics.statusBreakdown?.completed || 0}
                  </span>
                </div>
              </div>

              {/* Avg Completion */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Average Completion Time</p>
                <p className="font-semibold text-gray-800">
                  {taskPerformance.metrics.averageCompletionDays} days
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaTasks className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No task data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Tasks */}
      {taskPerformance?.tasks?.docs?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-[#1a365d]" />
            Recent Tasks
          </h3>

          {/* Desktop Table */}
          <div className="hidden sm:block space-y-3">
            {taskPerformance.tasks.docs.map(task => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : task.status === 'pending'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-700'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {taskPerformance.tasks.docs.map(task => (
              <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : task.status === 'pending'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Salesperson"
        message={`Are you sure you want to delete "${person?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* Status Change Modal */}
      <ConfirmModal
        isOpen={statusModal}
        onClose={() => {
          setStatusModal(false);
          setNewStatus('');
        }}
        onConfirm={handleStatusChange}
        title={modalConfig.title}
        message={`Are you sure you want to ${newStatus} "${person?.fullName}"?`}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
        loading={actionLoading}
      />
    </div>
  );
}

// Sub-components
const InfoCard = ({ icon, label, value, valueClass = '', className = '' }) => {
  const Icon = icon;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium text-gray-800 truncate ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

const StatBox = ({ value, label, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };
  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className={`p-3 rounded-lg text-center ${colorMap[color]}`}>
      <p className={`text-xl sm:text-2xl font-bold ${textColor[color]}`}>
        {value}
      </p>
      <p className={`text-xs ${textColor[color]}`}>{label}</p>
    </div>
  );
};
