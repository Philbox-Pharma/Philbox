import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import useAuthStore from '../../stores/auth.store';
import {
  FaUserMd,
  FaCalendarAlt,
  FaPrescription,
  FaChartLine,
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: <FaCalendarAlt />, label: 'Appointments Today', value: '12' },
    { icon: <FaPrescription />, label: 'Prescriptions Issued', value: '45' },
    { icon: <FaUserMd />, label: 'Total Patients', value: '234' },
    { icon: <FaChartLine />, label: 'This Month Revenue', value: 'Rs 125,000' },
  ];

  return (
    <MainLayout showNav={false} showAuthButtons={true} showFooter={false}>
      <div className="pt-24 pb-12 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Welcome Section */}
          <div className="bg-linear-to-r from-[#003399] to-[#4FA64F] text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Dr. {user?.fullName || 'Doctor'}!
            </h1>
            <p className="text-white/90">
              Here's what's happening with your practice today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition"
              >
                <div className="text-3xl text-[#003399] mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
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
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="border-l-4 border-[#4FA64F] bg-gray-50 p-4 rounded"
                  >
                    <div className="font-semibold text-gray-800">
                      Patient #{item}
                    </div>
                    <div className="text-sm text-gray-600">
                      Time: {10 + item}:00 AM - Consultation
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-[#003399] mb-4">
                Recent Activities
              </h2>
              <div className="space-y-3">
                {[
                  'Prescription issued for Patient #123',
                  'Appointment completed with Patient #98',
                  'Medical record updated for Patient #76',
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded border-l-4 border-[#003399]"
                  >
                    <div className="text-sm text-gray-700">{activity}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {index + 1} hour ago
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorDashboard;
