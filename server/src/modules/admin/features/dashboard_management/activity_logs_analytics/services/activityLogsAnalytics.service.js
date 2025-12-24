import AdminActivityLog from '../../../../../../models/AdminActivityLog.js';
import SalespersonActivityLog from '../../../../../../models/SalespersonActivityLog.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class ActivityLogsAnalyticsService {
  /**
   * Get Admin and Salesperson Actions Timeline (Chronological List)
   */
  async getActionsTimeline(query, req) {
    try {
      const {
        startDate,
        endDate,
        userId,
        actionType,
        userRole,
        page = 1,
        limit = 50,
      } = query;

      const skip = (page - 1) * limit;

      // Build match filter for date range
      const matchFilter = {};
      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      // Add userId filter
      if (userId) {
        matchFilter[
          userRole === 'salesperson' ? 'salesperson_id' : 'admin_id'
        ] = userId;
      }

      // Add action type filter
      if (actionType) {
        matchFilter.action_type = actionType;
      }

      // Fetch admin logs
      let adminLogs = [];
      if (!userRole || userRole === 'admin') {
        adminLogs = await AdminActivityLog.find(matchFilter)
          .populate('admin_id', 'name email category')
          .sort({ created_at: -1 })
          .limit(limit * 2) // Get more to mix with salesperson logs
          .lean();

        adminLogs = adminLogs.map(log => ({
          ...log,
          userRole: 'admin',
          userName: log.admin_id?.name || 'Unknown Admin',
          userEmail: log.admin_id?.email || 'N/A',
          userCategory: log.admin_id?.category || 'N/A',
        }));
      }

      // Fetch salesperson logs
      let salespersonLogs = [];
      if (!userRole || userRole === 'salesperson') {
        const spMatchFilter = { ...matchFilter };
        if (matchFilter.admin_id) {
          spMatchFilter.salesperson_id = matchFilter.admin_id;
          delete spMatchFilter.admin_id;
        }

        salespersonLogs = await SalespersonActivityLog.find(spMatchFilter)
          .populate('salesperson_id', 'fullName email status')
          .sort({ created_at: -1 })
          .limit(limit * 2)
          .lean();

        salespersonLogs = salespersonLogs.map(log => ({
          ...log,
          userRole: 'salesperson',
          userName: log.salesperson_id?.fullName || 'Unknown Salesperson',
          userEmail: log.salesperson_id?.email || 'N/A',
          userCategory: 'salesperson',
        }));
      }

      // Merge and sort all logs
      const allLogs = [...adminLogs, ...salespersonLogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(skip, skip + parseInt(limit));

      // Get total count
      const [adminCount, salespersonCount] = await Promise.all([
        userRole === 'salesperson'
          ? 0
          : AdminActivityLog.countDocuments(matchFilter),
        userRole === 'admin'
          ? 0
          : SalespersonActivityLog.countDocuments(
              userRole === 'admin' ? {} : matchFilter
            ),
      ]);

      const totalCount = adminCount + salespersonCount;

      await logAdminActivity(
        req,
        'view_actions_timeline',
        'Viewed admin and salesperson actions timeline',
        'activity_logs_analytics',
        null
      );

      return {
        timeline: allLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Most Frequent Actions (Pie Chart)
   */
  async getMostFrequentActions(query, req) {
    try {
      const { startDate, endDate, userRole, topN = 10 } = query;

      const matchFilter = {};
      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      // Get admin actions
      let adminActions = [];
      if (!userRole || userRole === 'admin') {
        adminActions = await AdminActivityLog.aggregate([
          { $match: matchFilter },
          {
            $group: {
              _id: '$action_type',
              count: { $sum: 1 },
              userRole: { $first: 'admin' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: parseInt(topN) },
        ]);
      }

      // Get salesperson actions
      let salespersonActions = [];
      if (!userRole || userRole === 'salesperson') {
        salespersonActions = await SalespersonActivityLog.aggregate([
          { $match: matchFilter },
          {
            $group: {
              _id: '$action_type',
              count: { $sum: 1 },
              userRole: { $first: 'salesperson' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: parseInt(topN) },
        ]);
      }

      // Merge and sort
      const allActions = [...adminActions, ...salespersonActions]
        .sort((a, b) => b.count - a.count)
        .slice(0, parseInt(topN));

      // Calculate percentages
      const totalActions = allActions.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const actionsWithPercentage = allActions.map(item => ({
        actionType: item._id,
        count: item.count,
        userRole: item.userRole,
        percentage:
          totalActions > 0
            ? parseFloat(((item.count / totalActions) * 100).toFixed(2))
            : 0,
      }));

      await logAdminActivity(
        req,
        'view_frequent_actions',
        'Viewed most frequent admin and salesperson actions',
        'activity_logs_analytics',
        null
      );

      return {
        totalActions,
        frequentActions: actionsWithPercentage,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Login Attempts per Role (Bar Chart)
   */
  async getLoginAttemptsByRole(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {
        action_type: { $in: ['login', 'login_success', 'login_failed'] },
      };

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      // Get admin login attempts by category
      const adminLogins = await AdminActivityLog.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'admins',
            localField: 'admin_id',
            foreignField: '_id',
            as: 'admin',
          },
        },
        { $unwind: { path: '$admin', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              category: { $ifNull: ['$admin.category', 'unknown'] },
              action: '$action_type',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      // Get salesperson login attempts
      const salespersonLogins = await SalespersonActivityLog.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              category: 'salesperson',
              action: '$action_type',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      // Process data
      const roleStats = {};

      [...adminLogins, ...salespersonLogins].forEach(item => {
        const role = item._id.category;
        if (!roleStats[role]) {
          roleStats[role] = {
            role,
            totalAttempts: 0,
            successfulLogins: 0,
            failedLogins: 0,
          };
        }

        if (
          item._id.action === 'login_success' ||
          item._id.action === 'login'
        ) {
          roleStats[role].successfulLogins += item.count;
        } else if (item._id.action === 'login_failed') {
          roleStats[role].failedLogins += item.count;
        }
        roleStats[role].totalAttempts += item.count;
      });

      const chartData = Object.values(roleStats).sort(
        (a, b) => b.totalAttempts - a.totalAttempts
      );

      await logAdminActivity(
        req,
        'view_login_attempts',
        'Viewed login attempts by role',
        'activity_logs_analytics',
        null
      );

      return {
        loginAttempts: chartData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Suspicious Activity Alerts (Table)
   */
  async getSuspiciousActivities(query, req) {
    try {
      const { startDate, endDate, page = 1, limit = 20 } = query;

      const skip = (page - 1) * limit;

      // Define suspicious action patterns
      const suspiciousPatterns = [
        'delete',
        'suspend',
        'block',
        'failed',
        'unauthorized',
        'security',
        'breach',
      ];

      const matchFilter = {
        $or: [
          {
            action_type: {
              $regex: suspiciousPatterns.join('|'),
              $options: 'i',
            },
          },
          {
            description: {
              $regex: suspiciousPatterns.join('|'),
              $options: 'i',
            },
          },
        ],
      };

      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      // Get suspicious admin activities
      const adminActivities = await AdminActivityLog.find(matchFilter)
        .populate('admin_id', 'name email category')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get suspicious salesperson activities
      const salespersonActivities = await SalespersonActivityLog.find(
        matchFilter
      )
        .populate('salesperson_id', 'fullName email status')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Combine and format
      const allActivities = [
        ...adminActivities.map(log => ({
          _id: log._id,
          userRole: 'admin',
          userId: log.admin_id?._id,
          userName: log.admin_id?.name || 'Unknown',
          userEmail: log.admin_id?.email || 'N/A',
          actionType: log.action_type,
          description: log.description,
          targetCollection: log.target_collection,
          targetId: log.target_id,
          ipAddress: log.ip_address,
          deviceInfo: log.device_info,
          createdAt: log.created_at,
          severity: this.calculateSeverity(log.action_type),
        })),
        ...salespersonActivities.map(log => ({
          _id: log._id,
          userRole: 'salesperson',
          userId: log.salesperson_id?._id,
          userName: log.salesperson_id?.fullName || 'Unknown',
          userEmail: log.salesperson_id?.email || 'N/A',
          actionType: log.action_type,
          description: log.description,
          targetCollection: log.target_collection,
          targetId: log.target_id,
          ipAddress: log.ip_address,
          deviceInfo: log.device_info,
          createdAt: log.created_at,
          severity: this.calculateSeverity(log.action_type),
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalCount =
        (await AdminActivityLog.countDocuments(matchFilter)) +
        (await SalespersonActivityLog.countDocuments(matchFilter));

      await logAdminActivity(
        req,
        'view_suspicious_activities',
        'Viewed suspicious activity alerts',
        'activity_logs_analytics',
        null
      );

      return {
        suspiciousActivities: allActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate severity level based on action type
   */
  calculateSeverity(actionType) {
    const lowerAction = actionType.toLowerCase();

    if (
      lowerAction.includes('delete') ||
      lowerAction.includes('block') ||
      lowerAction.includes('breach')
    ) {
      return 'critical';
    }

    if (
      lowerAction.includes('suspend') ||
      lowerAction.includes('failed') ||
      lowerAction.includes('unauthorized')
    ) {
      return 'high';
    }

    if (lowerAction.includes('security') || lowerAction.includes('warning')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get Activity Overview Summary
   */
  async getActivityOverview(query, req) {
    try {
      const { startDate, endDate } = query;

      const matchFilter = {};
      if (startDate || endDate) {
        matchFilter.created_at = {};
        if (startDate) matchFilter.created_at.$gte = new Date(startDate);
        if (endDate) matchFilter.created_at.$lte = new Date(endDate);
      }

      const [
        totalAdminActions,
        totalSalespersonActions,
        uniqueAdmins,
        uniqueSalespersons,
        suspiciousCount,
      ] = await Promise.all([
        AdminActivityLog.countDocuments(matchFilter),
        SalespersonActivityLog.countDocuments(matchFilter),
        AdminActivityLog.distinct('admin_id', matchFilter),
        SalespersonActivityLog.distinct('salesperson_id', matchFilter),
        AdminActivityLog.countDocuments({
          ...matchFilter,
          $or: [
            {
              action_type: {
                $regex: 'delete|suspend|block|failed|unauthorized',
                $options: 'i',
              },
            },
          ],
        }),
      ]);

      await logAdminActivity(
        req,
        'view_activity_overview',
        'Viewed activity logs overview',
        'activity_logs_analytics',
        null
      );

      return {
        totalAdminActions,
        totalSalespersonActions,
        totalActions: totalAdminActions + totalSalespersonActions,
        uniqueAdmins: uniqueAdmins.length,
        uniqueSalespersons: uniqueSalespersons.length,
        suspiciousActivitiesCount: suspiciousCount,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ActivityLogsAnalyticsService();
