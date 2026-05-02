import Order from '../../../../../../models/Order.js';
import OrderItem from '../../../../../../models/OrderItem.js';
import StockInHand from '../../../../../../models/StockInHand.js';
import Transaction from '../../../../../../models/Transaction.js';
import mongoose from 'mongoose';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class OrdersAnalyticsService {
  /**
   * Get Orders Trends (Daily/Weekly/Monthly)
   */
  async getOrdersTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily', branchId } = query;
      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Branch security scoping
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        matchFilter.branch_id = { 
          $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) 
        };
      } else if (branchId) {
        matchFilter.branch_id = new mongoose.Types.ObjectId(branchId);
      }

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

      const trends = await Order.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            processingOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'processing'] }, 1, 0],
              },
            },
            deliveredOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            cancelledOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled-by-customer'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      await logAdminActivity(
        req,
        'view_orders_trends',
        `Viewed orders trends (${period})`,
        'orders_analytics',
        null
      );

      return { trends, period, startDate: start, endDate: end };
    } catch (error) {
      console.error('Error in getOrdersTrends:', error);
      throw error;
    }
  }

  /**
   * Get Order Status Breakdown (Pie Chart)
   */
  async getOrderStatusBreakdown(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];

      // Branch security scoping
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        matchFilter.branch_id = { 
          $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) 
        };
      } else if (branchId) {
        matchFilter.branch_id = new mongoose.Types.ObjectId(branchId);
      }

      const breakdown = await Order.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        pending: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0,
        total: 0,
      };

      breakdown.forEach(item => {
        // Map 'completed' to 'delivered' and 'cancelled-by-customer' to 'cancelled'
        if (item._id === 'completed') {
          result.delivered = item.count;
        } else if (item._id === 'cancelled-by-customer') {
          result.cancelled = item.count;
        } else if (result.hasOwnProperty(item._id)) {
          result[item._id] = item.count;
        }
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
        'view_order_status_breakdown',
        'Viewed order status breakdown',
        'orders_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getOrderStatusBreakdown:', error);
      throw error;
    }
  }

  /**
   * Get Top Selling Medicines (Ranked List)
   */
  async getTopSellingMedicines(query, req) {
    try {
      const { startDate, endDate, branchId, limit = 10 } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
        status: { $in: ['completed'] }, // Only count completed orders
      };

      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];

      // Branch security scoping
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        matchFilter.branch_id = { 
          $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) 
        };
      } else if (branchId) {
        matchFilter.branch_id = new mongoose.Types.ObjectId(branchId);
      }

      const orders = await Order.find(matchFilter).select('_id');
      const orderIds = orders.map(o => o._id);

      const topMedicines = await OrderItem.aggregate([
        { $match: { order_id: { $in: orderIds } } },
        {
          $group: {
            _id: '$medicine_item_id',
            totalQuantitySold: { $sum: '$quantity' },
            totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'medicines',
            localField: '_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        { $unwind: '$medicine' },
        {
          $lookup: {
            from: 'medicinecategories',
            localField: 'medicine.category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            medicineName: '$medicine.Name',
            medicineCategory: '$category.name',
            totalQuantitySold: 1,
            totalRevenue: 1,
            orderCount: 1,
            imgUrl: '$medicine.img_url',
          },
        },
      ]);

      await logAdminActivity(
        req,
        'view_top_selling_medicines',
        'Viewed top selling medicines',
        'orders_analytics',
        null
      );

      return topMedicines;
    } catch (error) {
      console.error('Error in getTopSellingMedicines:', error);
      throw error;
    }
  }

  /**
   * Get Stock Alerts: Low/Expiring Stock (Table)
   */
  async getStockAlerts(query, req) {
    try {
      const { branchId, limit = 20 } = query;

      // Get low stock items (quantity < 10)
      const lowStockFilter = { quantity: { $lt: 10 } };
      
      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];
      
      let branchFilter = {};
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        branchFilter = { branch_id: { $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) } };
      } else if (branchId) {
        branchFilter = { branch_id: new mongoose.Types.ObjectId(branchId) };
      }

      const lowStockItems = await StockInHand.find(lowStockFilter)
        .populate({
          path: 'medicine_id',
          match: branchFilter,
          select: 'Name branch_id category img_url',
          populate: {
            path: 'category',
            select: 'name',
          },
        })
        .limit(parseInt(limit))
        .sort({ quantity: 1 });

      // Filter out null medicines (from branch filter)
      const filteredLowStock = lowStockItems
        .filter(item => item.medicine_id !== null)
        .map(item => ({
          name: item.medicine_id.Name,
          stock: item.quantity,
          medicineId: item.medicine_id._id,
          medicineName: item.medicine_id.Name,
          category: item.medicine_id.category?.name || null,
          currentStock: item.quantity,
          alertType: 'low_stock',
          imgUrl: item.medicine_id.img_url,
        }));

      await logAdminActivity(
        req,
        'view_stock_alerts',
        'Viewed stock alerts',
        'orders_analytics',
        null
      );

      return {
        lowStock: filteredLowStock,
        expiringStock: [],
      };
    } catch (error) {
      console.error('Error in getStockAlerts:', error);
      throw error;
    }
  }

  /**
   * Get Revenue Per Medicine Category (Pie Chart)
   */
  async getRevenueByCategory(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
        status: 'completed', // Only revenue from completed orders
      };

      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];

      // Branch security scoping
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        matchFilter.branch_id = { 
          $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) 
        };
      } else if (branchId) {
        matchFilter.branch_id = new mongoose.Types.ObjectId(branchId);
      }

      const orders = await Order.find(matchFilter).select('_id');
      const orderIds = orders.map(o => o._id);

      const categoryRevenue = await OrderItem.aggregate([
        { $match: { order_id: { $in: orderIds } } },
        {
          $lookup: {
            from: 'medicines',
            localField: 'medicine_item_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        { $unwind: '$medicine' },
        {
          $lookup: {
            from: 'medicinecategories',
            localField: 'medicine.category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $ifNull: ['$category.name', 'Uncategorized'] },
            revenue: { $sum: { $multiply: ['$quantity', '$price'] } },
            itemCount: { $sum: 1 },
          },
        },
      ]);

      // Calculate total revenue
      let totalRevenue = 0;
      const categories = categoryRevenue.map(item => {
        totalRevenue += item.revenue;
        return {
          category: item._id,
          revenue: item.revenue,
          itemCount: item.itemCount,
        };
      });

      // Add percentage for each category
      const result = categories.map(cat => ({
        ...cat,
        percentage:
          totalRevenue > 0
            ? ((cat.revenue / totalRevenue) * 100).toFixed(2)
            : 0,
      }));

      // Also include total in the response structure for backward compatibility
      result.total = {
        revenue: totalRevenue,
        itemCount: categories.reduce((sum, cat) => sum + cat.itemCount, 0),
      };

      // Store as object for backward compatibility
      const resultObj = {
        total: result.total,
      };

      categories.forEach(cat => {
        resultObj[cat.category] = {
          revenue: cat.revenue,
          itemCount: cat.itemCount,
          percentage: cat.percentage,
        };
      });

      await logAdminActivity(
        req,
        'view_revenue_by_category',
        'Viewed revenue by medicine category',
        'orders_analytics',
        null
      );

      return resultObj;
    } catch (error) {
      console.error('Error in getRevenueByCategory:', error);
      throw error;
    }
  }

  /**
   * Get Order Refund Rates (KPI)
   */
  async getOrderRefundRate(query, req) {
    try {
      const { startDate, endDate, branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      const adminCategory = req.admin?.category;
      const adminBranchesManaged = req.admin?.branches_managed || [];

      // Branch security scoping
      if (adminCategory === 'branch-admin' && adminBranchesManaged.length > 0) {
        matchFilter.branch_id = { 
          $in: adminBranchesManaged.map(id => new mongoose.Types.ObjectId(id)) 
        };
      } else if (branchId) {
        matchFilter.branch_id = new mongoose.Types.ObjectId(branchId);
      }

      // Get all orders in the period
      const orders = await Order.find(matchFilter).select('_id');
      const orderIds = orders.map(o => o._id);

      // Count refunded orders
      const refunds = await Transaction.countDocuments({
        transaction_at: { $gte: start, $lte: end },
        target_class: 'order',
        target_id: { $in: orderIds },
        transaction_type: 'refund',
        payment_status: 'successful',
      });

      const totalOrders = orders.length;
      const refundRate =
        totalOrders > 0 ? ((refunds / totalOrders) * 100).toFixed(2) : 0;

      // Get total refund amount
      const refundAmount = await Transaction.aggregate([
        {
          $match: {
            transaction_at: { $gte: start, $lte: end },
            target_class: 'order',
            target_id: { $in: orderIds },
            transaction_type: 'refund',
            payment_status: 'successful',
          },
        },
        {
          $group: {
            _id: null,
            totalRefundAmount: { $sum: '$refund_amount' },
          },
        },
      ]);

      await logAdminActivity(
        req,
        'view_order_refund_rate',
        'Viewed order refund rate',
        'orders_analytics',
        null
      );

      return {
        totalOrders,
        refundedOrders: refunds,
        refundRate: parseFloat(refundRate),
        totalRefundAmount:
          refundAmount.length > 0 ? refundAmount[0].totalRefundAmount : 0,
      };
    } catch (error) {
      console.error('Error in getOrderRefundRate:', error);
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
        statusBreakdown,
        topMedicines,
        stockAlerts,
        revenueByCategory,
        refundRate,
      ] = await Promise.all([
        this.getOrdersTrends(query, req),
        this.getOrderStatusBreakdown(query, req),
        this.getTopSellingMedicines(query, req),
        this.getStockAlerts(query, req),
        this.getRevenueByCategory(query, req),
        this.getOrderRefundRate(query, req),
      ]);

      return {
        trends,
        statusBreakdown,
        topMedicines,
        stockAlerts,
        revenueByCategory,
        refundRate,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }
}

export default new OrdersAnalyticsService();
