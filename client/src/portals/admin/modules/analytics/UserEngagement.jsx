// src/portals/admin/modules/analytics/UserEngagement.jsx
import { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaCalendarAlt, FaFilter, FaCrown, FaUserMd, FaSyncAlt, FaBuilding, FaChartLine } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';
import { useAuth } from '../../../../shared/context/AuthContext';

const { userEngagement: userEngagementApi, branches: branchApi } = adminApi;

export default function UserEngagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [customerStatus, setCustomerStatus] = useState({
    active: 0,
    suspended: 0,
    blocked: 0,
    total: 0
  });
  const [topCustomers, setTopCustomers] = useState([]);
  const [doctorApplications, setDoctorApplications] = useState(null);
  const [trends, setTrends] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch branches for filter
  useEffect(() => {
    if (user?.category === 'super-admin') {
      branchApi.getAll(1, 100).then(res => {
        setBranches(res.data?.branches || res.data?.docs || []);
      }).catch(err => console.error('Failed to fetch branches', err));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period: period,
          branchId: selectedBranch,
          limit: 10,
        };

        const overviewRes = await userEngagementApi.getOverview(filters);

        if (overviewRes?.data) {
          const data = overviewRes.data;

          // Parse retention rate data
          const retentionData = data.retentionRate || {};

          // Parse customer status data
          const statusData = data.customerActivityStatus || {};

          // Parse new customers data (trends)
          const newCustomersData = Array.isArray(data.newCustomersTrends?.trends) 
            ? data.newCustomersTrends.trends 
            : [];
          setTrends(newCustomersData);

          const totalNewCustomers = newCustomersData.reduce(
            (sum, item) => sum + (Number(item.newCustomers) || 0),
            0
          );

          // Parse doctor applications
          const doctorAppsData = data.doctorApplications?.summary || {};

          setOverview({
            totalCustomers: Number(statusData.total) || 0,
            newCustomers: totalNewCustomers,
            retentionRate: Number(retentionData.retentionRate) || 0,
            churnRate: Number(retentionData.churnRate) || 0,
            retainedCustomers: Number(retentionData.retainedCustomers) || 0,
          });

          setCustomerStatus({
            active: Number(statusData.active) || 0,
            suspended: Number(statusData['suspended/freezed']) || 0,
            blocked: Number(statusData['blocked/removed']) || 0,
            total: Number(statusData.total) || 0,
          });

          setTopCustomers(Array.isArray(data.topCustomers?.topCustomers) 
            ? data.topCustomers.topCustomers 
            : []);

          setDoctorApplications({
            pending: Number(doctorAppsData.pending) || 0,
            processing: Number(doctorAppsData.processing) || 0,
            approved: Number(doctorAppsData.approved) || 0,
            rejected: Number(doctorAppsData.rejected) || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch engagement data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange, selectedBranch, period]);

  const totalSafe = Number(customerStatus?.total) || 0;
  const activePercent = totalSafe > 0 ? ((Number(customerStatus?.active) || 0) / totalSafe) * 100 : 0;
  const suspendedPercent = totalSafe > 0 ? ((Number(customerStatus?.suspended) || 0) / totalSafe) * 100 : 0;
  const blockedPercent = totalSafe > 0 ? ((Number(customerStatus?.blocked) || 0) / totalSafe) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#38a169] to-[#2f855a] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaUsers />
          User Engagement Analytics
        </h1>
        <p className="text-white/80 mt-1">
          Monitor customer activity and platform engagement
        </p>
      </div>

      {/* Date & Branch Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold shrink-0">
              <FaFilter className="text-gray-400" /> Filters
            </div>

            {/* Branch Filter - Only for Super Admin */}
            {user?.category === 'super-admin' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FaBuilding className="text-gray-400" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38a169] outline-none text-sm"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <FaCalendarAlt className="text-gray-400 hidden sm:block" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38a169] outline-none text-sm"
              />
              <span className="text-gray-400 hidden sm:block">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38a169] outline-none text-sm"
              />
            </div>
          </div>
          
          <button 
            onClick={() => {
              setDateRange({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              });
              setSelectedBranch('');
            }}
            className="text-sm text-[#38a169] hover:text-[#2f855a] font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {overview?.totalCustomers || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1a365d15' }}
            >
              <FaUsers className="text-2xl" style={{ color: '#1a365d' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New Customers</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {overview?.newCustomers || 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">This period</p>
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#38a16915' }}
            >
              <FaUserPlus className="text-2xl" style={{ color: '#38a169' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Retention Rate</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {(Number(overview?.retentionRate) || 0).toFixed(1)}%
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#d69e2e15' }}
            >
              <FaSyncAlt className="text-2xl" style={{ color: '#d69e2e' }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Doctor Applications</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {doctorApplications?.pending || 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Pending review</p>
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#805ad515' }}
            >
              <FaUserMd className="text-2xl" style={{ color: '#805ad5' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Customers Trends */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-[#38a169]" /> New Customers
            </h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-[#38a169]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {loading ? (
            <div className="flex items-end gap-3 h-48 animate-pulse">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${20 + i * 10}%` }}></div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {(Array.isArray(trends) ? trends : []).length > 0 ? (
                trends.map((t, i) => {
                  const max = Math.max(...trends.map(x => Number(x.newCustomers) || 0), 1);
                  const label = period === 'daily' ? `${t?._id?.day}/${t?._id?.month}` : period === 'weekly' ? `W${t?._id?.week}` : `${t?._id?.month}/${t?._id?.year}`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className="w-full bg-[#38a169] rounded-t opacity-80 hover:opacity-100 transition-all duration-300"
                        style={{ height: `${Math.max(((Number(t.newCustomers) || 0) / max) * 100, 5)}%` }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {t.newCustomers} New
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-2 rotate-45 sm:rotate-0">{label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
              )}
            </div>
          )}
        </div>

        {/* Customer Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Activity Status
          </h3>
          {loading ? (
            <div className="animate-pulse flex items-center justify-center h-48">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-48">
              <div
                className="w-32 h-32 rounded-full relative shrink-0"
                style={{
                  background: `conic-gradient(#38a169 0% ${activePercent}%, #d69e2e ${activePercent}% ${activePercent + suspendedPercent}%, #e53e3e ${activePercent + suspendedPercent}% ${activePercent + suspendedPercent + blockedPercent}%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-gray-800">
                    {totalSafe}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">Total</span>
                </div>
              </div>
              <div className="space-y-4 w-full max-w-[200px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#38a169]"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {customerStatus.active}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#d69e2e]"></div>
                    <span className="text-sm text-gray-600">Suspended</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {customerStatus.suspended}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e53e3e]"></div>
                    <span className="text-sm text-gray-600">Blocked</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {customerStatus.blocked}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Applications Breakdown */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Doctor Applications
          </h3>
          {loading ? (
            <div className="space-y-4">
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-700">Pending</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {doctorApplications?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Processing</span>
                <span className="text-2xl font-bold text-blue-600">
                  {doctorApplications?.processing || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Approved</span>
                <span className="text-2xl font-bold text-green-600">
                  {doctorApplications?.approved || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="font-medium text-red-700">Rejected</span>
                <span className="text-2xl font-bold text-red-600">
                  {doctorApplications?.rejected || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Top Customers
          </h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          ) : topCustomers.length > 0 ? (
            <div className="space-y-3">
              {(Array.isArray(topCustomers) ? topCustomers : []).map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}
                  >
                    {index < 3 ? <FaCrown /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {customer.customerName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.customerEmail || 'No email'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-[#1a365d]">
                        {customer.orderCount || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">orders</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                    <div className="hidden sm:block">
                      <p className="font-bold text-[#d69e2e]">
                        {customer.appointmentCount || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">appts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No customer data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
