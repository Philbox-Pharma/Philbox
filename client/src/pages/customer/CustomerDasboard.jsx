import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import useAuthStore from '../../stores/auth.store';
import {
  FaPrescription,
  FaShoppingCart,
  FaUserMd,
  FaHistory,
} from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useAuthStore();

  const quickActions = [
    {
      icon: <FaUserMd />,
      label: 'Find a Doctor',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <FaPrescription />,
      label: 'My Prescriptions',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <FaShoppingCart />,
      label: 'Order Medicine',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <FaHistory />,
      label: 'Order History',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <MainLayout showNav={false} showAuthButtons={true} showFooter={false}>
      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Welcome Section */}
          <div className="bg-linear-to-r from-[#003399] to-[#4FA64F] text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.fullName || 'Customer'}!
            </h1>
            <p className="text-white/90">
              Your health is our priority. What can we help you with today?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`bg-linear-to-br ${action.color} text-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <div className="font-semibold">{action.label}</div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-[#003399] mb-4">
                Upcoming Appointments
              </h2>
              <div className="space-y-3">
                {[
                  {
                    doctor: 'Dr. Ahmed Khan',
                    specialty: 'Cardiology',
                    time: 'Tomorrow, 10:00 AM',
                  },
                  {
                    doctor: 'Dr. Sara Ali',
                    specialty: 'General Medicine',
                    time: 'Dec 15, 2:00 PM',
                  },
                ].map((appointment, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-[#4FA64F] bg-gray-50 p-4 rounded"
                  >
                    <div className="font-semibold text-gray-800">
                      {appointment.doctor}
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.specialty} • {appointment.time}
                    </div>
                  </div>
                ))}
                {[].length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming appointments
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-[#003399] mb-4">
                Recent Medicine Orders
              </h2>
              <div className="space-y-3">
                {[
                  {
                    order: 'Order #12345',
                    items: '3 items',
                    status: 'Delivered',
                    date: 'Dec 10',
                  },
                  {
                    order: 'Order #12344',
                    items: '5 items',
                    status: 'In Transit',
                    date: 'Dec 8',
                  },
                  {
                    order: 'Order #12343',
                    items: '2 items',
                    status: 'Delivered',
                    date: 'Dec 5',
                  },
                ].map((order, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded border-l-4 border-[#003399]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {order.order}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items} • {order.date}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Tips */}
          <div className="mt-6 bg-linear-to-r from-[#4FA64F]/10 to-[#003399]/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#003399] mb-2">
              💡 Health Tip of the Day
            </h3>
            <p className="text-gray-700">
              Stay hydrated! Drinking at least 8 glasses of water daily helps
              maintain body temperature, keeps joints lubricated, and helps
              prevent infections.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerDashboard;
