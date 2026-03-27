import { useState, useEffect, useCallback } from 'react';
import {
  FaUserTie,
  FaChartLine,
  FaTrophy,
  FaTasks,
  FaClock,
  FaFilter,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaMedal,
  FaStar,
  FaCheckCircle,
  FaHourglass,
  FaExclamationTriangle,
} from 'react-icons/fa';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchWithAuth = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw { status: response.status, message: data.message || 'Request failed' };
  return data;
};

// ==========================================
// STAT CARD
// ==========================================
function StatCard({ icon, label, value, trend, color, bgColor, borderColor }) {
  const IconComp = icon;
  return (
    <div className={`bg-white rounded-xl border ${borderColor || 'border-gray-200'} p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-lg ${bgColor || 'bg-blue-100'} flex items-center justify-center`}>
          <IconComp className={`text-lg ${color || 'text-blue-600'}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ==========================================
// LEADERBOARD TABLE
// ==========================================
function LeaderboardTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No leaderboard data available</div>
    );
  }

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rank</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Salesperson</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks Done</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((person, i) => (
            <tr key={person._id || i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {i < 3 ? (
                    <FaMedal className={getMedalColor(i + 1)} size={16} />
                  ) : (
                    <span className="w-6 text-center text-gray-400 font-bold text-sm">{i + 1}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(person.fullName || person.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{person.fullName || person.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{person.branch?.name || person.branchName || ''}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center font-semibold text-gray-700">{person.completedTasks ?? person.tasksCompleted ?? 0}</td>
              <td className="px-4 py-3 text-center font-semibold text-gray-700">{person.totalOrders ?? person.orders ?? 0}</td>
              <td className="px-4 py-3 text-right font-bold text-green-600">Rs. {(person.totalRevenue ?? person.revenue ?? 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// TASK COMPLETION CHART (Bar visual)
// ==========================================
function TaskCompletionBars({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No task completion data available</div>;
  }

  const maxVal = Math.max(...data.map(d => d.total || d.completed || 0), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((item, i) => {
        const completed = item.completed ?? item.completedTasks ?? 0;
        const total = item.total ?? item.totalTasks ?? 0;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 truncate text-xs font-medium text-gray-600">{item.fullName || item.name || `Person ${i + 1}`}</div>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${(total / maxVal) * 100}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(completed / maxVal) * 100}%` }}
              />
            </div>
            <div className="text-xs font-bold text-gray-600 w-16 text-right">{completed}/{total} <span className="text-gray-400">({rate}%)</span></div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-sm inline-block" /> Completed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-sm inline-block" /> Total Assigned</span>
      </div>
    </div>
  );
}

