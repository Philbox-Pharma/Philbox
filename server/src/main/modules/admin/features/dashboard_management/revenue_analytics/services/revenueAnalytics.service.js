import mongoose from 'mongoose';
import Transaction from '../../../../../../models/Transaction.js';
import Branch from '../../../../../../models/Branch.js';
import Order from '../../../../../../models/Order.js';
import Appointment from '../../../../../../models/Appointment.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class RevenueAnalyticsService {
  /**
   * Helper to get branch filter based on admin category
   */
  async getBranchSpecificOrderIds(branchId, req) {
    const filter = {};

    // If branchId is provided in query, use it
    if (branchId) {
      filter.branch_id = new mongoose.Types.ObjectId(branchId);
    } else if (req.admin && req.admin.category === 'branch-admin') {
      // If branch admin and no specific branchId, use all managed branches
      const managedBranches = req.admin.branches_managed || [];
      if (managedBranches.length > 0) {
        filter.branch_id = {
          $in: managedBranches.map(id => new mongoose.Types.ObjectId(id)),
        };
      } else {
        // No branches managed? Return empty to avoid global data
        return [];
      }
    } else {
      // Super admin with no branchId filter -> see everything
      return null;
    }

    const orders = await Order.find(filter).select('_id');
    return orders.map(o => o._id);
  }

  /**
   * Get Revenue Trends (Daily/Weekly/Monthly)
   */
  async getRevenueTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily', branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // Build match filter
      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        payment_status: 'successful',
        transaction_type: 'pay',
      };

      // Handle branch restrictions
      const targetOrderIds = await this.getBranchSpecificOrderIds(branchId, req);
      if (targetOrderIds !== null) {
        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: targetOrderIds };
      }

      // Group by period
      let groupBy;
      let sortBy = { '_id.year': 1 };

      if (period === 'daily') {
        groupBy = {
          year: { $year: '$transaction_at' },
          month: { $month: '$transaction_at' },
          day: { $dayOfMonth: '$transaction_at' },
        };
        sortBy = { ...sortBy, '_id.month': 1, '_id.day': 1 };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$transaction_at' },
          week: { $week: '$transaction_at' },
        };
        sortBy = { ...sortBy, '_id.week': 1 };
      } else {
        // monthly
        groupBy = {
          year: { $year: '$transaction_at' },
          month: { $month: '$transaction_at' },
        };
        sortBy = { ...sortBy, '_id.month': 1 };
      }

      const trends = await Transaction.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            totalRevenue: { $sum: '$total_bill' },
            transactionCount: { $sum: 1 },
            appointmentRevenue: {
              $sum: {
                $cond: [
                  { $eq: ['$target_class', 'appointment'] },
                  '$total_bill',
                  0,
                ],
              },
            },
            orderRevenue: {
              $sum: {
                $cond: [{ $eq: ['$target_class', 'order'] }, '$total_bill', 0],
              },
            },
          },
        },
        { $sort: sortBy },
      ]);

      // Log activity
      await logAdminActivity(
        req,
        'view_revenue_trends',
        `Viewed revenue trends (${period})`,
        'revenue_analytics',
        null
      );

      return { trends, period, startDate: start, endDate: end };
    } catch (error) {
      console.error('Error in getRevenueTrends:', error);
      throw error;
    }
  }

  /**
   * Get Revenue Split: Appointments vs Orders (Pie Chart)
   */
  async getRevenueSplit(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        payment_status: 'successful',
        transaction_type: 'pay',
      };

      // Handle branch restrictions
      const targetOrderIds = await this.getBranchSpecificOrderIds(branchId, req);
      if (targetOrderIds !== null) {
        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: targetOrderIds };
      }

      const split = await Transaction.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$target_class',
            revenue: { $sum: '$total_bill' },
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        appointment: { revenue: 0, count: 0 },
        order: { revenue: 0, count: 0 },
        total: { revenue: 0, count: 0 },
      };

      split.forEach(item => {
        if (result[item._id]) {
          result[item._id] = {
            revenue: item.revenue,
            count: item.count,
          };
          result.total.revenue += item.revenue;
          result.total.count += item.count;
        }
      });

      result.appointment.percentage =
        result.total.revenue > 0
          ? ((result.appointment.revenue / result.total.revenue) * 100).toFixed(
              2
            )
          : 0;
      result.order.percentage =
        result.total.revenue > 0
          ? ((result.order.revenue / result.total.revenue) * 100).toFixed(2)
          : 0;

      await logAdminActivity(
        req,
        'view_revenue_split',
        'Viewed revenue split (appointments vs orders)',
        'revenue_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getRevenueSplit:', error);
      throw error;
    }
  }

  /**
   * Get Top Performing Branches by Revenue (Bar Chart - Super Admin Only)
   */
  async getTopBranchesByRevenue(query, req) {
    try {
      const { startDate, endDate, limit = 5 } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const topBranches = await Transaction.aggregate([
        {
          $match: {
            transaction_at: { $gte: start, $lte: end },
            payment_status: 'successful',
            transaction_type: 'pay',
            target_class: 'order',
          },
        },
        {
          $lookup: {
            from: 'orders',
            localField: 'target_id',
            foreignField: '_id',
            as: 'order_details',
          },
        },
        { $unwind: '$order_details' },
        {
          $group: {
            _id: '$order_details.branch_id',
            revenue: { $sum: '$total_bill' },
            transactionCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'branches',
            localField: '_id',
            foreignField: '_id',
            as: 'branch_info',
          },
        },
        { $unwind: '$branch_info' },
        {
          $project: {
            branchId: '$_id',
            name: '$branch_info.name',
            code: '$branch_info.code',
            revenue: 1,
            transactionCount: 1,
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: parseInt(limit) },
      ]);

      await logAdminActivity(
        req,
        'view_top_branches_revenue',
        'Viewed top branches by revenue',
        'revenue_analytics',
        null
      );

      return topBranches;
    } catch (error) {
      console.error('Error in getTopBranchesByRevenue:', error);
      throw error;
    }
  }

  /**
   * Get Refund Statistics (Bar Chart)
   */
  async getRefundStatistics(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        transaction_type: 'refund',
        payment_status: 'successful',
      };

      // Handle branch restrictions
      const targetOrderIds = await this.getBranchSpecificOrderIds(branchId, req);
      if (targetOrderIds !== null) {
        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: targetOrderIds };
      }

      const refundStats = await Transaction.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$target_class',
            totalRefundAmount: { $sum: '$refund_amount' },
            refundCount: { $sum: 1 },
          },
        },
      ]);

      const result = {
        appointment: { amount: 0, count: 0 },
        order: { amount: 0, count: 0 },
        total: { amount: 0, count: 0 },
      };

      refundStats.forEach(item => {
        if (result[item._id]) {
          result[item._id] = {
            amount: item.totalRefundAmount,
            count: item.refundCount,
          };
          result.total.amount += item.totalRefundAmount;
          result.total.count += item.refundCount;
        }
      });

      await logAdminActivity(
        req,
        'view_refund_statistics',
        'Viewed refund statistics',
        'revenue_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getRefundStatistics:', error);
      throw error;
    }
  }

  /**
   * Get Average Revenue Per Customer (KPI)
   */
  async getAverageRevenuePerCustomer(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        payment_status: 'successful',
        transaction_type: 'pay',
      };

      // Handle branch restrictions
      const targetOrderIds = await this.getBranchSpecificOrderIds(branchId, req);
      if (targetOrderIds !== null) {
        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: targetOrderIds };
      }

      const customerStats = await Transaction.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'orders',
            localField: 'target_id',
            foreignField: '_id',
            as: 'order_info',
          },
        },
        {
          $lookup: {
            from: 'appointments',
            localField: 'target_id',
            foreignField: '_id',
            as: 'appointment_info',
          },
        },
        {
          $project: {
            total_bill: 1,
            customer_id: {
              $ifNull: [
                { $arrayElemAt: ['$order_info.customer_id', 0] },
                { $arrayElemAt: ['$appointment_info.patient_id', 0] },
              ],
            },
          },
        },
        { $match: { customer_id: { $ne: null } } },
        {
          $group: {
            _id: '$customer_id',
            totalSpent: { $sum: '$total_bill' },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalSpent' },
            totalCustomers: { $sum: 1 },
          },
        },
      ]);

      const result =
        customerStats.length > 0
          ? {
              totalRevenue: customerStats[0].totalRevenue,
              totalCustomers: customerStats[0].totalCustomers,
              averageRevenue: parseFloat(
                (
                  customerStats[0].totalRevenue / customerStats[0].totalCustomers
                ).toFixed(2)
              ),
            }
          : { totalRevenue: 0, totalCustomers: 0, averageRevenue: 0 };

      await logAdminActivity(
        req,
        'view_average_revenue_per_customer',
        'Viewed average revenue per customer',
        'revenue_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getAverageRevenuePerCustomer:', error);
      throw error;
    }
  }

  /**
   * Get Payment Method Breakdown (Pie Chart)
   */
  async getPaymentMethodBreakdown(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        payment_status: 'successful',
        transaction_type: 'pay',
      };

      // Handle branch restrictions
      const targetOrderIds = await this.getBranchSpecificOrderIds(branchId, req);
      if (targetOrderIds !== null) {
        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: targetOrderIds };
      }

      const breakdown = await Transaction.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$payment_method',
            revenue: { $sum: '$total_bill' },
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        total: { revenue: 0, count: 0 },
      };

      breakdown.forEach(item => {
        result[item._id] = {
          revenue: item.revenue,
          count: item.count,
        };
        result.total.revenue += item.revenue;
        result.total.count += item.count;
      });

      // Calculate percentages and ensure standard keys exist (even if 0)
      const standardMethods = [
        'Stripe-Card',
        'JazzCash-Wallet',
        'EasyPaisa-Wallet',
      ];
      standardMethods.forEach(method => {
        if (!result[method]) {
          result[method] = { revenue: 0, count: 0, percentage: 0 };
        } else {
          result[method].percentage =
            result.total.revenue > 0
              ? ((result[method].revenue / result.total.revenue) * 100).toFixed(
                  2
                )
              : 0;
        }
      });

      await logAdminActivity(
        req,
        'view_payment_method_breakdown',
        'Viewed payment method breakdown',
        'revenue_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getPaymentMethodBreakdown:', error);
      throw error;
    }
  }

  /**
   * Get Dashboard Overview (All KPIs in one call)
   */
  async getDashboardOverview(query, req) {
    try {
      const [
        trends,
        revenueSplit,
        topBranches,
        refundStats,
        avgRevenuePerCustomer,
        paymentMethodBreakdown,
      ] = await Promise.all([
        this.getRevenueTrends(query, req),
        this.getRevenueSplit(query, req),
        req.admin && req.admin.category === 'super-admin'
          ? this.getTopBranchesByRevenue(query, req)
          : Promise.resolve([]),
        this.getRefundStatistics(query, req),
        this.getAverageRevenuePerCustomer(query, req),
        this.getPaymentMethodBreakdown(query, req),
      ]);

      return {
        trends,
        revenueSplit,
        topBranches,
        refundStats,
        avgRevenuePerCustomer,
        paymentMethodBreakdown,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }
}

export default new RevenueAnalyticsService();
