import Transaction from '../../../../../../models/Transaction.js';
import Branch from '../../../../../../models/Branch.js';
import Order from '../../../../../../models/Order.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class RevenueAnalyticsService {
  /**
   * Get Revenue Trends (Daily/Weekly/Monthly)
   */
  async getRevenueTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily', branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      const end = endDate ? new Date(endDate) : new Date();

      // Build match filter
      const matchFilter = {
        transaction_at: { $gte: start, $lte: end },
        payment_status: 'successful',
        transaction_type: 'pay',
      };

      // If branch admin or filtering by branch (orders only, appointments are not branch-specific)
      if (branchId) {
        const branchOrders = await Order.find({ branch_id: branchId }).select(
          '_id'
        );

        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: branchOrders.map(o => o._id) };
      }

      // Group by period
      let groupBy;
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$transaction_at' },
          month: { $month: '$transaction_at' },
          day: { $dayOfMonth: '$transaction_at' },
        };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$transaction_at' },
          week: { $week: '$transaction_at' },
        };
      } else {
        // monthly
        groupBy = {
          year: { $year: '$transaction_at' },
          month: { $month: '$transaction_at' },
        };
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
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
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

      if (branchId) {
        const branchOrders = await Order.find({ branch_id: branchId }).select(
          '_id'
        );

        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: branchOrders.map(o => o._id) };
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
        result[item._id] = {
          revenue: item.revenue,
          count: item.count,
        };
        result.total.revenue += item.revenue;
        result.total.count += item.count;
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

      // Get all branches with their transactions
      const branches = await Branch.find({ status: 'Active' });

      const branchRevenues = [];

      for (const branch of branches) {
        // Get orders for this branch (appointments are not branch-specific)
        const branchOrders = await Order.find({
          branch_id: branch._id,
        }).select('_id');

        const targetIds = branchOrders.map(o => o._id);

        if (targetIds.length > 0) {
          const revenue = await Transaction.aggregate([
            {
              $match: {
                transaction_at: { $gte: start, $lte: end },
                payment_status: 'successful',
                transaction_type: 'pay',
                target_id: { $in: targetIds },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total_bill' },
                transactionCount: { $sum: 1 },
              },
            },
          ]);

          if (revenue.length > 0) {
            branchRevenues.push({
              branchId: branch._id,
              branchName: branch.name,
              address: branch.address_id,
              totalRevenue: revenue[0].totalRevenue,
              transactionCount: revenue[0].transactionCount,
            });
          }
        }
      }

      // Sort by revenue and limit
      const topBranches = branchRevenues
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, parseInt(limit));

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

      if (branchId) {
        const branchOrders = await Order.find({ branch_id: branchId }).select(
          '_id'
        );

        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: branchOrders.map(o => o._id) };
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
        result[item._id] = {
          amount: item.totalRefundAmount,
          count: item.refundCount,
        };
        result.total.amount += item.totalRefundAmount;
        result.total.count += item.refundCount;
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

      if (branchId) {
        const branchOrders = await Order.find({ branch_id: branchId }).select(
          '_id'
        );

        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: branchOrders.map(o => o._id) };
      }

      // Get unique customers who made transactions
      const transactions = await Transaction.find(matchFilter).populate([
        {
          path: 'target_id',
          select: 'customer_id',
        },
      ]);

      const customerRevenues = {};

      transactions.forEach(transaction => {
        if (transaction.target_id && transaction.target_id.customer_id) {
          const customerId = transaction.target_id.customer_id.toString();
          if (!customerRevenues[customerId]) {
            customerRevenues[customerId] = 0;
          }
          customerRevenues[customerId] += transaction.total_bill;
        }
      });

      const totalCustomers = Object.keys(customerRevenues).length;
      const totalRevenue = Object.values(customerRevenues).reduce(
        (sum, rev) => sum + rev,
        0
      );
      const averageRevenue =
        totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(2) : 0;

      await logAdminActivity(
        req,
        'view_average_revenue_per_customer',
        'Viewed average revenue per customer',
        'revenue_analytics',
        null
      );

      return {
        totalRevenue,
        totalCustomers,
        averageRevenue: parseFloat(averageRevenue),
      };
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

      if (branchId) {
        const branchOrders = await Order.find({ branch_id: branchId }).select(
          '_id'
        );

        matchFilter.target_class = 'order';
        matchFilter.target_id = { $in: branchOrders.map(o => o._id) };
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
        'Stripe-Card': { revenue: 0, count: 0 },
        'JazzCash-Wallet': { revenue: 0, count: 0 },
        'EasyPaisa-Wallet': { revenue: 0, count: 0 },
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

      // Calculate percentages
      Object.keys(result).forEach(key => {
        if (key !== 'total') {
          result[key].percentage =
            result.total.revenue > 0
              ? ((result[key].revenue / result.total.revenue) * 100).toFixed(2)
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