// ==========================================
// TRENDS CHART (Simple line visual)
// ==========================================
function TrendsVisual({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No trend data available</div>;
  }

  const maxVal = Math.max(...data.map(d => d.completed ?? d.value ?? 0), 1);

  return (
    <div className="space-y-2">
      {data.map((point, i) => {
        const val = point.completed ?? point.value ?? 0;
        const pct = (val / maxVal) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 truncate">{point.period || point.date || point.label || `Week ${i + 1}`}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-10 text-right">{val}</span>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// AVG COMPLETION TIME CARD
// ==========================================
function CompletionTimeCard({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No completion time data available</div>;
  }

  const priorityConfig = {
    high: { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    medium: { icon: FaHourglass, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    low: { icon: FaClock, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {data.map((item, i) => {
        const priority = (item.priority || item._id || 'medium').toLowerCase();
        const config = priorityConfig[priority] || priorityConfig.medium;
        const Icon = config.icon;
        const hours = item.averageCompletionTime ?? item.avgTime ?? 0;
        const displayTime = hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;

        return (
          <div key={i} className={`${config.bg} border ${config.border} rounded-xl p-4 text-center`}>
            <Icon className={`${config.color} mx-auto mb-2`} size={20} />
            <p className="text-2xl font-bold text-gray-800">{displayTime}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase mt-1 capitalize">{priority} Priority</p>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function SalespersonPerformance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [taskCompletion, setTaskCompletion] = useState([]);
  const [trends, setTrends] = useState([]);
  const [completionTime, setCompletionTime] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback((extraParams = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString() ? `?${params}` : '';
  }, [startDate, endDate, branchId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const query = buildQuery();

      const [overviewRes, leaderboardRes, tasksRes, trendsRes, timeRes] = await Promise.allSettled([
        fetchWithAuth(`/admin/salesperson-performance/overview${query}`),
        fetchWithAuth(`/admin/salesperson-performance/leaderboard${query}`),
        fetchWithAuth(`/admin/salesperson-performance/tasks-completion${query}`),
        fetchWithAuth(`/admin/salesperson-performance/trends${query}`),
        fetchWithAuth(`/admin/salesperson-performance/completion-time${query}`),
      ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data || overviewRes.value);
      if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value.data?.leaderboard || leaderboardRes.value.data || []);
      if (tasksRes.status === 'fulfilled') setTaskCompletion(tasksRes.value.data?.salespersons || tasksRes.value.data || []);
      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data?.trends || trendsRes.value.data || []);
      if (timeRes.status === 'fulfilled') setCompletionTime(timeRes.value.data?.completionTimes || timeRes.value.data || []);

      // Check if all failed
      const allFailed = [overviewRes, leaderboardRes, tasksRes, trendsRes, timeRes].every(r => r.status === 'rejected');
      if (allFailed) {
        setError('Failed to load performance data. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setBranchId('');
  };

  const hasActiveFilters = startDate || endDate || branchId;

  return (
    <div className="space-y-6 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-indigo-500" />
            Salesperson Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track sales team performance, task completion, and rankings</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <FaFilter size={12} /> Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Branch ID</label>
              <input type="text" value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="Filter by branch..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button onClick={handleClearFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <FaTimes size={10} /> Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">Loading performance data...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FaUserTie}
              label="Total Salespersons"
              value={overview?.totalSalespersons ?? overview?.totalCount ?? leaderboard.length}
              color="text-indigo-600"
              bgColor="bg-indigo-100"
              borderColor="border-indigo-200"
            />
            <StatCard
              icon={FaTasks}
              label="Tasks Completed"
              value={overview?.totalTasksCompleted ?? overview?.completedTasks ?? '—'}
              trend={overview?.taskCompletionTrend}
              color="text-green-600"
              bgColor="bg-green-100"
              borderColor="border-green-200"
            />
            <StatCard
              icon={FaStar}
              label="Avg Completion Rate"
              value={overview?.avgCompletionRate ? `${overview.avgCompletionRate}%` : '—'}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
              borderColor="border-yellow-200"
            />
            <StatCard
              icon={FaClock}
              label="Avg Completion Time"
              value={overview?.avgCompletionTime ? `${overview.avgCompletionTime}h` : '—'}
              color="text-purple-600"
              bgColor="bg-purple-100"
              borderColor="border-purple-200"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                <h3 className="font-bold text-gray-800">Salesperson Leaderboard</h3>
              </div>
              <LeaderboardTable data={leaderboard} />
            </div>

            {/* Task Completion */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <h3 className="font-bold text-gray-800">Task Completion by Salesperson</h3>
              </div>
              <div className="p-5">
                <TaskCompletionBars data={taskCompletion} />
              </div>
            </div>

            {/* Trends */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                <h3 className="font-bold text-gray-800">Performance Trends</h3>
              </div>
              <div className="p-5">
                <TrendsVisual data={trends} />
              </div>
            </div>

            {/* Avg Completion Time by Priority */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                <h3 className="font-bold text-gray-800">Avg Completion Time by Priority</h3>
              </div>
              <div className="p-5">
                <CompletionTimeCard data={completionTime} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
