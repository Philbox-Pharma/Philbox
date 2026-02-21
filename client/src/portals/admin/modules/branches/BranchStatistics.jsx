// src/portals/admin/modules/branches/BranchStatistics.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FaCodeBranch,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaSpinner,
  FaChartLine,
  FaMoneyBillWave,
  FaUsers,
  FaUndo,
  FaCalendarAlt,
  FaSearch,
  FaCreditCard,
  FaBuilding,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { branchApi, revenueApi } from '../../../../core/api/admin/adminApi';

// Chart Colors
const COLORS = {
  primary: '#1a365d',
  secondary: '#d69e2e',
  green: '#38a169',
  blue: '#3182ce',
  purple: '#805ad5',
  orange: '#dd6b20',
  red: '#e53e3e',
  gray: '#718096',
};

const PIE_COLORS = ['#1a365d', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];

export default function BranchStatistics() {
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState(null);

  // Branch Stats
  const [branchStats, setBranchStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [branches, setBranches] = useState([]);

  // Revenue Analytics
  const [trends, setTrends] = useState([]);
  const [revenueSplit, setRevenueSplit] = useState(null);
  const [topBranches, setTopBranches] = useState([]);
  const [refundStats, setRefundStats] = useState(null);
  const [avgRevenue, setAvgRevenue] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Date Filter (Default: Last 30 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Period for trends
  const [period, setPeriod] = useState('daily');

  // Initial Load: Branch Data
  useEffect(() => {
    fetchBranchData();
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBranchData = async () => {
    try {
      const response = await branchApi.getAll(1, 1000);
      if (response.success || response.status === 200) {
        const allBranches = response.data?.branches || [];
        setBranches(allBranches);
        setBranchStats({
          total: allBranches.length,
          active: allBranches.filter(b => b.status === 'Active').length,
          inactive: allBranches.filter(b => b.status === 'Inactive').length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError('Failed to load branch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    setRevenueLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      // Fetch all revenue data in parallel
      const [trendsRes, splitRes, topRes, refundsRes, avgRes, paymentRes] =
        await Promise.all([
          revenueApi.getTrends(startDate, endDate, period),
          revenueApi.getSplit(startDate, endDate),
          revenueApi.getTopBranches(startDate, endDate, 5),
          revenueApi.getRefunds(startDate, endDate),
          revenueApi.getAvgPerCustomer(startDate, endDate),
          revenueApi.getPaymentMethods(startDate, endDate),
        ]);

      // Process Trends
      if (trendsRes.status === 200) {
        const formattedTrends = (trendsRes.data?.trends || []).map(t => ({
          date: formatTrendDate(t._id, period),
          total: t.totalRevenue || 0,
          appointments: t.appointmentRevenue || 0,
          orders: t.orderRevenue || 0,
        }));
        setTrends(formattedTrends);
      }

      // Process Split
      if (splitRes.status === 200) {
        setRevenueSplit(splitRes.data);
      }

      // Process Top Branches
      if (topRes.status === 200) {
        setTopBranches(topRes.data || []);
      }

      // Process Refunds
      if (refundsRes.status === 200) {
        setRefundStats(refundsRes.data);
      }

      // Process Avg Revenue
      if (avgRes.status === 200) {
        setAvgRevenue(avgRes.data);
      }

      // Process Payment Methods
      if (paymentRes.status === 200) {
        const paymentData = paymentRes.data;
        const formatted = Object.keys(paymentData)
          .filter(key => key !== 'total')
          .map(key => ({
            name: formatPaymentName(key),
            value: paymentData[key].revenue || 0,
            count: paymentData[key].count || 0,
          }));
        setPaymentMethods(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Helper: Format trend date based on period
  const formatTrendDate = (id, period) => {
    if (period === 'daily') {
      return `${id.day}/${id.month}`;
    } else if (period === 'weekly') {
      return `W${id.week}`;
    } else {
      return `${id.month}/${id.year}`;
    }
  };

  // Helper: Format payment method name
  const formatPaymentName = key => {
    const names = {
      'Stripe-Card': 'Card (Stripe)',
      'JazzCash-Wallet': 'JazzCash',
      'EasyPaisa-Wallet': 'EasyPaisa',
    };
    return names[key] || key;
  };

  // Handle Date Filter Apply
  const handleApplyFilter = () => {
    fetchRevenueData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-3xl text-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/branches" className="p-2 hover:bg-gray-100 rounded-lg">
          <FaArrowLeft />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Branch Statistics & Revenue Analytics
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 text-red-700 rounded-lg">{error}</div>
      )}

      {/* ============ BRANCH STATS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FaCodeBranch}
          label="Total Branches"
          value={branchStats.total}
          color="text-[#1a365d]"
          bg="bg-[#1a365d]/10"
        />
        <StatCard
          icon={FaCheckCircle}
          label="Active Branches"
          value={branchStats.active}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          icon={FaTimesCircle}
          label="Inactive Branches"
          value={branchStats.inactive}
          color="text-gray-500"
          bg="bg-gray-100"
        />
      </div>

      {/* Branch Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchStatusList
          title="Active Branches"
          branches={branches.filter(b => b.status === 'Active')}
          icon={FaCheckCircle}
          color="green"
        />
        <BranchStatusList
          title="Inactive Branches"
          branches={branches.filter(b => b.status === 'Inactive')}
          icon={FaTimesCircle}
          color="gray"
        />
      </div>

      {/* ============ REVENUE ANALYTICS ============ */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-[#1a365d]" />
            Revenue Analytics
          </h2>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
                className="pl-8 pr-2 py-1.5 text-sm bg-transparent outline-none border-r border-gray-200"
              />
            </div>
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-2 py-1.5 text-sm bg-transparent outline-none"
            />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="px-2 py-1.5 text-sm border-l border-gray-200 outline-none bg-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={handleApplyFilter}
              disabled={revenueLoading}
              className="p-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2c5282] disabled:opacity-50"
            >
              {revenueLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaSearch className="text-xs" />
              )}
            </button>
          </div>
        </div>

        {revenueLoading ? (
          <div className="flex justify-center p-12">
            <FaSpinner className="animate-spin text-2xl text-[#1a365d]" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <KPICard
                icon={FaMoneyBillWave}
                label="Total Revenue"
                value={`Rs. ${(revenueSplit?.total?.revenue || 0).toLocaleString()}`}
                subValue={`${revenueSplit?.total?.count || 0} transactions`}
                color="green"
              />
              <KPICard
                icon={FaUsers}
                label="Avg. Per Customer"
                value={`Rs. ${Math.round(avgRevenue?.averageRevenue || 0).toLocaleString()}`}
                subValue={`${avgRevenue?.totalCustomers || 0} customers`}
                color="blue"
              />
              <KPICard
                icon={FaUndo}
                label="Total Refunds"
                value={`Rs. ${(refundStats?.total?.amount || 0).toLocaleString()}`}
                subValue={`${refundStats?.total?.count || 0} refunds`}
                color="red"
              />
              <KPICard
                icon={FaCreditCard}
                label="Transactions"
                value={revenueSplit?.total?.count || 0}
                subValue="All payments"
                color="purple"
              />
            </div>

            {/* Charts Row 1: Trends + Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Revenue Trends - Line Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue Trends
                </h3>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={value => `Rs. ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="appointments"
                        name="Appointments"
                        stroke={COLORS.green}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke={COLORS.secondary}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No trend data available" />
                )}
              </div>

              {/* Revenue Split - Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue Split
                </h3>
                {revenueSplit?.appointment || revenueSplit?.order ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Appointments',
                            value: revenueSplit?.appointment?.revenue || 0,
                          },
                          {
                            name: 'Orders',
                            value: revenueSplit?.order?.revenue || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.secondary} />
                      </Pie>
                      <Tooltip
                        formatter={value => `Rs. ${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No split data" />
                )}
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.primary }}
                    ></div>
                    <span className="text-sm text-gray-600">Appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.secondary }}
                    ></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 2: Top Branches + Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Branches - Bar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBuilding className="text-[#1a365d]" />
                  Top Branches by Revenue
                </h3>
                {topBranches.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topBranches} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="branchName"
                        tick={{ fontSize: 11 }}
                        width={100}
                      />
                      <Tooltip
                        formatter={value => `Rs. ${value.toLocaleString()}`}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        name="Revenue"
                        fill={COLORS.primary}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No branch data" />
                )}
              </div>

              {/* Payment Methods - Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-[#1a365d]" />
                  Payment Methods
                </h3>
                {paymentMethods.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={value => `Rs. ${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No payment data" />
                )}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {paymentMethods.map((pm, i) => (
                    <div key={pm.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm text-gray-600">{pm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Refund Stats - Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUndo className="text-red-500" />
                Refund Statistics
              </h3>
              {refundStats ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: 'Appointments',
                        amount: refundStats?.appointment?.amount || 0,
                        count: refundStats?.appointment?.count || 0,
                      },
                      {
                        name: 'Orders',
                        amount: refundStats?.order?.amount || 0,
                        count: refundStats?.order?.count || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === 'amount'
                          ? `Rs. ${value.toLocaleString()}`
                          : value
                      }
                    />
                    <Bar
                      dataKey="amount"
                      name="Refund Amount"
                      fill={COLORS.red}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No refund data" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ SUB COMPONENTS ============

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: IconComponent, label, value, color, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4"
  >
    <div
      className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}
    >
      <IconComponent className={`text-2xl ${color}`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
  </motion.div>
);

// eslint-disable-next-line no-unused-vars
const KPICard = ({ icon: IconComponent, label, value, subValue, color }) => {
  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}
        >
          <IconComponent className={`text-lg ${c.text}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <h4 className="text-lg font-bold text-gray-800">{value}</h4>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// eslint-disable-next-line no-unused-vars
const BranchStatusList = ({ title, branches, icon: IconComponent, color }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
  >
    <div className={`p-4 border-b bg-gray-50 flex items-center gap-2`}>
      <IconComponent className={`text-${color}-600`} />
      <h2 className="font-semibold text-gray-800">{title}</h2>
      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full ml-auto">
        {branches.length}
      </span>
    </div>
    <div className="p-4 max-h-80 overflow-y-auto space-y-3">
      {branches.length > 0 ? (
        branches.map(b => (
          <Link
            key={b._id}
            to={`/admin/branches/${b._id}`}
            className={`flex justify-between p-3 rounded-lg border border-transparent hover:border-${color}-200 hover:bg-${color}-50 transition-all`}
          >
            <div>
              <p className="font-medium text-gray-800">{b.name}</p>
              <p className="text-xs text-gray-500">{b.code}</p>
            </div>
            <span
              className={`text-xs self-center px-2 py-1 rounded bg-${color}-100 text-${color}-700`}
            >
              {b.status}
            </span>
          </Link>
        ))
      ) : (
        <p className="text-center text-gray-400 py-4">No branches found</p>
      )}
    </div>
  </motion.div>
);

const EmptyChart = ({ message }) => (
  <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
    {message}
  </div>
);
