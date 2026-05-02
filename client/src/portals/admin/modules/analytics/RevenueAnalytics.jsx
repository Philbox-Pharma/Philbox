// src/portals/admin/modules/analytics/RevenueAnalytics.jsx
import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaFilter, FaArrowUp, FaArrowDown, FaBuilding } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';
import { useAuth } from '../../../../shared/context/AuthContext';

// KPI Card Component

const KPICard = ({ title, value, icon, color, trend, trendValue, loading }) => {
  const Icon = icon;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          )}
          {trend && !loading && (
            <div
              className={`flex items-center gap-1 mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

// Currency Formatter
const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `Rs ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rs ${(amount / 1000).toFixed(1)}K`;
  }
  return `Rs ${amount.toFixed(0)}`;
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, loading, title, period, setPeriod }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex items-end gap-3 h-48">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-200 rounded-t"
              style={{ height: `${30 + i * 15}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...(data?.map(d => d.value) || [1]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-[#1a365d]"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="flex items-end gap-3 h-48">
        {data?.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative">
              <div
                className="w-full bg-gradient-to-t from-[#1a365d] to-[#3182ce] rounded-t transition-all duration-300 hover:brightness-110"
                style={{
                  height: `${Math.max((item.value / maxValue) * 100, 5)}%`,
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {formatCurrency(item.value)}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                {item.label}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No trend data
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Pie Chart Component (using CSS)
const SimplePieChart = ({ data, loading, title }) => {
  if (loading || !data?.length) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full shrink-0"></div>
          <div className="w-full sm:flex-1 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#1a365d', '#d69e2e', '#38a169', '#e53e3e', '#805ad5'];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div
          className="w-32 h-32 rounded-full relative"
          style={{
            background: `conic-gradient(${data
              .map((item, i) => {
                const start =
                  (data.slice(0, i).reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  100;
                const end = start + (item.value / total) * 100;
                return `${colors[i % colors.length]} ${start}% ${end}%`;
              })
              .join(', ')})`,
          }}
        >
          <div className="absolute inset-4 bg-white rounded-full"></div>
        </div>
        <div className="w-full sm:flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              ></div>
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-800 ml-auto">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function RevenueAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [split, setSplit] = useState([]);
  const [topBranches, setTopBranches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch branches for filter (Super Admin only)
  useEffect(() => {
    if (user?.category === 'super-admin') {
      const fetchBranches = async () => {
        try {
          const res = await adminApi.branches.getAll(1, 100);
          setBranches(res.data?.branches || res.data?.docs || []);
        } catch (err) {
          console.error('Failed to fetch branches:', err);
        }
      };
      fetchBranches();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await adminApi.revenue.getOverview(
          dateRange.startDate,
          dateRange.endDate,
          period,
          selectedBranch || undefined
        );

        const data = response.data;
        setOverview(data);
        setTrends(data.trends?.trends || []);

        const splitData = [];
        if (data.revenueSplit) {
          splitData.push({
            source: 'Appointments',
            amount: data.revenueSplit.appointment?.revenue || 0,
          });
          splitData.push({
            source: 'Orders',
            amount: data.revenueSplit.order?.revenue || 0,
          });
        }
        setSplit(splitData);
        setTopBranches(data.topBranches || []);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, selectedBranch, period]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaMoneyBillWave />
          Revenue Analytics
        </h1>
        <p className="text-white/80 mt-1">
          Track your pharmacy network's financial performance
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
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
                  className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none text-sm"
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
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none text-sm"
              />
              <span className="text-gray-400 hidden sm:block">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none text-sm"
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
              setPeriod('daily');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(overview?.revenueSplit?.total?.revenue || 0)}
          icon={FaMoneyBillWave}
          color="#1a365d"
          loading={loading}
        />
        <KPICard
          title="Orders Revenue"
          value={formatCurrency(overview?.revenueSplit?.order?.revenue || 0)}
          icon={FaChartLine}
          color="#38a169"
          loading={loading}
        />
        <KPICard
          title="Appointments Revenue"
          value={formatCurrency(overview?.revenueSplit?.appointment?.revenue || 0)}
          icon={FaCalendarAlt}
          color="#d69e2e"
          loading={loading}
        />
        <KPICard
          title="Avg Per Customer"
          value={formatCurrency(overview?.avgRevenuePerCustomer?.averageRevenue || 0)}
          icon={FaMoneyBillWave}
          color="#805ad5"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <SimpleBarChart
            data={(Array.isArray(trends) ? trends : []).map(t => {
              let label = 'N/A';
              if (period === 'daily') {
                label = t._id?.day && t._id?.month ? `${t._id.day}/${t._id.month}` : 'N/A';
              } else if (period === 'weekly') {
                label = t._id?.week ? `W${t._id.week}` : 'N/A';
              } else {
                label = t._id?.month ? `${t._id.month}/${t._id.year}` : 'N/A';
              }
              return {
                label: label,
                value: t.totalRevenue || 0,
              };
            })}
            loading={loading}
            title={`Revenue Trends (${period.charAt(0).toUpperCase() + period.slice(1)})`}
            period={period}
            setPeriod={setPeriod}
          />
        </div>

        {/* Revenue Split */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <SimplePieChart
            data={split.map(s => ({
              label: s.source || s.type,
              value: s.amount || s.revenue || 0,
            }))}
            loading={loading}
            title="Revenue Split"
          />
        </div>

        {/* Top Branches */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Performing Branches
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
          ) : topBranches.length > 0 ? (
            <div className="space-y-3">
              {topBranches.map((branch, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {branch.name || branch.branchName}
                    </p>
                    <p className="text-sm text-gray-500">{branch.code || ''}</p>
                  </div>
                  <p className="text-lg font-bold text-[#1a365d]">
                    {formatCurrency(branch.revenue || branch.totalRevenue || 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No branch data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
