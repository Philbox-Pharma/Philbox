import Branch from '../../../../../models/Branch.js';
import Admin from '../../../../../models/Admin.js';
import Salesperson from '../../../../../models/Salesperson.js';
import Order from '../../../../../models/Order.js';
import Review from '../../../../../models/Review.js';
import Complaint from '../../../../../models/Complaint.js';
import { seedAddress } from '../../../utils/seedAddress.js';
import { paginate } from '../../../../../utils/paginate.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class BranchService {
  /**
   * Generate unique branch code for the current year
   */
  async generateBranchCode() {
    // Determine current year (last two digits)
    const year = new Date().getFullYear().toString().slice(-2); // "25" for 2025

    // Find last branch code for this year
    const regex = new RegExp(`^PHIL${year}#(\\d+)$`);
    const lastBranch = await Branch.findOne({ code: { $regex: regex } })
      .sort({ created_at: -1 })
      .select('code');

    let nextNumber = 1;
    if (lastBranch && lastBranch.code) {
      const match = lastBranch.code.match(/#(\d+)$/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }

    // Generate new unique code
    const code = `PHIL${year}#${String(nextNumber).padStart(3, '0')}`;
    return code;
  }

  /**
   * Create a new branch
   */
  async createBranch(data, req) {
    if (!data) {
      throw new Error('INVALID_DATA');
    }

    const {
      name,
      street = '',
      town = '',
      city = '',
      province = '',
      zip_code = '',
      country = '',
      google_map_link = '',
      under_administration_of = [],
      salespersons_assigned = [],
    } = data;

    if (!name) {
      throw new Error('BRANCH_NAME_REQUIRED');
    }

    // Validate admins if provided
    if (under_administration_of.length > 0) {
      const adminCount = await Admin.countDocuments({
        _id: { $in: under_administration_of },
      });
      if (adminCount !== under_administration_of.length) {
        throw new Error('INVALID_ADMIN_IDS');
      }
    }

    // Validate salespersons if provided
    if (salespersons_assigned.length > 0) {
      const salespersonCount = await Salesperson.countDocuments({
        _id: { $in: salespersons_assigned },
      });
      if (salespersonCount !== salespersons_assigned.length) {
        throw new Error('INVALID_SALESPERSON_IDS');
      }
    }

    // Seed address
    const address_id = await seedAddress({
      street,
      town,
      city,
      province,
      zip_code,
      country,
      google_map_link,
    });

    // Generate unique code
    const code = await this.generateBranchCode();

    // Create and save branch
    const branch = new Branch({
      name,
      address_id,
      under_administration_of,
      salespersons_assigned,
      code,
    });

    await branch.save();

    // Update admins' branches_managed field
    if (under_administration_of.length > 0) {
      await Admin.updateMany(
        { _id: { $in: under_administration_of } },
        { $addToSet: { branches_managed: branch._id } }
      );
    }

    // Update salespersons' branches_to_be_managed field
    if (salespersons_assigned.length > 0) {
      await Salesperson.updateMany(
        { _id: { $in: salespersons_assigned } },
        { $addToSet: { branches_to_be_managed: branch._id } }
      );
    }

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'create_branch',
        `Created branch: ${branch.name} (${branch.code})`,
        'branches',
        branch._id,
        {
          branch_data: {
            name,
            code,
            under_administration_of,
            salespersons_assigned,
          },
        }
      );
    }

    return branch;
  }

  /**
   * List all branches with filtering and pagination
   */
  async listBranches(queryParams, req) {
    const { search = '', status, page = 1, limit = 10 } = queryParams;

    const query = {};

    // Search filter (by name or code)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const result = await paginate(Branch, query, page, limit, [
      'under_administration_of',
      'salespersons_assigned',
      'address_id',
    ]);

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_branches',
        `Viewed branch list (${result.total} branches, page ${result.currentPage})`,
        'branches',
        null,
        { query_params: { search, status, page, limit } }
      );
    }

    return {
      branches: result.list,
      pagination: {
        total: result.total,
        page: result.currentPage,
        pages: result.totalPages,
        limit: result.limit,
      },
    };
  }

  /**
   * Get a single branch by ID
   */
  async getBranchById(branchId, req) {
    const branch = await Branch.findById(branchId)
      .populate('under_administration_of', 'name email')
      .populate('salespersons_assigned', 'fullName email')
      .populate('address_id');

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_branch',
        `Viewed branch details: ${branch.name} (${branch.code})`,
        'branches',
        branch._id
      );
    }

    return branch;
  }

  /**
   * Update a branch
   */
  async updateBranch(branchId, updateData, req) {
    const {
      name,
      status,
      under_administration_of,
      salespersons_assigned,
      street,
      town,
      city,
      province,
      zip_code,
      country,
      google_map_link,
    } = updateData;

    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Store old values for logging
    const oldValues = {
      name: branch.name,
      status: branch.status,
      under_administration_of: branch.under_administration_of,
      salespersons_assigned: branch.salespersons_assigned,
    };

    // Handle admin assignment changes
    if (under_administration_of !== undefined) {
      // Validate new admins
      if (under_administration_of.length > 0) {
        const adminCount = await Admin.countDocuments({
          _id: { $in: under_administration_of },
        });
        if (adminCount !== under_administration_of.length) {
          throw new Error('INVALID_ADMIN_IDS');
        }
      }

      // Get old and new admin lists
      const oldAdmins = branch.under_administration_of.map(id => id.toString());
      const newAdmins = under_administration_of.map(id => id.toString());

      // Find admins to remove (in old but not in new)
      const adminsToRemove = oldAdmins.filter(id => !newAdmins.includes(id));

      // Find admins to add (in new but not in old)
      const adminsToAdd = newAdmins.filter(id => !oldAdmins.includes(id));

      // Remove branch from admins that are no longer assigned
      if (adminsToRemove.length > 0) {
        await Admin.updateMany(
          { _id: { $in: adminsToRemove } },
          { $pull: { branches_managed: branchId } }
        );
      }

      // Add branch to newly assigned admins
      if (adminsToAdd.length > 0) {
        await Admin.updateMany(
          { _id: { $in: adminsToAdd } },
          { $addToSet: { branches_managed: branchId } }
        );
      }

      branch.under_administration_of = under_administration_of;
    }

    // Handle salesperson assignment changes
    if (salespersons_assigned !== undefined) {
      // Validate new salespersons
      if (salespersons_assigned.length > 0) {
        const salespersonCount = await Salesperson.countDocuments({
          _id: { $in: salespersons_assigned },
        });
        if (salespersonCount !== salespersons_assigned.length) {
          throw new Error('INVALID_SALESPERSON_IDS');
        }
      }

      // Get old and new salesperson lists
      const oldSalespersons = branch.salespersons_assigned.map(id =>
        id.toString()
      );
      const newSalespersons = salespersons_assigned.map(id => id.toString());

      // Find salespersons to remove (in old but not in new)
      const salespersonsToRemove = oldSalespersons.filter(
        id => !newSalespersons.includes(id)
      );

      // Find salespersons to add (in new but not in old)
      const salespersonsToAdd = newSalespersons.filter(
        id => !oldSalespersons.includes(id)
      );

      // Remove branch from salespersons that are no longer assigned
      if (salespersonsToRemove.length > 0) {
        await Salesperson.updateMany(
          { _id: { $in: salespersonsToRemove } },
          { $pull: { branches_to_be_managed: branchId } }
        );
      }

      // Add branch to newly assigned salespersons
      if (salespersonsToAdd.length > 0) {
        await Salesperson.updateMany(
          { _id: { $in: salespersonsToAdd } },
          { $addToSet: { branches_to_be_managed: branchId } }
        );
      }

      branch.salespersons_assigned = salespersons_assigned;
    }

    // Update address if provided
    if (
      branch.address_id &&
      (street ||
        town ||
        city ||
        province ||
        zip_code ||
        country ||
        google_map_link)
    ) {
      await seedAddress({
        _id: branch.address_id,
        street,
        town,
        city,
        province,
        zip_code,
        country,
        google_map_link,
      });
    }

    // Update branch details
    if (name) branch.name = name;
    if (status) branch.status = status;

    await branch.save();

    // Log activity
    if (req) {
      const newValues = {
        name: branch.name,
        status: branch.status,
        under_administration_of: branch.under_administration_of,
        salespersons_assigned: branch.salespersons_assigned,
      };

      await logAdminActivity(
        req,
        'update_branch',
        `Updated branch: ${branch.name} (${branch.code})`,
        'branches',
        branch._id,
        { old: oldValues, new: newValues }
      );
    }

    return branch;
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchId, req) {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Store branch info for logging
    const branchInfo = { name: branch.name, code: branch.code };

    // Remove this branch from all admins' branches_managed
    if (branch.under_administration_of.length > 0) {
      await Admin.updateMany(
        { _id: { $in: branch.under_administration_of } },
        { $pull: { branches_managed: branchId } }
      );
    }

    // Remove this branch from all salespersons' branches_to_be_managed
    if (branch.salespersons_assigned.length > 0) {
      await Salesperson.updateMany(
        { _id: { $in: branch.salespersons_assigned } },
        { $pull: { branches_to_be_managed: branchId } }
      );
    }

    await Branch.findByIdAndDelete(branchId);

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'delete_branch',
        `Deleted branch: ${branchInfo.name} (${branchInfo.code})`,
        'branches',
        branchId,
        { deleted_branch: branchInfo }
      );
    }

    return { name: branch.name, code: branch.code };
  }

  /**
   * Toggle branch status (Active/Inactive)
   */
  async toggleBranchStatus(branchId, req) {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    const oldStatus = branch.status;
    branch.status = branch.status === 'Active' ? 'Inactive' : 'Active';
    await branch.save();

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'toggle_branch_status',
        `Toggled branch status: ${branch.name} from ${oldStatus} to ${branch.status}`,
        'branches',
        branch._id,
        { old_status: oldStatus, new_status: branch.status }
      );
    }

    return branch;
  }

  /**
   * Assign admins to a branch
   */
  async assignAdminsToBranch(branchId, adminIds, req) {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Validate that all admin IDs exist
    const adminCount = await Admin.countDocuments({
      _id: { $in: adminIds },
    });
    if (adminCount !== adminIds.length) {
      throw new Error('INVALID_ADMIN_IDS');
    }

    // Get old admin list
    const oldAdmins = branch.under_administration_of.map(id => id.toString());
    const newAdmins = adminIds.map(id => id.toString());

    // Find admins to remove (in old but not in new)
    const adminsToRemove = oldAdmins.filter(id => !newAdmins.includes(id));

    // Find admins to add (in new but not in old)
    const adminsToAdd = newAdmins.filter(id => !oldAdmins.includes(id));

    // Remove branch from admins that are no longer assigned
    if (adminsToRemove.length > 0) {
      await Admin.updateMany(
        { _id: { $in: adminsToRemove } },
        { $pull: { branches_managed: branchId } }
      );
    }

    // Add branch to newly assigned admins
    if (adminsToAdd.length > 0) {
      await Admin.updateMany(
        { _id: { $in: adminsToAdd } },
        { $addToSet: { branches_managed: branchId } }
      );
    }

    branch.under_administration_of = adminIds;
    await branch.save();

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'assign_admins_to_branch',
        `Assigned ${adminIds.length} admin(s) to branch: ${branch.name}`,
        'branches',
        branch._id,
        { admin_ids: adminIds }
      );
    }

    return branch.populate('under_administration_of', 'name email');
  }

  /**
   * Assign salespersons to a branch
   */
  async assignSalespersonsToBranch(branchId, salespersonIds, req) {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Validate that all salesperson IDs exist
    const salespersonCount = await Salesperson.countDocuments({
      _id: { $in: salespersonIds },
    });
    if (salespersonCount !== salespersonIds.length) {
      throw new Error('INVALID_SALESPERSON_IDS');
    }

    // Get old salesperson list
    const oldSalespersons = branch.salespersons_assigned.map(id =>
      id.toString()
    );
    const newSalespersons = salespersonIds.map(id => id.toString());

    // Find salespersons to remove (in old but not in new)
    const salespersonsToRemove = oldSalespersons.filter(
      id => !newSalespersons.includes(id)
    );

    // Find salespersons to add (in new but not in old)
    const salespersonsToAdd = newSalespersons.filter(
      id => !oldSalespersons.includes(id)
    );

    // Remove branch from salespersons that are no longer assigned
    if (salespersonsToRemove.length > 0) {
      await Salesperson.updateMany(
        { _id: { $in: salespersonsToRemove } },
        { $pull: { branches_to_be_managed: branchId } }
      );
    }

    // Add branch to newly assigned salespersons
    if (salespersonsToAdd.length > 0) {
      await Salesperson.updateMany(
        { _id: { $in: salespersonsToAdd } },
        { $addToSet: { branches_to_be_managed: branchId } }
      );
    }

    branch.salespersons_assigned = salespersonIds;
    await branch.save();

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'assign_salespersons_to_branch',
        `Assigned ${salespersonIds.length} salesperson(s) to branch: ${branch.name}`,
        'branches',
        branch._id,
        { salesperson_ids: salespersonIds }
      );
    }

    return branch.populate('salespersons_assigned', 'fullName email');
  }

  /**
   * Get branch statistics
   */
  async getBranchStatistics() {
    const totalBranches = await Branch.countDocuments();
    const activeBranches = await Branch.countDocuments({ status: 'Active' });
    const inactiveBranches = await Branch.countDocuments({
      status: 'Inactive',
    });

    return {
      total: totalBranches,
      active: activeBranches,
      inactive: inactiveBranches,
    };
  }

  /**
   * Get branch performance metrics
   * Returns aggregated performance data for a specific branch
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (startDate, endDate, period)
   */
  async getBranchPerformanceMetrics(branchId, options = {}) {
    // Verify branch exists
    const branch = await Branch.findById(branchId)
      .populate('under_administration_of', 'name email status')
      .populate('salespersons_assigned', 'fullName email status');

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date(),
      period = 'daily', // 'daily', 'weekly', 'monthly'
    } = options;

    // Calculate real-time staff metrics
    const activeAdmins = branch.under_administration_of.filter(
      admin => admin.status === 'active'
    ).length;

    const activeSalespersons = branch.salespersons_assigned.filter(
      salesperson => salesperson.status === 'active'
    ).length;

    // Build date filter for real data queries
    const dateFilter = {
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // 1. Get Orders for this branch
    const orders = await Order.find({
      branch_id: branchId,
      ...dateFilter,
    }).lean();

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(
      o => o.status === 'cancelled-by-customer'
    ).length;
    const refundedOrders = orders.filter(o => o.status === 'refunded').length;

    const revenueFromOrders = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_after_applying_coupon || o.total), 0);

    const refundAmount = orders
      .filter(o => o.status === 'refunded')
      .reduce((sum, o) => sum + (o.total_after_applying_coupon || o.total), 0);

    const netRevenue = revenueFromOrders - refundAmount;

    // 2. Get Reviews for orders from this branch
    const orderIds = orders.map(o => o._id);
    const orderReviews = await Review.find({
      target_type: 'order',
      target_id: { $in: orderIds },
      ...dateFilter,
    }).lean();

    const feedbackCount = orderReviews.length;
    const averageRating =
      feedbackCount > 0
        ? orderReviews.reduce((sum, r) => sum + r.rating, 0) / feedbackCount
        : 0;

    // 3. Get Complaints assigned to this branch's admins
    const branchAdminIds = branch.under_administration_of.map(a => a._id);
    const complaints = await Complaint.find({
      branch_admin_id: { $in: branchAdminIds },
      ...dateFilter,
    }).lean();

    const newComplaints = complaints.filter(c => c.status === 'pending').length;
    const resolvedComplaints = complaints.filter(
      c => c.status === 'resolved' || c.status === 'closed'
    ).length;
    const pendingComplaints = complaints.filter(
      c => c.status === 'in_progress' || c.status === 'pending'
    ).length;

    // 4. Get unique customers who ordered from this branch
    const customerIds = [...new Set(orders.map(o => o.customer_id.toString()))];
    const newCustomers = customerIds.length;

    // Calculate derived metrics
    const orderCompletionRate =
      totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0;

    const complaintResolutionRate =
      complaints.length > 0
        ? ((resolvedComplaints / complaints.length) * 100).toFixed(2)
        : 0;

    return {
      branch_info: {
        id: branch._id,
        name: branch.name,
        code: branch.code,
        status: branch.status,
      },
      period: {
        start_date: startDate,
        end_date: endDate,
        period_type: period,
        days_count: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        refunded: refundedOrders,
        completion_rate: parseFloat(orderCompletionRate),
        revenue: revenueFromOrders,
        refund_amount: refundAmount,
        net_revenue: netRevenue,
      },
      complaints: {
        total: complaints.length,
        new: newComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        resolution_rate: parseFloat(complaintResolutionRate),
      },
      customer_engagement: {
        average_rating: parseFloat(averageRating.toFixed(2)),
        feedback_count: feedbackCount,
        new_customers: newCustomers,
      },
      staff_performance: {
        active_admins: activeAdmins,
        total_admins: branch.under_administration_of.length,
        active_salespersons: activeSalespersons,
        total_salespersons: branch.salespersons_assigned.length,
        admins: branch.under_administration_of.map(admin => ({
          id: admin._id,
          name: admin.name,
          email: admin.email,
          status: admin.status,
        })),
        salespersons: branch.salespersons_assigned.map(sp => ({
          id: sp._id,
          name: sp.fullName,
          email: sp.email,
          status: sp.status,
        })),
      },
      financial_summary: {
        total_revenue: revenueFromOrders,
        net_revenue: netRevenue,
        average_daily_revenue:
          revenueFromOrders /
          Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
      },
    };
  }
}

export default new BranchService();
