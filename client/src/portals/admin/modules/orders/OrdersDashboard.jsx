/* eslint-disable react-hooks/exhaustive-deps */
// src/portals/admin/modules/orders/OrdersDashboard.jsx
import { useState, useEffect } from 'react';
import {
  FaShoppingCart,
  FaBoxes,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendar,
  FaFilter,
  FaSpinner,
  FaCodeBranch,
  FaSync,
} from 'react-icons/fa';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { branchesService } from '../../../../core/api/admin/branches.service';
import { ordersAnalyticsService } from '../../../../core/api/admin/ordersAnalytics.service';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function OrdersDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState(null);
  const [topMedicines, setTopMedicines] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState(null);
  const [refundRate, setRefundRate] = useState(null);
  const [branches, setBranches] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'daily',
    branchId: '',
  });

  // Fetch branches for filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchesService.getAll(1, 100);
        if (response.status === 200 || response.data) {
          setBranches(response.data?.branches || []);
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        trendsRes,
        statusRes,
        topMedRes,
        stockRes,
        revCatRes,
        refundRes,
      ] = await Promise.all([
        ordersAnalyticsService.getOverview(filters),
        ordersAnalyticsService.getTrends(filters),
        ordersAnalyticsService.getStatusBreakdown(filters),
        ordersAnalyticsService.getTopMedicines({ ...filters, limit: 10 }),
        ordersAnalyticsService.getStockAlerts(filters),
        ordersAnalyticsService.getRevenueByCategory(filters),
        ordersAnalyticsService.getRefundRate(filters),
      ]);

      if (overviewRes.status === 200) setOverview(overviewRes.data);
      if (trendsRes.status === 200) setTrends(trendsRes.data);
      if (statusRes.status === 200) setStatusBreakdown(statusRes.data);
      if (topMedRes.status === 200)
        setTopMedicines(topMedRes.data?.topMedicines || []);
      if (stockRes.status === 200) setStockAlerts(stockRes.data?.alerts || []);
      if (revCatRes.status === 200) setRevenueByCategory(revCatRes.data);
      if (refundRes.status === 200) setRefundRate(refundRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Chart configurations
  const trendsChartData = trends
    ? {
        labels: trends.trends?.map(t => t.date || t._id) || [],
        datasets: [
          {
            label: 'Total Orders',
            data: trends.trends?.map(t => t.totalOrders) || [],
            borderColor: 'rgb(26, 54, 93)',
            backgroundColor: 'rgba(26, 54, 93, 0.1)',
            tension: 0.4,
          },
        ],
      }
    : null;

  const statusChartData = statusBreakdown
    ? {
        labels: Object.keys(statusBreakdown.statusBreakdown || {}),
        datasets: [
          {
            data: Object.values(statusBreakdown.statusBreakdown || {}),
            backgroundColor: [
              'rgba(255, 206, 86, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
            ],
          },
        ],
      }
    : null;

  const revenueByCategoryData = revenueByCategory
    ? {
        labels: revenueByCategory.categoryRevenue?.map(c => c.category) || [],
        datasets: [
          {
            label: 'Revenue (PKR)',
            data:
              revenueByCategory.categoryRevenue?.map(c => c.totalRevenue) || [],
            backgroundColor: 'rgba(26, 54, 93, 0.7)',
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-4xl text-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Analytics</h1>
          <p className="text-gray-600 mt-1">
            Monitor orders, inventory & sales performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-[#1a365d]" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendar className="inline mr-1" /> Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendar className="inline mr-1" /> End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={filters.period}
              onChange={e => handleFilterChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCodeBranch className="inline mr-1" /> Branch
            </label>
            <select
              value={filters.branchId}
              onChange={e => handleFilterChange('branchId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name || branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaShoppingCart className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              Total
            </span>
          </div>
          <h3 className="text-3xl font-bold">{overview?.totalOrders || 0}</h3>
          <p className="text-blue-100 text-sm mt-1">Total Orders</p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              Revenue
            </span>
          </div>
          <h3 className="text-3xl font-bold">
            PKR {(overview?.totalRevenue || 0).toLocaleString()}
          </h3>
          <p className="text-green-100 text-sm mt-1">Total Revenue</p>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaExclamationTriangle className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              Alerts
            </span>
          </div>
          <h3 className="text-3xl font-bold">{stockAlerts.length}</h3>
          <p className="text-orange-100 text-sm mt-1">Stock Alerts</p>
        </div>

        <div className="bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaBoxes className="text-3xl opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              Rate
            </span>
          </div>
          <h3 className="text-3xl font-bold">
            {refundRate?.refundRate || '0%'}
          </h3>
          <p className="text-red-100 text-sm mt-1">Refund Rate</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trends */}
        {trendsChartData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-[#1a365d]" />
              Orders Trend
            </h3>
            <Line
              data={trendsChartData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </div>
        )}

        {/* Status Breakdown */}
        {statusChartData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-[#1a365d]" />
              Order Status Distribution
            </h3>
            <Pie
              data={statusChartData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        {revenueByCategoryData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Revenue by Category
            </h3>
            <Bar
              data={revenueByCategoryData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </div>
        )}

        {/* Top Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBoxes className="text-[#1a365d]" />
            Top Selling Medicines
          </h3>
          <div className="space-y-3">
            {topMedicines.slice(0, 5).map((med, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{med.medicine}</p>
                  <p className="text-sm text-gray-500">
                    Sold: {med.totalQuantity} units
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1a365d]">
                    PKR {med.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {med.totalOrders} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <FaExclamationTriangle />
            Stock Alerts ({stockAlerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {alert.medicineName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Branch: {alert.branchName}
                    </p>
                    <p className="text-sm text-orange-600 font-medium mt-2">
                      Stock: {alert.currentStock} units
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded font-medium">
                    {alert.alertType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
