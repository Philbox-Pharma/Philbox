import Review from '../../../../../../models/Review.js';
import Complaint from '../../../../../../models/Complaint.js';
import Feedback from '../../../../../../models/Feedback.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class FeedbackComplaintsAnalyticsService {
  /**
   * Get Sentiment Analysis of Reviews (Pie Chart: positive/negative/neutral)
   */
  async getReviewSentimentAnalysis(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const sentimentData = await Review.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            sentiment: '$_id',
            count: 1,
          },
        },
      ]);

      // Calculate percentages
      const totalReviews = sentimentData.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const chartData = sentimentData.map(item => ({
        sentiment: item.sentiment,
        count: item.count,
        percentage:
          totalReviews > 0
            ? parseFloat(((item.count / totalReviews) * 100).toFixed(2))
            : 0,
      }));

      // Ensure all sentiments are present
      const allSentiments = ['positive', 'negative', 'neutral'];
      allSentiments.forEach(sentiment => {
        if (!chartData.find(item => item.sentiment === sentiment)) {
          chartData.push({ sentiment, count: 0, percentage: 0 });
        }
      });

      // Log admin activity
      await logAdminActivity(
        req,
        'view_sentiment_analysis',
        'Viewed review sentiment analysis',
        'feedback_complaints_analytics',
        null
      );

      return {
        totalReviews,
        sentimentBreakdown: chartData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate Complaint Resolution Time (KPI - average days)
   */
  async getComplaintResolutionTime(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {
        status: { $in: ['resolved', 'closed'] },
      };

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const resolutionData = await Complaint.aggregate([
        { $match: matchFilter },
        {
          $project: {
            resolutionDays: {
              $divide: [
                { $subtract: ['$updated_at', '$created_at'] },
                1000 * 60 * 60 * 24, // Convert milliseconds to days
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageResolutionDays: { $avg: '$resolutionDays' },
            minResolutionDays: { $min: '$resolutionDays' },
            maxResolutionDays: { $max: '$resolutionDays' },
            totalResolved: { $sum: 1 },
          },
        },
      ]);

      const result = resolutionData[0] || {
        averageResolutionDays: 0,
        minResolutionDays: 0,
        maxResolutionDays: 0,
        totalResolved: 0,
      };

      // Log admin activity
      await logAdminActivity(
        req,
        'view_resolution_time',
        'Viewed complaint resolution time KPI',
        'feedback_complaints_analytics',
        null
      );

      return {
        averageResolutionDays: parseFloat(
          result.averageResolutionDays.toFixed(2)
        ),
        minResolutionDays: parseFloat(result.minResolutionDays.toFixed(2)),
        maxResolutionDays: parseFloat(result.maxResolutionDays.toFixed(2)),
        totalResolvedComplaints: result.totalResolved,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Complaints by Category (Bar Chart)
   */
  async getComplaintsByCategory(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const categoryData = await Complaint.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: { $ifNull: ['$_id', 'uncategorized'] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Calculate percentages
      const totalComplaints = categoryData.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const chartData = categoryData.map(item => ({
        category: item.category,
        count: item.count,
        percentage:
          totalComplaints > 0
            ? parseFloat(((item.count / totalComplaints) * 100).toFixed(2))
            : 0,
      }));

      // Log admin activity
      await logAdminActivity(
        req,
        'view_complaints_by_category',
        'Viewed complaints by category',
        'feedback_complaints_analytics',
        null
      );

      return {
        totalComplaints,
        categoryBreakdown: chartData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Feedback by Category (Bar Chart)
   */
  async getFeedbackByCategory(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const categoryData = await Feedback.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Calculate percentages
      const totalFeedback = categoryData.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const chartData = categoryData.map(item => ({
        category: item.category,
        count: item.count,
        percentage:
          totalFeedback > 0
            ? parseFloat(((item.count / totalFeedback) * 100).toFixed(2))
            : 0,
      }));

      // Log admin activity
      await logAdminActivity(
        req,
        'view_feedback_by_category',
        'Viewed feedback by category',
        'feedback_complaints_analytics',
        null
      );

      return {
        totalFeedback,
        categoryBreakdown: chartData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Unresolved vs Resolved Complaints (Donut Chart)
   */
  async getComplaintResolutionStatus(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const statusData = await Complaint.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
          },
        },
      ]);

      // Group into resolved and unresolved
      let resolved = 0;
      let unresolved = 0;

      statusData.forEach(item => {
        if (item.status === 'resolved' || item.status === 'closed') {
          resolved += item.count;
        } else {
          unresolved += item.count;
        }
      });

      const total = resolved + unresolved;

      // Log admin activity
      await logAdminActivity(
        req,
        'view_resolution_status',
        'Viewed complaint resolution status',
        'feedback_complaints_analytics',
        null
      );

      return {
        total,
        resolved,
        unresolved,
        resolvedPercentage:
          total > 0 ? parseFloat(((resolved / total) * 100).toFixed(2)) : 0,
        unresolvedPercentage:
          total > 0 ? parseFloat(((unresolved / total) * 100).toFixed(2)) : 0,
        statusDetails: statusData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Feedback Trends Over Time (Line Chart)
   */
  async getFeedbackTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily' } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Group by period
      let groupBy;
      let sortBy;
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$created_at' },
          week: { $week: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.week': 1 };
      } else {
        // monthly
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.month': 1 };
      }

      const feedbackTrends = await Feedback.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            feedbackCount: { $sum: 1 },
          },
        },
        { $sort: sortBy },
      ]);

      const complaintTrends = await Complaint.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            complaintCount: { $sum: 1 },
          },
        },
        { $sort: sortBy },
      ]);

      const reviewTrends = await Review.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            reviewCount: { $sum: 1 },
          },
        },
        { $sort: sortBy },
      ]);

      // Format the data for charting
      const formatPeriod = periodObj => {
        if (period === 'daily') {
          return `${periodObj.year}-${String(periodObj.month).padStart(2, '0')}-${String(periodObj.day).padStart(2, '0')}`;
        } else if (period === 'weekly') {
          return `${periodObj.year}-W${String(periodObj.week).padStart(2, '0')}`;
        } else {
          return `${periodObj.year}-${String(periodObj.month).padStart(2, '0')}`;
        }
      };

      const trendsData = [];
      const allPeriods = new Set();

      feedbackTrends.forEach(item => {
        const periodLabel = formatPeriod(item._id);
        allPeriods.add(periodLabel);
      });
      complaintTrends.forEach(item => {
        const periodLabel = formatPeriod(item._id);
        allPeriods.add(periodLabel);
      });
      reviewTrends.forEach(item => {
        const periodLabel = formatPeriod(item._id);
        allPeriods.add(periodLabel);
      });

      // Create a map for easy lookup
      const feedbackMap = new Map(
        feedbackTrends.map(item => [formatPeriod(item._id), item.feedbackCount])
      );
      const complaintMap = new Map(
        complaintTrends.map(item => [
          formatPeriod(item._id),
          item.complaintCount,
        ])
      );
      const reviewMap = new Map(
        reviewTrends.map(item => [formatPeriod(item._id), item.reviewCount])
      );

      // Combine all data
      Array.from(allPeriods)
        .sort()
        .forEach(periodLabel => {
          trendsData.push({
            period: periodLabel,
            feedbackCount: feedbackMap.get(periodLabel) || 0,
            complaintCount: complaintMap.get(periodLabel) || 0,
            reviewCount: reviewMap.get(periodLabel) || 0,
          });
        });

      // Log admin activity
      await logAdminActivity(
        req,
        'view_feedback_trends',
        'Viewed feedback trends over time',
        'feedback_complaints_analytics',
        null
      );

      return {
        period,
        startDate: start,
        endDate: end,
        trends: trendsData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Complaint Trends Over Time (Line Chart)
   */
  async getComplaintTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily' } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Group by period
      let groupBy;
      let sortBy;
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$created_at' },
          week: { $week: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.week': 1 };
      } else {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
        };
        sortBy = { '_id.year': 1, '_id.month': 1 };
      }

      const trends = await Complaint.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            totalComplaints: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0],
              },
            },
          },
        },
        { $sort: sortBy },
      ]);

      // Format period labels
      const formatPeriod = periodObj => {
        if (period === 'daily') {
          return `${periodObj.year}-${String(periodObj.month).padStart(2, '0')}-${String(periodObj.day).padStart(2, '0')}`;
        } else if (period === 'weekly') {
          return `${periodObj.year}-W${String(periodObj.week).padStart(2, '0')}`;
        } else {
          return `${periodObj.year}-${String(periodObj.month).padStart(2, '0')}`;
        }
      };

      const trendsData = trends.map(item => ({
        period: formatPeriod(item._id),
        totalComplaints: item.totalComplaints,
        resolved: item.resolved,
        pending: item.pending,
        inProgress: item.inProgress,
      }));

      // Log admin activity
      await logAdminActivity(
        req,
        'view_complaint_trends',
        'Viewed complaint trends over time',
        'feedback_complaints_analytics',
        null
      );

      return {
        period,
        startDate: start,
        endDate: end,
        trends: trendsData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get comprehensive feedback and complaints summary
   */
  async getOverallSummary(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      // Get counts
      const [
        totalReviews,
        totalComplaints,
        totalFeedback,
        resolvedComplaints,
        avgRating,
      ] = await Promise.all([
        Review.countDocuments(matchFilter),
        Complaint.countDocuments(matchFilter),
        Feedback.countDocuments(matchFilter),
        Complaint.countDocuments({
          ...matchFilter,
          status: { $in: ['resolved', 'closed'] },
        }),
        Review.aggregate([
          { $match: matchFilter },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
            },
          },
        ]),
      ]);

      const pendingComplaints = totalComplaints - resolvedComplaints;

      // Log admin activity
      await logAdminActivity(
        req,
        'view_feedback_complaints_summary',
        'Viewed feedback and complaints summary',
        'feedback_complaints_analytics',
        null
      );

      return {
        totalReviews,
        totalComplaints,
        totalFeedback,
        resolvedComplaints,
        pendingComplaints,
        averageRating:
          avgRating.length > 0
            ? parseFloat(avgRating[0].averageRating.toFixed(2))
            : 0,
        resolutionRate:
          totalComplaints > 0
            ? parseFloat(
                ((resolvedComplaints / totalComplaints) * 100).toFixed(2)
              )
            : 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export feedback and complaints data for PDF report generation
   */
  async exportReportData(query, req) {
    try {
      const { startDate, endDate } = query;

      // Get all analytics data
      const [
        sentimentAnalysis,
        resolutionTime,
        complaintsByCategory,
        feedbackByCategory,
        resolutionStatus,
        feedbackTrends,
        complaintTrends,
        overallSummary,
      ] = await Promise.all([
        this.getReviewSentimentAnalysis(query, req),
        this.getComplaintResolutionTime(query, req),
        this.getComplaintsByCategory(query, req),
        this.getFeedbackByCategory(query, req),
        this.getComplaintResolutionStatus(query, req),
        this.getFeedbackTrends(query, req),
        this.getComplaintTrends(query, req),
        this.getOverallSummary(query, req),
      ]);

      // Log admin activity
      await logAdminActivity(
        req,
        'export_report_data',
        'Exported feedback and complaints report data',
        'feedback_complaints_analytics',
        null
      );

      return {
        reportMetadata: {
          generatedAt: new Date(),
          generatedBy: req.admin.email,
          dateRange: {
            startDate: startDate || 'Not specified',
            endDate: endDate || 'Not specified',
          },
        },
        overallSummary,
        sentimentAnalysis,
        resolutionTime,
        complaintsByCategory,
        feedbackByCategory,
        resolutionStatus,
        feedbackTrends,
        complaintTrends,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new FeedbackComplaintsAnalyticsService();
