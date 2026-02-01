// src/portals/admin/modules/dashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  FaCodeBranch,
  FaUsers,
  FaUserTie,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaPlus,
  FaClipboardList,
  FaBoxes,
  FaUserMd,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaShoppingCart,
  FaMoneyBillWave,
} from 'react-icons/fa';
import {
  branchApi,
  staffApi,
  doctorApi,
  ordersAnalyticsApi,
} from '../../../../core/api/admin/adminApi';

// Stats Card Component
const StatCard = ({
  icon: Icon, // eslint-disable-line no-unused-vars
  label,
  value,
  trend,
  trendValue,
  color,
  loading,
}) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
        ) : (
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
        )}
        {trend && !loading && (
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <FaArrowUp />
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
  </Motion.div>
);

// Quick Action Button
const QuickAction = ({
  icon: Icon, // eslint-disable-line no-unused-vars
  label,
  to,
  color,
}) => (
  <Link to={to}>
    <Motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="text-xl" style={{ color }} />
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </Motion.div>
  </Link>
);

// Branch Card
const BranchCard = ({ branch }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-gray-800">{branch.name}</h4>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          branch.status === 'Active'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {branch.status}
      </span>
    </div>
    <p className="text-gray-500 text-sm">{branch.code}</p>
    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
      <span className="text-gray-400 text-sm">
        {branch.phone || 'No phone'}
      </span>
      <Link
        to={`/admin/branches/${branch._id}`}
        className="text-[#1a365d] hover:text-[#d69e2e] text-sm font-medium flex items-center gap-1"
      >
        <FaEye /> View
      </Link>
    </div>
  </Motion.div>
);

// Activity Item
const ActivityItem = ({
  icon: Icon, // eslint-disable-line no-unused-vars
  text,
  time,
  status,
}) => {
  const statusColors = {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    pending: 'text-blue-600 bg-blue-100',
    error: 'text-red-600 bg-red-100',
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[status]}`}
      >
        <Icon className="text-lg" />
      </div>
      <div className="flex-1">
        <p className="text-gray-700">{text}</p>
        <p className="text-gray-400 text-sm mt-1">{time}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { admin } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    branches: { total: 0, active: 0, inactive: 0 },
    admins: { total: 0 },
    salespersons: { total: 0 },
    doctors: { total: 0, pending: 0 },
    orders: { total: 0, todayOrders: 0, revenue: 0 },
  });
  const [branches, setBranches] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all dashboard data in parallel
        const [
          branchStatsResponse,
          branchesResponse,
          adminsResponse,
          salespersonsResponse,
          doctorApplicationsResponse,
          doctorsListResponse,
          ordersOverviewResponse,
        ] = await Promise.all([
          branchApi.getStatistics().catch(() => ({ data: null })),
          branchApi.getAll(1, 6).catch(() => ({ data: { branches: [] } })),
          staffApi
            .getAdmins(1, 1)
            .catch(() => ({ data: { pagination: { total: 0 } } })),
          staffApi
            .getSalespersons(1, 1)
            .catch(() => ({ data: { pagination: { total: 0 } } })),
          doctorApi
            .getApplications({ status: 'pending', limit: 1 })
            .catch(() => ({ data: { pagination: { total: 0 } } })),
          doctorApi
            .getAllDoctors({ limit: 1 })
            .catch(() => ({ data: { pagination: { total: 0 } } })),
          ordersAnalyticsApi.getOverview({}).catch(() => ({ data: null })),
        ]);

        setStats({
          branches: branchStatsResponse.data || {
            total: 0,
            active: 0,
            inactive: 0,
          },
          admins: {
            total:
              adminsResponse.data?.pagination?.total ||
              adminsResponse.data?.total ||
              0,
          },
          salespersons: {
            total:
              salespersonsResponse.data?.pagination?.total ||
              salespersonsResponse.data?.total ||
              0,
          },
          doctors: {
            total: doctorsListResponse.data?.pagination?.total || 0,
            pending: doctorApplicationsResponse.data?.pagination?.total || 0,
          },
          orders: {
            total: ordersOverviewResponse.data?.totalOrders || 0,
            todayOrders: ordersOverviewResponse.data?.todayOrders || 0,
            revenue: ordersOverviewResponse.data?.totalRevenue || 0,
          },
        });

        setBranches(branchesResponse.data?.branches || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');

        // Fallback mock data
        setStats({
          branches: { total: 0, active: 0, inactive: 0 },
          admins: { total: 0 },
          salespersons: { total: 0 },
          doctors: { total: 0, pending: 0 },
          orders: { total: 0, todayOrders: 0, revenue: 0 },
        });
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Quick actions
  const quickActions = [
    {
      icon: FaPlus,
      label: 'Add New Branch',
      to: '/admin/branches/add',
      color: '#1a365d',
    },
    {
      icon: FaUserTie,
      label: 'Add Salesperson',
      to: '/admin/staff/salespersons/add',
      color: '#d69e2e',
    },
    {
      icon: FaClipboardList,
      label: 'View Orders',
      to: '/admin/orders',
      color: '#38a169',
    },
    {
      icon: FaBoxes,
      label: 'Manage Inventory',
      to: '/admin/inventory',
      color: '#805ad5',
    },
  ];

  // Recent activities (mock)
  const activities = [
    {
      icon: FaCodeBranch,
      text: 'New branch "Faisalabad" added',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      icon: FaUserTie,
      text: 'Salesperson assigned to Lahore Branch',
      time: '1 hour ago',
      status: 'success',
    },
    {
      icon: FaExclamationTriangle,
      text: 'Low stock alert for Panadol',
      time: '2 hours ago',
      status: 'warning',
    },
    {
      icon: FaClock,
      text: 'Order #ORD-2025-001 pending',
      time: '3 hours ago',
      status: 'pending',
    },
    {
      icon: FaCheckCircle,
      text: 'Doctor application approved',
      time: '5 hours ago',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-[#1a365d] to-[#2c5282] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, {admin?.name || 'Admin'}! 👋
        </h1>
        <p className="text-white/80 mt-2">
          Here's what's happening with your pharmacy network today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-yellow-700">
          <FaExclamationTriangle />
          <span>{error} - Showing cached data</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={FaCodeBranch}
          label="Total Branches"
          value={stats.branches.total}
          color="#1a365d"
          loading={loading}
        />
        <StatCard
          icon={FaCheckCircle}
          label="Active Branches"
          value={stats.branches.active}
          color="#38a169"
          loading={loading}
        />
        <StatCard
          icon={FaUsers}
          label="Total Admins"
          value={stats.admins.total}
          color="#805ad5"
          loading={loading}
        />
        <StatCard
          icon={FaUserTie}
          label="Salespersons"
          value={stats.salespersons.total}
          color="#d69e2e"
          loading={loading}
        />
        <StatCard
          icon={FaShoppingCart}
          label="Orders Today"
          value={stats.orders.todayOrders}
          color="#3182ce"
          loading={loading}
        />
        <StatCard
          icon={FaMoneyBillWave}
          label="Total Revenue"
          value={`Rs ${(stats.orders.revenue / 1000).toFixed(0)}K`}
          color="#38a169"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Branches */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Branches
              </h2>
              <Link
                to="/admin/branches"
                className="text-[#1a365d] hover:text-[#d69e2e] text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 animate-pulse h-32 rounded-xl"
                  ></div>
                ))
              ) : branches.length > 0 ? (
                branches
                  .slice(0, 4)
                  .map(branch => (
                    <BranchCard key={branch._id} branch={branch} />
                  ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No branches found.
                  <Link
                    to="/admin/branches/add"
                    className="text-[#1a365d] ml-1"
                  >
                    Add your first branch
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activity
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {activities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaUserMd className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Doctors Pending</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {loading ? '...' : stats.doctors.pending}
              </h3>
            </div>
          </div>
          <Link
            to="/admin/doctors/applications"
            className="mt-4 block text-center py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
          >
            Review Applications
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaClipboardList className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {loading ? '...' : stats.orders.total}
              </h3>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="mt-4 block text-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            View All Orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <FaUserMd className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Registered Doctors</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {loading ? '...' : stats.doctors.total}
              </h3>
            </div>
          </div>
          <Link
            to="/admin/doctors"
            className="mt-4 block text-center py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
          >
            View Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
