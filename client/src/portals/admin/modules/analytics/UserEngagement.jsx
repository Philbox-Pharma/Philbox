// src/portals/admin/modules/analytics/UserEngagement.jsx
import { useState, useEffect } from 'react';
import {
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaFilter,
  FaCrown,
  FaUserMd,
  FaSyncAlt,
} from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

const { userEngagement: userEngagementApi } = adminApi;

export default function UserEngagement() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [customerStatus, setCustomerStatus] = useState({
    active: 0,
    inactive: 0,
  });
  const [topCustomers, setTopCustomers] = useState([]);
  const [doctorApplications, setDoctorApplications] = useState(null);
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
          limit: 5,
        };

        const overviewRes = await userEngagementApi
          .getOverview(filters)
          .catch(() => ({ data: null }));

        if (overviewRes.data) {
          const data = overviewRes.data;

          // Parse retention rate data
          const retentionData = data.retentionRate || {};

          // Parse customer status data
          const statusData = data.customerActivityStatus || {};

          // Parse new customers data (trends)
          const newCustomersData = data.newCustomersTrends || {};
          const totalNewCustomers = (newCustomersData.trends || []).reduce(
            (sum, item) => sum + (item.newCustomers || 0),
            0
          );

          // Parse doctor applications
          const doctorAppsData = data.doctorApplications?.summary || {};

          setOverview({
            totalCustomers: statusData.total || 0,
            newCustomers: totalNewCustomers,
            retentionRate: retentionData.retentionRate || 0,
          });

          setCustomerStatus({
            active: statusData.active || 0,
            inactive: (statusData.total || 0) - (statusData.active || 0),
          });

          setTopCustomers(data.topCustomers?.topCustomers || []);

          setDoctorApplications({
            pending: doctorAppsData.pending || 0,
            approved: doctorAppsData.approved || 0,
            rejected: doctorAppsData.rejected || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch engagement data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const total = customerStatus.active + customerStatus.inactive;
  const activePercent = total > 0 ? (customerStatus.active / total) * 100 : 0;

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

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <FaFilter className="text-gray-400" />
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <FaCalendarAlt className="text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38a169] outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38a169] outline-none"
            />
          </div>
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
        {/* Customer Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Activity Status
          </h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap">
              <div
                className="w-32 h-32 rounded-full relative"
                style={{
                  background: `conic-gradient(#38a169 0% ${activePercent}%, #e53e3e ${activePercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {total}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {customerStatus.active}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {customerStatus.inactive}
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
              {topCustomers.map((customer, index) => (
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
                      {customer.name || customer.fullName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.email || 'No email'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1a365d]">
                      {customer.ordersCount || customer.orders || 0}
                    </p>
                    <p className="text-xs text-gray-400">orders</p>
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
