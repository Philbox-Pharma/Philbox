import Customer from '../../../../../models/Customer.js';
import Order from '../../../../../models/Order.js';
import Review from '../../../../../models/Review.js';
import Complaint from '../../../../../models/Complaint.js';
import CustomerActivityLog from '../../../../../models/CustomerActivityLog.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import { paginate } from '../../../../../utils/paginate.js';

class CustomerManagementService {
  /**
   * Get All Customers with filters, search, and pagination
   * Branch admins only see customers from their branches
   */
  async getCustomers(query, req) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        account_status,
        is_Verified,
        startDate,
        endDate,
        branchId,
      } = query;

      // Build query filter
      const filter = {};

      // Branch admin restriction: only see customers who have placed orders in their branches
      if (req.admin && req.admin.category === 'branch-admin') {
        const branchIds = req.admin.branches_managed || [];

        // Find orders from these branches to get customer IDs
        const ordersInBranches = await Order.find({
          branch_id: { $in: branchIds },
        }).distinct('customer_id');

        filter._id = { $in: ordersInBranches };
      } else if (branchId) {
        // Super admin can filter by specific branch
        const ordersInBranch = await Order.find({
          branch_id: branchId,
        }).distinct('customer_id');

        filter._id = { $in: ordersInBranch };
      }

      // Apply filters
      if (account_status) {
        filter.account_status = account_status;
      }

      if (is_Verified !== undefined) {
        filter.is_Verified = is_Verified === 'true';
      }

      // Date range filter
      if (startDate || endDate) {
        filter.created_at = {};
        if (startDate) filter.created_at.$gte = new Date(startDate);
        if (endDate) filter.created_at.$lte = new Date(endDate);
      }

      // Apply search if provided
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const populate = [
        {
          path: 'address_id',
          select: 'street city state country zipCode',
        },
        {
          path: 'roleId',
          select: 'name permissions',
        },
      ];

      const result = await paginate(
        Customer,
        filter,
        page,
        limit,
        populate,
        { created_at: -1 },
        '-passwordHash -refreshTokens -verificationToken -resetPasswordToken'
      );

      // Log admin activity
      await logAdminActivity(
        req,
        'view_customers',
        `Viewed customers list (page: ${page}, filters: ${JSON.stringify({ account_status, is_Verified })})`,
        'customers',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getCustomers:', error);
      throw error;
    }
  }

  /**
   * Get Single Customer by ID with all related data
   * Populates orders, reviews, complaints, and activity logs
   */
  async getCustomerById(customerId, req) {
    try {
      const customer = await Customer.findById(customerId)
        .select(
          '-passwordHash -refreshTokens -verificationToken -resetPasswordToken'
        )
        .populate({
          path: 'address_id',
          select: 'street city state country zipCode',
        })
        .populate({
          path: 'roleId',
          select: 'name permissions',
        });

      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }

      // Branch admin validation: check if customer has ordered from their branches
      if (req.admin && req.admin.category === 'branch-admin') {
        const branchIds = req.admin.branches_managed || [];
        const customerOrders = await Order.findOne({
          customer_id: customerId,
          branch_id: { $in: branchIds },
        });

        if (!customerOrders) {
          throw new Error('UNAUTHORIZED_ACCESS');
        }
      }

      // Fetch all customer orders with populated data
      const orders = await Order.find({ customer_id: customerId })
        .populate({
          path: 'branch_id',
          select: 'name location contactNumber',
        })
        .populate({
          path: 'salesperson_id',
          select: 'fullName email contactNumber',
        })
        .populate({
          path: 'order_items',
          select: 'product_name quantity price total',
        })
        .sort({ created_at: -1 })
        .limit(50);

      // Fetch all customer reviews
      const reviews = await Review.find({ customer_id: customerId })
        .sort({ created_at: -1 })
        .limit(50);

      // Fetch all customer complaints
      const complaints = await Complaint.find({ customer_id: customerId })
        .populate({
          path: 'branch_admin_id',
          select: 'name email',
        })
        .populate({
          path: 'super_admin_id',
          select: 'name email',
        })
        .sort({ created_at: -1 })
        .limit(50);

      // Fetch recent activity logs
      const activityLogs = await CustomerActivityLog.find({
        customer_id: customerId,
      })
        .sort({ timestamp: -1 })
        .limit(100);

      // Calculate metrics
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          : 0;
      const totalComplaints = complaints.length;
      const openComplaints = complaints.filter(
        c => c.status === 'pending' || c.status === 'in_progress'
      ).length;

      // Log admin activity
      await logAdminActivity(
        req,
        'view_customer_details',
        `Viewed detailed information for customer: ${customer.email}`,
        'customers',
        customer._id
      );

      return {
        customer,
        orders,
        reviews,
        complaints,
        activityLogs,
        metrics: {
          totalOrders,
          totalSpent,
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalComplaints,
          openComplaints,
        },
      };
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  }

  /**
   * Toggle Customer Account Status (activate/deactivate)
   */
  async toggleCustomerStatus(customerId, newStatus, reason, req) {
    try {
      const customer = await Customer.findById(customerId);

      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }

      // Validate status
      const validStatuses = ['active', 'suspended/freezed', 'blocked/removed'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('INVALID_STATUS');
      }

      const oldStatus = customer.account_status;
      customer.account_status = newStatus;
      await customer.save();

      // Log admin activity
      await logAdminActivity(
        req,
        'update_customer_status',
        `Changed customer status from ${oldStatus} to ${newStatus}. Reason: ${reason || 'N/A'}`,
        'customers',
        customer._id
      );

      return {
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          account_status: customer.account_status,
        },
        message: `Customer account status updated to ${newStatus}`,
      };
    } catch (error) {
      console.error('Error in toggleCustomerStatus:', error);
      throw error;
    }
  }

  /**
   * Get Customer Metrics/Analytics
   * Provides overall statistics about customers
   */
  async getCustomerMetrics(branchId, req) {
    try {
      let customerFilter = {};

      // Branch admin restriction
      if (req.admin && req.admin.category === 'branch-admin') {
        const branchIds = req.admin.branches_managed || [];
        const ordersInBranches = await Order.find({
          branch_id: { $in: branchIds },
        }).distinct('customer_id');
        customerFilter._id = { $in: ordersInBranches };
      } else if (branchId) {
        const ordersInBranch = await Order.find({
          branch_id: branchId,
        }).distinct('customer_id');
        customerFilter._id = { $in: ordersInBranch };
      }

      // Total customers count
      const totalCustomers = await Customer.countDocuments(customerFilter);

      // Active customers
      const activeCustomers = await Customer.countDocuments({
        ...customerFilter,
        account_status: 'active',
      });

      // Verified customers
      const verifiedCustomers = await Customer.countDocuments({
        ...customerFilter,
        is_Verified: true,
      });

      // New customers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newCustomers = await Customer.countDocuments({
        ...customerFilter,
        created_at: { $gte: thirtyDaysAgo },
      });

      // Total orders
      let orderFilter = {};
      if (req.admin && req.admin.category === 'branch-admin') {
        const branchIds = req.admin.branches_managed || [];
        orderFilter.branch_id = { $in: branchIds };
      } else if (branchId) {
        orderFilter.branch_id = branchId;
      }

      const totalOrders = await Order.countDocuments(orderFilter);

      // Total revenue
      const revenueData = await Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
          },
        },
      ]);
      const totalRevenue =
        revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

      // Average order value
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Total reviews
      let reviewFilter = {};
      if (customerFilter._id) {
        reviewFilter.customer_id = customerFilter._id;
      }
      const totalReviews = await Review.countDocuments(reviewFilter);

      // Average rating
      const ratingData = await Review.aggregate([
        { $match: reviewFilter },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
          },
        },
      ]);
      const averageRating =
        ratingData.length > 0 ? ratingData[0].averageRating : 0;

      // Total complaints
      let complaintFilter = {};
      if (customerFilter._id) {
        complaintFilter.customer_id = customerFilter._id;
      }
      const totalComplaints = await Complaint.countDocuments(complaintFilter);
      const openComplaints = await Complaint.countDocuments({
        ...complaintFilter,
        status: { $in: ['pending', 'in_progress'] },
      });

      // Log admin activity
      await logAdminActivity(
        req,
        'view_customer_metrics',
        'Viewed customer analytics and metrics',
        'customers',
        null
      );

      return {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          verified: verifiedCustomers,
          new: newCustomers,
        },
        orders: {
          total: totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        },
        reviews: {
          total: totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)),
        },
        complaints: {
          total: totalComplaints,
          open: openComplaints,
          resolved: totalComplaints - openComplaints,
        },
      };
    } catch (error) {
      console.error('Error in getCustomerMetrics:', error);
      throw error;
    }
  }
}

export default new CustomerManagementService();
