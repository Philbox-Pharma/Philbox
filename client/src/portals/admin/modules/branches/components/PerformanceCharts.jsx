// src/portals/admin/modules/branches/components/PerformanceCharts.jsx
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function PerformanceCharts({ data }) {
  // Agar backend data bhej raha hai to use karo, warna empty array (no fake data)
  const chartData = data?.daily_breakdown || [];

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-md border border-gray-100 text-center mt-6">
        <p className="text-gray-500">
          No daily data available from backend for graphs.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Revenue Trend
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a365d" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={val => `${val / 1000}k`}
              />
              <Tooltip
                formatter={val => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1a365d"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Orders Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Orders Volume
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar
                dataKey="orders"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
