import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTasks,
  FaExclamationTriangle,
  FaBoxOpen,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import { salespersonDashboardApi } from '../../../../core/api/salesperson/dashboard.service';

export default function SalespersonDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: {
      pendingTasks: 0,
      lowStockAlerts: 0,
      recentOrders: 0,
    },
    activities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await salespersonDashboardApi.getDashboard();
        if (res?.data?.data?.data) {
          const dashboardData = res.data.data.data;
          setData({
            stats: {
              pendingTasks: dashboardData.stats?.pendingTasksCount || 0,
              lowStockAlerts: dashboardData.stats?.lowStockAlertsCount || 0,
              recentOrders: dashboardData.stats?.ordersToProcessCount || 0,
            },
            activities: dashboardData.recentActivity || [],
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn py-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.fullName || 'Salesperson'}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening in your branch today.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2 font-medium shadow-inner">
          <FaClock className="text-blue-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors z-0"></div>
          <div className="z-10 relative">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Tasks</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{data.stats.pendingTasks}</h3>
          </div>
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center z-10 relative shadow-sm border border-orange-200 group-hover:scale-110 transition-transform">
            <FaTasks size={24} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors z-0"></div>
          <div className="z-10 relative">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Low Stock Alerts</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">{data.stats.lowStockAlerts}</h3>
          </div>
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center z-10 relative shadow-sm border border-red-200 group-hover:scale-110 transition-transform">
            <FaExclamationTriangle size={24} className="text-red-500 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors z-0"></div>
          <div className="z-10 relative">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Orders to Process</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{data.stats.recentOrders}</h3>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center z-10 relative shadow-sm border border-blue-200 group-hover:scale-110 transition-transform">
            <FaBoxOpen size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Buttons */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-full -z-0"></div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 relative z-10 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span> Quick Actions
            </h2>
            <div className="space-y-3 relative z-10">
              <Link
                to="/salesperson/alerts"
                className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl hover:bg-red-100 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                    <FaExclamationTriangle size={16} className="text-red-500" />
                  </div>
                  <span className="font-semibold text-sm">View Stock Alerts</span>
                </div>
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/salesperson/tasks"
                className="w-full flex items-center justify-between p-4 bg-orange-50 border border-orange-100 text-orange-700 rounded-xl hover:bg-orange-100 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                    <FaTasks size={16} className="text-orange-500" />
                  </div>
                  <span className="font-semibold text-sm">Manage My Tasks</span>
                </div>
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/salesperson/orders"
                className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl hover:bg-blue-100 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                    <FaBoxOpen size={16} className="text-blue-500" />
                  </div>
                  <span className="font-semibold text-sm">Process Pending Orders</span>
                </div>
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span> Recent Activity
              </h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto min-h-[300px] bg-gray-50/30">
              {data.activities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <FaCheckCircle className="text-gray-300 text-2xl" />
                  </div>
                  <p className="font-medium text-gray-700">No recent activity</p>
                  <p className="text-xs mt-1">Activities will appear here as you work.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent ml-2">
                  {data.activities.map((activity, index) => (
                    <div key={index} className="relative flex items-start gap-4 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-100 text-blue-500 shadow-sm shrink-0 relative z-10 mt-1">
                        <FaCheckCircle size={10} />
                      </div>
                      <div className="flex-1 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-800">{activity.description || 'Task Completed'}</p>
                        <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block tracking-wider">
                          {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                          {', '} 
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
