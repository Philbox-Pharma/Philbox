/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
  salespersonTaskApi,
  branchApi,
  staffApi,
} from '../../../../core/api/admin/adminApi';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTasks,
  FaFilter,
  FaCalendarAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaThLarge,
  FaList,
} from 'react-icons/fa';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [statistics, setStatistics] = useState(null);
  const [branches, setBranches] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({
    branch_id: '',
    salesperson_id: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  const [formData, setFormData] = useState({
    salesperson_id: '',
    branch_id: '',
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes, branchesRes, salespersonsRes] =
        await Promise.all([
          salespersonTaskApi.getTasks(filters),
          salespersonTaskApi.getStatistics(filters),
          branchApi.getAll(1, 100),
          staffApi.getSalespersons(1, 100),
        ]);

      if (tasksRes.status === 200) {
        setTasks(tasksRes.data.tasks || []);
      }

      if (statsRes.status === 200) {
        setStatistics(statsRes.data || {});
      }

      if (branchesRes.status === 200) {
        setBranches(branchesRes.data.branches || []);
      }

      if (salespersonsRes.status === 200) {
        setSalespersons(salespersonsRes.data.salespersons || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async e => {
    e.preventDefault();
    try {
      const res = await salespersonTaskApi.createTask(formData);
      if (res.status === 201) {
        alert('Task created successfully!');
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      alert(error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async e => {
    e.preventDefault();
    try {
      const res = await salespersonTaskApi.updateTask(
        selectedTask._id,
        formData
      );
      if (res.status === 200) {
        alert('Task updated successfully!');
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      alert(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async taskId => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await salespersonTaskApi.deleteTask(taskId);
      if (res.status === 200) {
        alert('Task deleted successfully!');
        fetchData();
      }
    } catch (error) {
      alert(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      // Optimistic update
      const updatedTasks = tasks.map(t =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);

      const res = await salespersonTaskApi.updateTask(taskId, {
        ...task,
        status: newStatus,
        salesperson_id: task.salesperson_id._id, // Ensure ID is passed
        branch_id: task.branch_id._id,
      });

      if (res.status === 200) {
        fetchData(); // Refresh to ensure sync
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update task status');
      fetchData(); // Revert on error
    }
  };

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDragOver = e => {
    e.preventDefault();
  };

  const onDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleStatusChange(taskId, status);
    }
  };

  const resetForm = () => {
    setFormData({
      salesperson_id: '',
      branch_id: '',
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
    });
    setSelectedTask(null);
    setModalMode('create');
  };

  const openEditModal = task => {
    setSelectedTask(task);
    setFormData({
      salesperson_id: task.salesperson_id?._id || '',
      branch_id: task.branch_id?._id || '',
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split('T')[0]
        : '',
      status: task.status,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const getStatusBadge = status => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: FaHourglassHalf,
        label: 'Pending',
      },
      'in-progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: FaHourglassHalf,
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: FaCheckCircle,
        label: 'Completed',
      },
      cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: FaExclamationCircle,
        label: 'Cancelled',
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon /> {config.label}
      </span>
    );
  };

  const getPriorityBadge = priority => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
      high: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTasks className="text-blue-600" />
            Salesperson Task Management
          </h1>
          <p className="text-gray-600 mt-1">
            Assign and track tasks for your sales team
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="List View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded ${
                viewMode === 'board'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Board View"
            >
              <FaThLarge />
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Create Task
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Total Tasks</p>
                <h3 className="text-3xl font-bold mt-1">
                  {statistics.totalTasks || 0}
                </h3>
              </div>
              <FaTasks className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <h3 className="text-3xl font-bold mt-1">
                  {statistics.byStatus?.pending || 0}
                </h3>
              </div>
              <FaHourglassHalf className="text-4xl text-yellow-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <h3 className="text-3xl font-bold mt-1">
                  {statistics.byStatus?.completed || 0}
                </h3>
              </div>
              <FaCheckCircle className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100 text-sm">Overdue</p>
                <h3 className="text-3xl font-bold mt-1">
                  {statistics.overdueTasks || 0}
                </h3>
              </div>
              <FaExclamationCircle className="text-4xl text-red-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <FaFilter /> Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.branch_id}
            onChange={e =>
              setFilters({ ...filters, branch_id: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            value={filters.salesperson_id}
            onChange={e =>
              setFilters({
                ...filters,
                salesperson_id: e.target.value,
                page: 1,
              })
            }
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Salespersons</option>
            {salespersons.map(sp => (
              <option key={sp._id} value={sp._id}>
                {sp.fullName}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={e =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={e =>
              setFilters({ ...filters, priority: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            onClick={() =>
              setFilters({
                ...filters,
                branch_id: '',
                salesperson_id: '',
                status: '',
                priority: '',
                startDate: '',
                endDate: '',
                page: 1,
              })
            }
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salesperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No tasks found. Create your first task!
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.salesperson_id?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.branch_id?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(task.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {['pending', 'in-progress', 'completed', 'cancelled'].map(status => (
            <div
              key={status}
              className="bg-gray-100 rounded-xl p-4 min-w-[280px]"
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700 capitalize">
                  {status.replace('-', ' ')}
                </h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter(t => t.status === status)
                  .map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={e => onDragStart(e, task._id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                            {task.salesperson_id?.fullName?.charAt(0) || 'U'}
                          </div>
                          <span className="truncate max-w-[80px]">
                            {task.salesperson_id?.fullName?.split(' ')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(task.deadline).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' }
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm">No tasks</p>
                    <p className="text-xs mt-1">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            <form
              onSubmit={
                modalMode === 'create' ? handleCreateTask : handleUpdateTask
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch *
                  </label>
                  <select
                    required
                    value={formData.branch_id}
                    onChange={e =>
                      setFormData({ ...formData, branch_id: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salesperson *
                  </label>
                  <select
                    required
                    value={formData.salesperson_id}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        salesperson_id: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Salesperson</option>
                    {salespersons.map(sp => (
                      <option key={sp._id} value={sp._id}>
                        {sp.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={e =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
