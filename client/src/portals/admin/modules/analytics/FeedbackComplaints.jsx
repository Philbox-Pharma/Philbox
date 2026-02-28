// src/portals/admin/modules/analytics/FeedbackComplaints.jsx
import { useState, useEffect } from 'react';
import {
  FaComments,
  FaExclamationCircle,
  FaSmile,
  FaMeh,
  FaFrown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaFilter,
  FaChartBar,
  FaChartPie,
} from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

const { feedbackComplaints: feedbackComplaintsApi } = adminApi;

export default function FeedbackComplaints() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState(null);
  const [complaintsByCategory, setComplaintsByCategory] = useState([]);
  const [feedbackByCategory, setFeedbackByCategory] = useState([]);
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
        const [
          summaryRes,
          sentimentRes,
          resStatusRes,
          complaintsCatRes,
          feedbackCatRes,
        ] = await Promise.all([
          feedbackComplaintsApi
            .getSummary(filters)
            .catch(() => ({ data: null })),
          feedbackComplaintsApi
            .getSentimentAnalysis(filters)
            .catch(() => ({ data: null })),
          feedbackComplaintsApi
            .getResolutionStatus(filters)
            .catch(() => ({ data: null })),
          feedbackComplaintsApi
            .getComplaintsByCategory(filters)
            .catch(() => ({ data: [] })),
          feedbackComplaintsApi
            .getFeedbackByCategory(filters)
            .catch(() => ({ data: [] })),
        ]);

        setSummary(summaryRes.data);
        setSentiment(sentimentRes.data);
        setResolutionStatus(resStatusRes.data);
        setComplaintsByCategory(
          complaintsCatRes.data?.categories || complaintsCatRes.data || []
        );
        setFeedbackByCategory(
          feedbackCatRes.data?.categories || feedbackCatRes.data || []
        );
      } catch (err) {
        console.error('Failed to fetch feedback analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const totalSentiment =
    (sentiment?.positive || 0) +
    (sentiment?.neutral || 0) +
    (sentiment?.negative || 0);
  const positivePercent =
    totalSentiment > 0
      ? ((sentiment?.positive || 0) / totalSentiment) * 100
      : 0;
  const neutralPercent =
    totalSentiment > 0 ? ((sentiment?.neutral || 0) / totalSentiment) * 100 : 0;
  // eslint-disable-next-line no-unused-vars
  const negativePercent =
    totalSentiment > 0
      ? ((sentiment?.negative || 0) / totalSentiment) * 100
      : 0;

  const totalResolution =
    (resolutionStatus?.resolved || 0) + (resolutionStatus?.unresolved || 0);
  const resolvedPercent =
    totalResolution > 0
      ? ((resolutionStatus?.resolved || 0) / totalResolution) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e53e3e] to-[#c53030] rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaComments />
          Feedback & Complaints Analytics
        </h1>
        <p className="text-white/80 mt-1">
          Monitor customer feedback and complaint resolution
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
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e53e3e] outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e53e3e] outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Feedback */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Feedback</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summary?.totalFeedback || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#38a16915' }}
            >
              <FaComments className="text-2xl" style={{ color: '#38a169' }} />
            </div>
          </div>
        </div>

        {/* Total Complaints */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Complaints</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summary?.totalComplaints || 0}
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#e53e3e15' }}
            >
              <FaExclamationCircle
                className="text-2xl"
                style={{ color: '#e53e3e' }}
              />
            </div>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Resolution Time</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summary?.avgResolutionTime?.toFixed(1) || 0} days
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#d69e2e15' }}
            >
              <FaClock className="text-2xl" style={{ color: '#d69e2e' }} />
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Resolution Rate</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summary?.resolutionRate?.toFixed(1) || 0}%
                </p>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#805ad515' }}
            >
              <FaCheckCircle
                className="text-2xl"
                style={{ color: '#805ad5' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#38a169]" />
            Review Sentiment Analysis
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
                  background: `conic-gradient(#38a169 0% ${positivePercent}%, #d69e2e ${positivePercent}% ${positivePercent + neutralPercent}%, #e53e3e ${positivePercent + neutralPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {totalSentiment}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaSmile className="text-green-500" />
                  <span className="text-sm text-gray-600">Positive</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {sentiment?.positive || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMeh className="text-yellow-500" />
                  <span className="text-sm text-gray-600">Neutral</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {sentiment?.neutral || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFrown className="text-red-500" />
                  <span className="text-sm text-gray-600">Negative</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {sentiment?.negative || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#805ad5]" />
            Complaint Resolution Status
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
                  background: `conic-gradient(#38a169 0% ${resolvedPercent}%, #e53e3e ${resolvedPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {totalResolution}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {resolutionStatus?.resolved || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  <span className="text-sm text-gray-600">Unresolved</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {resolutionStatus?.unresolved || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaints by Category */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-[#e53e3e]" />
            Complaints by Category
          </h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          ) : complaintsByCategory.length > 0 ? (
            <div className="space-y-3">
              {complaintsByCategory.slice(0, 5).map((cat, index) => {
                const maxCount = complaintsByCategory[0]?.count || 1;
                const percentage = (cat.count / maxCount) * 100;
                return (
                  <div key={index} className="relative">
                    <div
                      className="absolute inset-0 bg-red-100 rounded-lg"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div className="relative flex items-center justify-between p-3">
                      <span className="font-medium text-gray-700 capitalize">
                        {cat.category || cat._id || 'Other'}
                      </span>
                      <span className="font-bold text-red-600">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No complaint data available
            </p>
          )}
        </div>

        {/* Feedback by Category */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-[#38a169]" />
            Feedback by Category
          </h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
          ) : feedbackByCategory.length > 0 ? (
            <div className="space-y-3">
              {feedbackByCategory.slice(0, 5).map((cat, index) => {
                const maxCount = feedbackByCategory[0]?.count || 1;
                const percentage = (cat.count / maxCount) * 100;
                return (
                  <div key={index} className="relative">
                    <div
                      className="absolute inset-0 bg-green-100 rounded-lg"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div className="relative flex items-center justify-between p-3">
                      <span className="font-medium text-gray-700 capitalize">
                        {cat.category || cat._id || 'Other'}
                      </span>
                      <span className="font-bold text-green-600">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No feedback data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
