// src/portals/admin/modules/analytics/AppointmentAnalytics.jsx
import { useState, useEffect } from 'react';
import {
  FaCalendarCheck,
  FaUserMd,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaFilter,
  FaChartBar,
  FaChartPie,
  FaStethoscope,
  FaVideo,
  FaHospital,
} from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

const { appointmentAnalytics: appointmentAnalyticsApi } = adminApi;

export default function AppointmentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [trends, setTrends] = useState([]);
  const [completionStats, setCompletionStats] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState(null);
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
        const overviewRes = await appointmentAnalyticsApi
          .getOverview(filters)
          .catch(() => ({ data: null }));

        if (overviewRes.data) {
          const data = overviewRes.data;

          // Parse completion rate data
          const completionData = data.completionRate || {};
          const appointmentTypesData = data.appointmentTypes || {};
          const averageRevenueData = data.averageRevenue || {};
          const trendsData = data.trends || {};

          // Calculate total appointments from completion data
          const totalAppointments = completionData.total || 0;

          // Calculate avg daily appointments from trends
          const daysCount = trendsData.trends?.length || 1;
          const avgDailyAppointments = totalAppointments / daysCount;

          // Set overview data with calculated values
          setOverview({
            totalAppointments,
            avgDailyAppointments,
            completionRate: completionData.completionRate || 0,
            totalRevenue: averageRevenueData.totalRevenue || 0,
          });

          // Set trends
          setTrends(trendsData.trends || []);

          // Set completion stats with cancelled included
          setCompletionStats({
            completed: completionData.completed || 0,
            missed: completionData.missed || 0,
            cancelled: 0, // Backend doesn't track cancelled separately
          });

          // Set top doctors (use appointments count)
          const topDocs = (data.topDoctorsByAppointments || []).map(doc => ({
            name: doc.doctorName,
            specialty: doc.specialization,
            avatar: doc.profileImage,
            appointmentsCount: doc.totalAppointments,
          }));
          setTopDoctors(topDocs);

          // Set appointment types
          setAppointmentTypes({
            online: appointmentTypesData.online || 0,
            inPerson: appointmentTypesData['in-person'] || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch appointment analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate percentages for Appointment Types
  const totalTypes =
    (appointmentTypes?.online || 0) + (appointmentTypes?.inPerson || 0);
  const onlinePercent =
    totalTypes > 0 ? ((appointmentTypes?.online || 0) / totalTypes) * 100 : 0;
  // eslint-disable-next-line no-unused-vars
  const inPersonPercent =
    totalTypes > 0 ? ((appointmentTypes?.inPerson || 0) / totalTypes) * 100 : 0;

  // Calculate percentages for Completion Rate
  const totalInCompletion =
    (completionStats?.completed || 0) +
    (completionStats?.missed || 0) +
    (completionStats?.cancelled || 0);
  const completedPercent =
    totalInCompletion > 0
      ? ((completionStats?.completed || 0) / totalInCompletion) * 100
      : 0;
  const missedPercent =
    totalInCompletion > 0
      ? ((completionStats?.missed || 0) / totalInCompletion) * 100
      : 0;
  const cancelledPercent =
    totalInCompletion > 0
      ? ((completionStats?.cancelled || 0) / totalInCompletion) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#805ad5] to-[#6b46c1] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaCalendarCheck />
          Appointment Analytics
        </h1>
        <p className="text-white/80 mt-1">
          Track appointment trends, doctor performance, and completion rates
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <FaFilter className="text-gray-400 shrink-0" />
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <FaCalendarAlt className="text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805ad5] outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Appointments</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {overview?.totalAppointments || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#805ad515' }}
            >
              <FaCalendarCheck
                className="text-2xl"
                style={{ color: '#805ad5' }}
              />
            </div>
          </div>
        </div>

        {/* Avg Daily Appointments */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Daily Appointments</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {Number(overview?.avgDailyAppointments || 0).toFixed(1)}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#38a16915' }}
            >
              <FaClock className="text-2xl" style={{ color: '#38a169' }} />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completion Rate</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {Number(overview?.completionRate || 0).toFixed(1)}%
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#3182ce15' }}
            >
              <FaCheckCircle
                className="text-2xl"
                style={{ color: '#3182ce' }}
              />
            </div>
          </div>
        </div>

        {/* Revenue from Appointments */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Review from Appointments</p>
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
              style={{ backgroundColor: '#d69e2e15' }}
            >
              <FaStethoscope
                className="text-2xl"
                style={{ color: '#d69e2e' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Types Distribution (Pie-ish) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#805ad5]" />
            Appointment Types
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
                  background: `conic-gradient(#805ad5 0% ${onlinePercent}%, #3182ce ${onlinePercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {totalTypes}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#805ad5] rounded-full"></div>
                  <FaVideo className="text-gray-400" />
                  <span className="text-gray-600">Online Consultation</span>
                  <span className="font-bold ml-auto">
                    {appointmentTypes?.online || 0}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#3182ce] rounded-full"></div>
                  <FaHospital className="text-gray-400" />
                  <span className="text-gray-600">In-Person Visit</span>
                  <span className="font-bold ml-auto">
                    {appointmentTypes?.inPerson || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-[#38a169]" />
            Status Breakdown
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Completed */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" /> Completed
                  </span>
                  <span className="font-bold">
                    {completionStats?.completed || 0} (
                    {completedPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${completedPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Missed */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <FaTimesCircle className="text-red-500" /> Missed
                  </span>
                  <span className="font-bold">
                    {completionStats?.missed || 0} ({missedPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: `${missedPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Cancelled */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <FaTimesCircle className="text-gray-400" /> Cancelled
                  </span>
                  <span className="font-bold">
                    {completionStats?.cancelled || 0} (
                    {cancelledPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gray-400 h-2.5 rounded-full"
                    style={{ width: `${cancelledPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Doctors */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUserMd className="text-[#805ad5]" />
            Top Doctors by Appointments
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : topDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topDoctors.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100">
                    {doc.avatar ? (
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaUserMd className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">
                      {doc.name || 'Unknown Doctor'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doc.specialty || 'General'}
                    </p>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    <p className="font-bold text-[#805ad5] text-lg">
                      {doc.appointmentsCount || 0}
                    </p>
                    <p className="text-xs text-gray-400">visits</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No doctor data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
