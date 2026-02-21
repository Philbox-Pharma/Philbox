// src/portals/admin/modules/analytics/RevenueAnalytics.jsx
import { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { revenueApi } from '../../../../core/api/admin/adminApi';

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

// Simple Bar Chart Component
const SimpleBarChart = ({ data, loading, title }) => {
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-end gap-3 h-48">
        {data?.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-linear-to-t from-[#1a365d] to-[#3182ce] rounded-t transition-all duration-500 hover:opacity-80"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '20px',
              }}
            ></div>
            <p className="text-xs text-gray-500 mt-2 truncate w-full text-center">
              {item.label}
            </p>
            <p className="text-xs font-medium text-gray-700">
              Rs {(item.value / 1000).toFixed(0)}K
            </p>
          </div>
        ))}
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
        <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto"></div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#1a365d', '#d69e2e', '#38a169', '#e53e3e', '#805ad5'];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
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
        <div className="flex-1 space-y-2">
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
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [split, setSplit] = useState([]);
  const [topBranches, setTopBranches] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, trendsRes, splitRes, topBranchesRes] =
          await Promise.all([
            revenueApi
              .getOverview(dateRange.startDate, dateRange.endDate)
              .catch(() => ({ data: null })),
            revenueApi
              .getTrends(dateRange.startDate, dateRange.endDate, 'daily')
              .catch(() => ({ data: [] })),
            revenueApi
              .getSplit(dateRange.startDate, dateRange.endDate)
              .catch(() => ({ data: [] })),
            revenueApi
              .getTopBranches(dateRange.startDate, dateRange.endDate, 5)
              .catch(() => ({ data: [] })),
          ]);

        setOverview(overviewRes.data);
        setTrends(trendsRes.data?.trends || []);
        setSplit(splitRes.data?.split || []);
        setTopBranches(topBranchesRes.data?.branches || []);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-6 text-white">
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
        <div className="flex flex-wrap items-center gap-4">
          <FaFilter className="text-gray-400" />
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a365d] outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`Rs ${((overview?.totalRevenue || 0) / 1000).toFixed(0)}K`}
          icon={FaMoneyBillWave}
          color="#1a365d"
          loading={loading}
        />
        <KPICard
          title="Orders Revenue"
          value={`Rs ${((overview?.ordersRevenue || 0) / 1000).toFixed(0)}K`}
          icon={FaChartLine}
          color="#38a169"
          loading={loading}
        />
        <KPICard
          title="Appointments Revenue"
          value={`Rs ${((overview?.appointmentsRevenue || 0) / 1000).toFixed(0)}K`}
          icon={FaCalendarAlt}
          color="#d69e2e"
          loading={loading}
        />
        <KPICard
          title="Avg Per Customer"
          value={`Rs ${(overview?.avgPerCustomer || 0).toFixed(0)}`}
          icon={FaMoneyBillWave}
          color="#805ad5"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <SimpleBarChart
            data={trends.slice(-7).map(t => ({
              label: t.date?.split('-').slice(1).join('/'),
              value: t.revenue || 0,
            }))}
            loading={loading}
            title="Revenue Trends (Last 7 Days)"
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
                    Rs{' '}
                    {(
                      (branch.revenue || branch.totalRevenue || 0) / 1000
                    ).toFixed(0)}
                    K
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
