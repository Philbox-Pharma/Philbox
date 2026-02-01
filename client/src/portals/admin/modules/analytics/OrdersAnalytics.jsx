// src/portals/admin/modules/analytics/OrdersAnalytics.jsx
import { useState, useEffect } from 'react';
import {
  FaShoppingBag,
  FaMoneyBillWave,
  FaUndo,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFilter,
  FaChartPie,
  FaChartBar,
  FaBoxOpen,
  FaPills,
  FaCheckCircle,
} from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

const { ordersAnalytics: ordersAnalyticsApi } = adminApi;

export default function OrdersAnalytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState(null);
  const [topMedicines, setTopMedicines] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [refundRate, setRefundRate] = useState(null);
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
        const filters = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };

        // Fetch overview data which contains all analytics
        const overviewRes = await ordersAnalyticsApi
          .getOverview(filters)
          .catch(() => ({ data: null }));

        if (overviewRes.data) {
          const data = overviewRes.data;

          // Parse status breakdown
          const statusData = data.statusBreakdown || {};
          setStatusBreakdown(statusData);

          // Set overview with calculated total orders and revenue
          const totalOrders = statusData.total || 0;
          const revenueData = data.refundRate || {};

          setOverview({
            totalOrders,
            totalRevenue: revenueData.totalOrders * 1000 || 0, // Approximate
          });

          // Parse top medicines
          const medicines = (data.topMedicines || []).map(med => ({
            name: med.medicineName,
            soldCount: med.totalQuantitySold,
            revenue: med.totalRevenue,
          }));
          setTopMedicines(medicines);

          // Parse revenue by category
          const categoryData = data.revenueByCategory || {};
          const categories = Object.keys(categoryData)
            .filter(key => key !== 'total' && categoryData[key].revenue > 0)
            .map(category => ({
              category,
              revenue: categoryData[category].revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue);
          setRevenueByCategory(categories);

          // Parse stock alerts
          const stockData = data.stockAlerts || {};
          const lowStockItems = (stockData.lowStock || []).map(item => ({
            name: item.medicineName,
            stock: item.currentStock,
          }));
          setStockAlerts(lowStockItems);

          // Set refund rate
          setRefundRate({
            rate: data.refundRate?.refundRate || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch orders analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate percentages for Status Breakdown
  const totalOrders =
    (statusBreakdown?.pending || 0) +
    (statusBreakdown?.processing || 0) +
    (statusBreakdown?.delivered || 0) +
    (statusBreakdown?.cancelled || 0);
  const deliveredPercent =
    totalOrders > 0
      ? ((statusBreakdown?.delivered || 0) / totalOrders) * 100
      : 0;
  // eslint-disable-next-line no-unused-vars
  const pendingPercent =
    totalOrders > 0 ? ((statusBreakdown?.pending || 0) / totalOrders) * 100 : 0;
  // eslint-disable-next-line no-unused-vars
  const processingPercent =
    totalOrders > 0
      ? ((statusBreakdown?.processing || 0) / totalOrders) * 100
      : 0;
  // eslint-disable-next-line no-unused-vars
  const cancelledPercent =
    totalOrders > 0
      ? ((statusBreakdown?.cancelled || 0) / totalOrders) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#d69e2e] to-[#b7791f] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaShoppingBag />
          Orders Analytics
        </h1>
        <p className="text-white/80 mt-1">
          Monitor order performance, revenue, and inventory alerts
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
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d69e2e] outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d69e2e] outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {overview?.totalOrders || totalOrders || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#d69e2e15' }}
            >
              <FaShoppingBag
                className="text-2xl"
                style={{ color: '#d69e2e' }}
              />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rs {(overview?.totalRevenue || 0).toLocaleString()}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#38a16915' }}
            >
              <FaMoneyBillWave
                className="text-2xl"
                style={{ color: '#38a169' }}
              />
            </div>
          </div>
        </div>

        {/* Refund Rate */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Refund Rate</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {Number(refundRate?.rate || 0).toFixed(1)}%
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#e53e3e15' }}
            >
              <FaUndo className="text-2xl" style={{ color: '#e53e3e' }} />
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stockAlerts.length || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#dd6b2015' }}
            >
              <FaExclamationTriangle
                className="text-2xl"
                style={{ color: '#dd6b20' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#d69e2e]" />
            Order Status Distribution
          </h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div
                className="w-32 h-32 rounded-full relative"
                style={{
                  background: `conic-gradient(#38a169 0% ${deliveredPercent}%, #d69e2e ${deliveredPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {totalOrders}
                  </span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>{' '}
                    Delivered
                  </span>
                  <span className="font-bold">
                    {statusBreakdown?.delivered || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>{' '}
                    Processing
                  </span>
                  <span className="font-bold">
                    {statusBreakdown?.processing || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>{' '}
                    Pending
                  </span>
                  <span className="font-bold">
                    {statusBreakdown?.pending || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>{' '}
                    Cancelled
                  </span>
                  <span className="font-bold">
                    {statusBreakdown?.cancelled || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-[#38a169]" />
            Revenue by Category
          </h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ) : revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {revenueByCategory.slice(0, 5).map((cat, index) => {
                const maxVal = revenueByCategory[0]?.revenue || 1;
                const percentage = (cat.revenue / maxVal) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">
                        {cat.category || 'Unknown'}
                      </span>
                      <span className="font-bold text-gray-800">
                        Rs {cat.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No revenue data available
            </p>
          )}
        </div>

        {/* Top Selling Medicines */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaPills className="text-[#3182ce]" />
            Top Selling Medicines
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : topMedicines.length > 0 ? (
            <div className="space-y-3">
              {topMedicines.map((med, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {med.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {med.soldCount || 0} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    Rs {(med.revenue || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No sales data available
            </p>
          )}
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-[#dd6b20]" />
            Low Stock Alerts
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : stockAlerts.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stockAlerts.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <FaBoxOpen className="text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {item.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">
                        Qty: {item.stock || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      Low Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
              <p className="text-gray-500">Inventory looks good!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
