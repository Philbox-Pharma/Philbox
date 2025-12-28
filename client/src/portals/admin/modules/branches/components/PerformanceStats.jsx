import { motion as _motion } from 'framer-motion';
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaUserCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, subValue, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color.bg} ${color.text}`}>
        <Icon className="text-xl" />
      </div>
    </div>
  </motion.div>
);

export default function PerformanceStats({ data }) {
  if (!data) return null;

  // Destructure exactly matching backend response
  const {
    financial_summary = {},
    orders = {},
    customer_engagement = {},
    complaints = {},
  } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenue */}
      <StatCard
        label="Total Revenue"
        value={`Rs. ${(financial_summary.net_revenue || 0).toLocaleString()}`}
        subValue={`Daily Avg: Rs. ${Math.round(financial_summary.average_daily_revenue || 0).toLocaleString()}`}
        icon={FaMoneyBillWave}
        color={{ bg: 'bg-green-100', text: 'text-green-600' }}
      />

      {/* Orders */}
      <StatCard
        label="Orders Completed"
        value={orders.completed || 0}
        subValue={`${orders.completion_rate || 0}% Success Rate`}
        icon={FaShoppingCart}
        color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
      />

      {/* Customers */}
      <StatCard
        label="New Customers"
        value={customer_engagement.new_customers || 0}
        subValue={`${customer_engagement.average_rating || 0} ⭐ Avg Rating`}
        icon={FaUserCheck}
        color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
      />

      {/* Complaints */}
      <StatCard
        label="Pending Complaints"
        value={complaints.pending || 0}
        subValue={`${complaints.resolution_rate || 0}% Resolved`}
        icon={FaExclamationTriangle}
        color={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
      />
    </div>
  );
}
