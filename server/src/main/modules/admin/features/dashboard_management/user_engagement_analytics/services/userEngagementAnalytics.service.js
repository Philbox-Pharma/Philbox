import Customer from '../../../../../../models/Customer.js';
import DoctorApplication from '../../../../../../models/DoctorApplication.js';
import DoctorActivityLog from '../../../../../../models/DoctorActivityLog.js';
import Appointment from '../../../../../../models/Appointment.js';
import Order from '../../../../../../models/Order.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class UserEngagementAnalyticsService {
  /**
   * Get New Customers Over Time (Line Chart)
   */
  async getNewCustomersTrends(query, req) {
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
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
        };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$created_at' },
          week: { $week: '$created_at' },
        };
      } else {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
        };
      }

      const trends = await Customer.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            newCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $eq: ['$account_status', 'active'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      await logAdminActivity(
        req,
        'view_new_customers_trends',
        `Viewed new customers trends (${period})`,
        'user_engagement_analytics',
        null
      );

      return { trends, period, startDate: start, endDate: end };
    } catch (error) {
      console.error('Error in getNewCustomersTrends:', error);
      throw error;
    }
  }

  /**
   * Get Active vs Inactive Customers (Pie Chart)
   */
  async getCustomerActivityStatus(query, req) {
    try {
      const { endDate } = query;

      const end = endDate ? new Date(endDate) : new Date();

      // Get all customers created before the end date
      const matchFilter = {
        created_at: { $lte: end },
      };

      const statusBreakdown = await Customer.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$account_status',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        active: 0,
        'suspended/freezed': 0,
        'blocked/removed': 0,
        total: 0,
      };

      statusBreakdown.forEach(item => {
        result[item._id] = item.count;
        result.total += item.count;
      });

      // Calculate percentages
      Object.keys(result).forEach(key => {
        if (key !== 'total') {
          result[`${key}Percentage`] =
            result.total > 0
              ? ((result[key] / result.total) * 100).toFixed(2)
              : 0;
        }
      });

      await logAdminActivity(
        req,
        'view_customer_activity_status',
        'Viewed customer activity status breakdown',
        'user_engagement_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getCustomerActivityStatus:', error);
      throw error;
    }
  }

  /**
   * Get Doctor Applications: Approved vs Rejected (Bar Chart - Super Admin Only)
   */
  async getDoctorApplicationsBreakdown(query, req) {
    try {
      const { startDate, endDate, period = 'monthly' } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Group by period and status
      let groupBy;
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
          status: '$status',
        };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$created_at' },
          week: { $week: '$created_at' },
          status: '$status',
        };
      } else {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          status: '$status',
        };
      }

      const applications = await DoctorApplication.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      // Summary counts
      const summary = await DoctorApplication.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const summaryResult = {
        pending: 0,
        processing: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };

      summary.forEach(item => {
        summaryResult[item._id] = item.count;
        summaryResult.total += item.count;
      });

      await logAdminActivity(
        req,
        'view_doctor_applications_breakdown',
        'Viewed doctor applications breakdown',
        'user_engagement_analytics',
        null
      );

      return {
        trends: applications,
        summary: summaryResult,
        period,
        startDate: start,
        endDate: end,
      };
    } catch (error) {
      console.error('Error in getDoctorApplicationsBreakdown:', error);
      throw error;
    }
  }

  /**
   * Get Doctor Activity Trends (Heatmap/Table)
   */
  async getDoctorActivityTrends(query, req) {
    try {
      const { startDate, endDate, limit = 20 } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Get doctor activity grouped by doctor and action type
      const activityByDoctor = await DoctorActivityLog.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              doctor_id: '$doctor_id',
              action_type: '$action_type',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.doctor_id',
            actions: {
              $push: {
                action_type: '$_id.action_type',
                count: '$count',
              },
            },
            totalActivities: { $sum: '$count' },
          },
        },
        { $sort: { totalActivities: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $project: {
            doctorId: '$_id',
            doctorName: '$doctor.fullName',
            doctorEmail: '$doctor.email',
            specialization: '$doctor.specialization',
            actions: 1,
            totalActivities: 1,
            lastActivity: '$doctor.last_login',
          },
        },
      ]);

      // Get activity trends by day
      const dailyTrends = await DoctorActivityLog.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              day: { $dayOfMonth: '$created_at' },
            },
            totalActivities: { $sum: 1 },
            uniqueDoctors: { $addToSet: '$doctor_id' },
          },
        },
        {
          $project: {
            _id: 1,
            totalActivities: 1,
            uniqueDoctorsCount: { $size: '$uniqueDoctors' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      await logAdminActivity(
        req,
        'view_doctor_activity_trends',
        'Viewed doctor activity trends',
        'user_engagement_analytics',
        null
      );

      return {
        topActiveDoctors: activityByDoctor,
        dailyTrends,
        startDate: start,
        endDate: end,
      };
    } catch (error) {
      console.error('Error in getDoctorActivityTrends:', error);
      throw error;
    }
  }

  /**
   * Get Top Customers by Appointments or Orders (Ranked List)
   */
  async getTopCustomers(query, req) {
    try {
      const {
        startDate,
        endDate,
        metric = 'both',
        limit = 10,
        branchId,
      } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      let topCustomers = [];

      if (metric === 'appointments' || metric === 'both') {
        const appointmentFilter = {
          appointment_date: { $gte: start, $lte: end },
        };

        if (branchId) {
          appointmentFilter.branch_id = branchId;
        }

        const topByAppointments = await Appointment.aggregate([
          { $match: appointmentFilter },
          {
            $group: {
              _id: '$customer_id',
              appointmentCount: { $sum: 1 },
              totalSpent: { $sum: '$consultation_fee' },
              completedAppointments: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
            },
          },
          { $sort: { appointmentCount: -1 } },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'customers',
              localField: '_id',
              foreignField: '_id',
              as: 'customer',
            },
          },
          { $unwind: '$customer' },
          {
            $project: {
              customerId: '$_id',
              customerName: '$customer.fullName',
              customerEmail: '$customer.email',
              profileImg: '$customer.profile_img_url',
              appointmentCount: 1,
              totalSpent: 1,
              completedAppointments: 1,
              metric: { $literal: 'appointments' },
            },
          },
        ]);

        topCustomers = [...topByAppointments];
      }

      if (metric === 'orders' || metric === 'both') {
        const orderFilter = {
          created_at: { $gte: start, $lte: end },
          status: 'delivered',
        };

        if (branchId) {
          orderFilter.branch_id = branchId;
        }

        const topByOrders = await Order.aggregate([
          { $match: orderFilter },
          {
            $group: {
              _id: '$customer_id',
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$total_amount' },
            },
          },
          { $sort: { orderCount: -1 } },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'customers',
              localField: '_id',
              foreignField: '_id',
              as: 'customer',
            },
          },
          { $unwind: '$customer' },
          {
            $project: {
              customerId: '$_id',
              customerName: '$customer.fullName',
              customerEmail: '$customer.email',
              profileImg: '$customer.profile_img_url',
              orderCount: 1,
              totalSpent: 1,
              metric: { $literal: 'orders' },
            },
          },
        ]);

        if (metric === 'both') {
          // Merge both results
          topCustomers = [...topCustomers, ...topByOrders];
          // Remove duplicates and combine stats
          const customerMap = new Map();
          topCustomers.forEach(customer => {
            const id = customer.customerId.toString();
            if (customerMap.has(id)) {
              const existing = customerMap.get(id);
              existing.appointmentCount =
                (existing.appointmentCount || 0) +
                (customer.appointmentCount || 0);
              existing.orderCount =
                (existing.orderCount || 0) + (customer.orderCount || 0);
              existing.totalSpent += customer.totalSpent || 0;
              existing.completedAppointments =
                (existing.completedAppointments || 0) +
                (customer.completedAppointments || 0);
            } else {
              customerMap.set(id, { ...customer, metric: 'both' });
            }
          });
          topCustomers = Array.from(customerMap.values());
          // Sort by total engagement (appointments + orders)
          topCustomers.sort(
            (a, b) =>
              (b.appointmentCount || 0) +
              (b.orderCount || 0) -
              ((a.appointmentCount || 0) + (a.orderCount || 0))
          );
          topCustomers = topCustomers.slice(0, parseInt(limit));
        } else {
          topCustomers = topByOrders;
        }
      }

      await logAdminActivity(
        req,
        'view_top_customers',
        `Viewed top customers by ${metric}`,
        'user_engagement_analytics',
        null
      );

      return {
        topCustomers,
        metric,
        startDate: start,
        endDate: end,
      };
    } catch (error) {
      console.error('Error in getTopCustomers:', error);
      throw error;
    }
  }

  /**
   * Get Customer Retention Rate (KPI)
   */
  async getCustomerRetentionRate(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // Define retention period (customers who have activity in both periods)
      const periodLength = end - start;
      const previousStart = new Date(start - periodLength);

      // Get customers who were active in the first period
      const appointmentFilter1 = {
        appointment_date: { $gte: previousStart, $lt: start },
      };
      const orderFilter1 = {
        created_at: { $gte: previousStart, $lt: start },
      };

      if (branchId) {
        appointmentFilter1.branch_id = branchId;
        orderFilter1.branch_id = branchId;
      }

      const [customersFromAppointments1, customersFromOrders1] =
        await Promise.all([
          Appointment.distinct('customer_id', appointmentFilter1),
          Order.distinct('customer_id', orderFilter1),
        ]);

      const period1Customers = new Set([
        ...customersFromAppointments1.map(id => id.toString()),
        ...customersFromOrders1.map(id => id.toString()),
      ]);

      // Get customers who were active in the second period
      const appointmentFilter2 = {
        appointment_date: { $gte: start, $lte: end },
      };
      const orderFilter2 = {
        created_at: { $gte: start, $lte: end },
      };

      if (branchId) {
        appointmentFilter2.branch_id = branchId;
        orderFilter2.branch_id = branchId;
      }

      const [customersFromAppointments2, customersFromOrders2] =
        await Promise.all([
          Appointment.distinct('customer_id', appointmentFilter2),
          Order.distinct('customer_id', orderFilter2),
        ]);

      const period2Customers = new Set([
        ...customersFromAppointments2.map(id => id.toString()),
        ...customersFromOrders2.map(id => id.toString()),
      ]);

      // Calculate retention
      const retainedCustomers = [...period1Customers].filter(id =>
        period2Customers.has(id)
      ).length;

      const period1Count = period1Customers.size;
      const period2Count = period2Customers.size;
      const newCustomers = period2Count - retainedCustomers;

      const retentionRate =
        period1Count > 0
          ? ((retainedCustomers / period1Count) * 100).toFixed(2)
          : 0;

      const churnRate =
        period1Count > 0
          ? (((period1Count - retainedCustomers) / period1Count) * 100).toFixed(
              2
            )
          : 0;

      await logAdminActivity(
        req,
        'view_customer_retention_rate',
        'Viewed customer retention rate',
        'user_engagement_analytics',
        null
      );

      return {
        retentionRate: parseFloat(retentionRate),
        churnRate: parseFloat(churnRate),
        period1Customers: period1Count,
        period2Customers: period2Count,
        retainedCustomers,
        newCustomers,
        lostCustomers: period1Count - retainedCustomers,
        period1: { start: previousStart, end: start },
        period2: { start, end },
      };
    } catch (error) {
      console.error('Error in getCustomerRetentionRate:', error);
      throw error;
    }
  }

  /**
   * Get Dashboard Overview (All KPIs in one call)
   */
  async getDashboardOverview(query, req) {
    try {
      const [
        newCustomersTrends,
        customerActivityStatus,
        doctorApplications,
        doctorActivityTrends,
        topCustomers,
        retentionRate,
      ] = await Promise.all([
        this.getNewCustomersTrends(query, req),
        this.getCustomerActivityStatus(query, req),
        this.getDoctorApplicationsBreakdown(query, req),
        this.getDoctorActivityTrends(query, req),
        this.getTopCustomers(query, req),
        this.getCustomerRetentionRate(query, req),
      ]);

      return {
        newCustomersTrends,
        customerActivityStatus,
        doctorApplications,
        doctorActivityTrends,
        topCustomers,
        retentionRate,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }
}

export default new UserEngagementAnalyticsService();
