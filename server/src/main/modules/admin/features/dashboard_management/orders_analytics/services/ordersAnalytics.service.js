import Order from '../../../../../../models/Order.js';
import OrderItem from '../../../../../../models/OrderItem.js';
import StockInHand from '../../../../../../models/StockInHand.js';
import MedicineBatch from '../../../../../../models/MedicineBatch.js';
import Transaction from '../../../../../../models/Transaction.js';
import MedicineItem from '../../../../../../models/MedicineItem.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class OrdersAnalyticsService {
  /**
   * Get Orders Trends (Daily/Weekly/Monthly)
   */
  async getOrdersTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily', branchId } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      if (branchId) {
        matchFilter.branch_id = branchId;
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
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
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

      if (branchId) {
        matchFilter.branch_id = branchId;
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
        status: { $in: ['delivered'] },
      };

      if (branchId) {
        matchFilter.branch_id = branchId;
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
            from: 'medicineitems',
            localField: '_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        { $unwind: '$medicine' },
        {
          $project: {
            _id: 1,
            medicineName: '$medicine.Name',
            medicineCategory: '$medicine.medicine_category',
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

      const lowStockItems = await StockInHand.find(lowStockFilter)
        .populate({
          path: 'medicine_id',
          match: branchId ? { branch_id: branchId } : {},
          select: 'Name branch_id medicine_category img_url',
        })
        .limit(parseInt(limit))
        .sort({ quantity: 1 });

      // Filter out null medicines (from branch filter)
      const filteredLowStock = lowStockItems
        .filter(item => item.medicine_id !== null)
        .map(item => ({
          medicineId: item.medicine_id._id,
          medicineName: item.medicine_id.Name,
          category: item.medicine_id.medicine_category,
          currentStock: item.quantity,
          alertType: 'low_stock',
          imgUrl: item.medicine_id.img_url,
        }));

      // Get expiring stock (expiry within 30 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const expiringBatches = await MedicineBatch.find({
        expiry: { $lte: expiryDate, $gte: new Date() },
      })
        .populate({
          path: 'medicine_id',
          match: branchId ? { branch_id: branchId } : {},
          select: 'Name branch_id medicine_category img_url',
        })
        .limit(parseInt(limit))
        .sort({ expiry: 1 });

      const filteredExpiringStock = expiringBatches
        .filter(batch => batch.medicine_id !== null)
        .map(batch => ({
          medicineId: batch.medicine_id._id,
          medicineName: batch.medicine_id.Name,
          category: batch.medicine_id.medicine_category,
          currentStock: batch.quantity,
          expiryDate: batch.expiry,
          alertType: 'expiring_soon',
          daysUntilExpiry: Math.ceil(
            (batch.expiry - new Date()) / (1000 * 60 * 60 * 24)
          ),
          imgUrl: batch.medicine_id.img_url,
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
        expiringStock: filteredExpiringStock,
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
        status: 'delivered',
      };

      if (branchId) {
        matchFilter.branch_id = branchId;
      }

      const orders = await Order.find(matchFilter).select('_id');
      const orderIds = orders.map(o => o._id);

      const categoryRevenue = await OrderItem.aggregate([
        { $match: { order_id: { $in: orderIds } } },
        {
          $lookup: {
            from: 'medicineitems',
            localField: 'medicine_item_id',
            foreignField: '_id',
            as: 'medicine',
          },
        },
        { $unwind: '$medicine' },
        {
          $group: {
            _id: '$medicine.medicine_category',
            revenue: { $sum: { $multiply: ['$quantity', '$price'] } },
            itemCount: { $sum: 1 },
          },
        },
      ]);

      // Get all distinct categories from MedicineItem schema enum
      const categoryEnum =
        MedicineItem.schema.path('medicine_category').enumValues || [];

      // Initialize result object dynamically
      const result = {
        total: { revenue: 0, itemCount: 0 },
      };

      // Add each category from enum
      categoryEnum.forEach(category => {
        result[category] = { revenue: 0, itemCount: 0, percentage: 0 };
      });

      // Populate with actual data
      categoryRevenue.forEach(item => {
        if (item._id) {
          result[item._id] = {
            revenue: item.revenue,
            itemCount: item.itemCount,
          };
          result.total.revenue += item.revenue;
          result.total.itemCount += item.itemCount;
        }
      });

      // Calculate percentages for each category
      categoryEnum.forEach(category => {
        result[category].percentage =
          result.total.revenue > 0
            ? ((result[category].revenue / result.total.revenue) * 100).toFixed(
                2
              )
            : 0;
      });

      await logAdminActivity(
        req,
        'view_revenue_by_category',
        'Viewed revenue by medicine category',
        'orders_analytics',
        null
      );

      return result;
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

      if (branchId) {
        matchFilter.branch_id = branchId;
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
