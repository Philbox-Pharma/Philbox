import { useState, useEffect, useCallback } from 'react';
import {
  FaTasks,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaArrowUp,
  FaPaperPlane,
  FaBuilding,
  FaUserShield,
  FaCalendarAlt,
  FaComment,
} from 'react-icons/fa';
import { salespersonTasksApi } from '../../../../core/api/salesperson/tasks.service';

// ==========================================
// PRIORITY BADGE
// ==========================================
const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Urgent', icon: FaExclamationTriangle },
  high:   { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High', icon: FaArrowUp },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium', icon: null },
  low:    { color: 'bg-green-100 text-green-700 border-green-200', label: 'Low', icon: null },
};

const statusConfig = {
  'pending':     { color: 'bg-amber-100 text-amber-700', icon: FaClock, label: 'Pending' },
  'in-progress': { color: 'bg-blue-100 text-blue-700', icon: FaSpinner, label: 'In Progress' },
  'completed':   { color: 'bg-green-100 text-green-700', icon: FaCheckCircle, label: 'Completed' },
  'cancelled':   { color: 'bg-gray-100 text-gray-600', icon: FaTimesCircle, label: 'Cancelled' },
};

// ==========================================
// TASK CARD
// ==========================================
function TaskCard({ task, onStatusChange, onAddComment }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() &&
    ['pending', 'in-progress'].includes(task.status);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await onStatusChange(task._id, newStatus);
    setUpdatingStatus(false);
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    await onAddComment(task._id, commentText.trim());
    setCommentText('');
    setSubmittingComment(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
      isOverdue ? 'border-red-300' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-bold text-gray-800 text-base leading-tight truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 shrink-0 ${priority.color}`}>
            {priority.icon && <priority.icon size={10} />}
            {priority.label}
          </span>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${status.color}`}>
            <StatusIcon size={11} className={task.status === 'in-progress' ? 'animate-spin' : ''} />
            {status.label}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt size={11} />
            Due: <span className={isOverdue ? 'text-red-600 font-bold' : 'text-gray-700 font-medium'}>{formatDate(task.deadline)}</span>
            {isOverdue && <span className="text-red-500 font-bold ml-1">OVERDUE</span>}
          </span>
          {task.branch_id && (
            <span className="flex items-center gap-1">
              <FaBuilding size={11} /> {task.branch_id.name || 'Branch'}
            </span>
          )}
        </div>

        {/* Assigned by */}
        {task.assigned_by_admin_id && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <FaUserShield size={11} />
            Assigned by: <span className="font-medium text-gray-600">{task.assigned_by_admin_id.name || 'Admin'}</span>
            {task.created_at && <span>• {getTimeAgo(task.created_at)}</span>}
          </p>
        )}

        {/* Action Buttons */}
        {task.status !== 'completed' && task.status !== 'cancelled' && (
          <div className="flex items-center gap-2 mt-4">
            {task.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('in-progress')}
                disabled={updatingStatus}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-all border border-blue-200 disabled:opacity-50"
              >
                <FaSpinner size={12} /> {updatingStatus ? 'Updating...' : 'Start Task'}
              </button>
            )}
            {task.status === 'in-progress' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={updatingStatus}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-all border border-green-200 disabled:opacity-50"
              >
                <FaCheckCircle size={12} /> {updatingStatus ? 'Updating...' : 'Mark Complete'}
              </button>
            )}
            {['pending', 'in-progress'].includes(task.status) && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updatingStatus}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-sm transition-all border border-gray-200 disabled:opacity-50"
              >
                <FaTimesCircle size={12} /> Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expandable Updates/Comments Section */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FaComment size={12} />
            Updates ({task.updates?.length || 0})
          </span>
          {expanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>

        {expanded && (
          <div className="px-5 pb-4">
            {/* Updates List */}
            {task.updates && task.updates.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {task.updates.map((u, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {u.role === 'admin' ? 'A' : 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{u.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {u.role === 'admin' ? 'Admin' : 'You'} • {getTimeAgo(u.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4 text-center py-2">No updates yet</p>
            )}

            {/* Add Comment */}
            {task.status !== 'completed' && task.status !== 'cancelled' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Add an update..."
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// STATS BAR
// ==========================================
function StatsBar({ stats }) {
  if (!stats) return null;

  const statItems = [
    { label: 'Total', value: stats.totalTasks || 0, color: 'text-gray-800', bg: 'bg-gray-50' },
    { label: 'Pending', value: stats.byStatus?.pending || 0, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'In Progress', value: stats.byStatus?.['in-progress'] || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Completed', value: stats.byStatus?.completed || 0, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Overdue', value: stats.overdueTasks || 0, color: 'text-red-700', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100 text-center`}>
          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function SalespersonTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await salespersonTasksApi.getMyTasks(params);
      const data = res.data?.data || res.data;
      setTasks(data.tasks || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await salespersonTasksApi.getTaskStatistics();
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await salespersonTasksApi.updateTaskStatus(taskId, newStatus);
      // Update locally
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      fetchStats(); // Refresh stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleAddComment = async (taskId, message) => {
    try {
      const res = await salespersonTasksApi.addTaskUpdate(taskId, message);
      const updatedTask = res.data?.data;
      if (updatedTask) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, updates: updatedTask.updates } : t));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add update');
    }
  };

  // Client-side search filter
  const filteredTasks = tasks.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 py-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTasks className="text-blue-500" />
          My Tasks
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your assigned tasks
        </p>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">{error}</div>
      )}

      {/* Task Grid */}
      {!loading && !error && filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTasks className="text-3xl text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Tasks Found</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            {statusFilter || priorityFilter
              ? 'No tasks match your current filters. Try adjusting them.'
              : 'You have no assigned tasks right now. Check back later!'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                page === pageNum
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
