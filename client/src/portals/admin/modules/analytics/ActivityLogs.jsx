// src/portals/admin/modules/analytics/ActivityLogs.jsx
import { useState, useEffect } from 'react';
import {
  FaHistory,
  FaCalendarAlt,
  FaFilter,
  FaExclamationTriangle,
  FaSignInAlt,
  FaChartPie,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaShieldAlt,
} from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';
import { useAuth } from '../../../../shared/context/AuthContext';

const { activityLogs: activityLogsApi } = adminApi;

// KPI Card
// eslint-disable-next-line no-unused-vars
const KPICard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="text-xl" style={{ color }} />
      </div>
    </div>
  </div>
);

// Activity Type Badge
const ActivityBadge = ({ type }) => {
  const typeConfig = {
    login: { bg: 'bg-green-100', text: 'text-green-700', label: 'Login' },
    logout: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Logout' },
    create: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Create' },
    update: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Update' },
    delete: { bg: 'bg-red-100', text: 'text-red-700', label: 'Delete' },
    view: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'View' },
  };

  const config = typeConfig[type?.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: type || 'Unknown',
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Timeline Item
const TimelineItem = ({ log }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="w-10 h-10 rounded-full bg-[#1a365d] flex items-center justify-center text-white flex-shrink-0">
      <FaUser />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-medium text-gray-800">
          {log.userName || log.user?.name || 'Unknown User'}
        </p>
        <ActivityBadge type={log.actionType || log.action} />
      </div>
      <p className="text-sm text-gray-600 mt-1 break-words">
        {log.description || log.details || 'Activity performed'}
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
        <span>
          {log.createdAt || log.created_at
            ? new Date(log.createdAt || log.created_at).toLocaleString()
            : 'Unknown time'}
        </span>
        <span className="hidden sm:inline">
          IP: {log.ipAddress || log.ip_address || 'N/A'}
        </span>
        <span className="hidden md:inline">
          Role: {log.userRole || log.role || 'N/A'}
        </span>
      </div>
    </div>
  </div>
);

export default function ActivityLogs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [frequentActions, setFrequentActions] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filters, setFilters] = useState({
    actionType: '',
    userRole: '',
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch branches
  useEffect(() => {
    if (user?.category === 'super-admin') {
      adminApi.branches.getAll(1, 100).then(res => {
        setBranches(res.data?.branches || res.data?.docs || []);
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const commonParams = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          branchId: selectedBranch,
        };

        const [
          overviewRes,
          timelineRes,
          freqActionsRes,
          loginRes,
          suspiciousRes,
        ] = await Promise.all([
          activityLogsApi.getOverview(commonParams).catch(err => {
            console.error('Overview error:', err);
            return { data: null };
          }),
          activityLogsApi
            .getTimeline({
              ...commonParams,
              page,
              limit: 10,
              ...filters,
            })
            .catch(err => {
              console.error('Timeline error:', err);
              return { data: { logs: [], timeline: [], pagination: {} } };
            }),
          activityLogsApi.getFrequentActions(commonParams).catch(err => {
            console.error('Frequent actions error:', err);
            return { data: [] };
          }),
          activityLogsApi.getLoginAttempts(commonParams).catch(err => {
            console.error('Login attempts error:', err);
            return { data: null };
          }),
          activityLogsApi
            .getSuspiciousActivities({ ...commonParams, limit: 5 })
            .catch(err => {
              console.error('Suspicious activities error:', err);
              return { data: { suspiciousActivities: [] } };
            }),
        ]);

        console.log('Timeline Response:', timelineRes.data);

        setOverview(overviewRes.data);
        setTimeline(timelineRes.data?.logs || timelineRes.data?.timeline || []);
        setTotalPages(timelineRes.data?.pagination?.totalPages || 1);
        setFrequentActions(
          freqActionsRes.data?.actions ||
            freqActionsRes.data?.frequentActions ||
            freqActionsRes.data ||
            []
        );
        setLoginAttempts(loginRes.data);
        setSuspiciousActivities(suspiciousRes.data?.suspiciousActivities || []);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, page, filters, selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#805ad5] to-[#6b46c1] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaHistory />
          Activity Logs
        </h1>
        <p className="text-white/80 mt-1">
          Monitor system activities and user actions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <FaFilter className="text-gray-400" /> Filters
            </div>

            {/* Branch Filter - Super Admin only */}
            {user?.category === 'super-admin' && (
              <div className="flex items-center gap-2">
                <FaBuilding className="text-gray-400" />
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none text-sm"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(p => ({ ...p, startDate: e.target.value }))
                }
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(p => ({ ...p, endDate: e.target.value }))
                }
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none text-sm"
              />
            </div>

            <select
              value={filters.userRole}
              onChange={e =>
                setFilters(p => ({ ...p, userRole: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="salesperson">Salesperson</option>
            </select>

            <select
              value={filters.actionType}
              onChange={e =>
                setFilters(p => ({ ...p, actionType: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none text-sm"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="suspend">Suspend</option>
              <option value="block">Block</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedBranch('');
              setFilters({ actionType: '', userRole: '' });
              setDateRange({
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
              });
            }}
            className="text-sm text-[#805ad5] hover:text-[#6b46c1] font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Activities"
          value={overview?.totalActivities || 0}
          icon={FaHistory}
          color="#805ad5"
          loading={loading}
        />
        <KPICard
          title="Login Attempts"
          value={loginAttempts?.total || 0}
          icon={FaSignInAlt}
          color="#38a169"
          loading={loading}
        />
        <KPICard
          title="Failed Logins"
          value={loginAttempts?.failed || 0}
          icon={FaExclamationTriangle}
          color="#e53e3e"
          loading={loading}
        />
        <KPICard
          title="Total Super Admins"
          value={overview?.uniqueUsers || 0}
          icon={FaUser}
          color="#1a365d"
          loading={loading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaHistory className="text-[#805ad5]" />
            Recent Activity Timeline
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : timeline.length > 0 ? (
            <>
              <div className="space-y-3">
                {timeline.map((log, index) => (
                  <TimelineItem key={log._id || index} log={log} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="px-4 text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No activity logs found
            </p>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Frequent Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartPie className="text-[#d69e2e]" />
              Most Frequent Actions
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : frequentActions.length > 0 ? (
              <div className="space-y-3">
                {frequentActions.slice(0, 10).map((action, index) => {
                  const maxCount = frequentActions[0]?.count || 1;
                  const percentage = (action.count / maxCount) * 100;

                  return (
                    <div key={index} className="relative">
                      <div
                        className="absolute inset-0 bg-[#805ad5] opacity-10 rounded-lg"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div className="relative flex items-center justify-between p-3">
                        <span className="font-medium text-gray-700 capitalize">
                          {action.actionType || action.action}
                        </span>
                        <div className="text-right">
                          <p className="font-bold text-[#805ad5]">
                            {action.count}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase">
                            {action.userRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No data available
              </p>
            )}
          </div>

          {/* Suspicious Alerts */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 text-red-600">
              <FaShieldAlt />
              Suspicious Activity Alerts
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : suspiciousActivities.length > 0 ? (
              <div className="space-y-3">
                {suspiciousActivities.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 uppercase">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {alert.userName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <FaShieldAlt className="text-3xl mx-auto mb-2 opacity-20" />
                <p className="text-sm">No suspicious activity detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
