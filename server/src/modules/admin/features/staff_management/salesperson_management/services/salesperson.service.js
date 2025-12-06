import Salesperson from '../../../../../../models/Salesperson.js';
import Branch from '../../../../../../models/Branch.js';
import bcrypt from 'bcryptjs';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';
import { sendWelcomeEmail } from '../../../../../../utils/sendEmail.js'; // ✅ Import
import { ROUTES } from '../../../../../../constants/global.routes.constants.js';
import { paginate } from '../../../../../../utils/paginate.js';

class SalespersonManagementService {
  /**
   * Create a new Salesperson
   */
  async createSalesperson(data, req) {
    const { email, password, branches_to_be_managed } = data;

    // 1. Check duplicate email
    const existing = await Salesperson.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('EMAIL_ALREADY_EXISTS');

    // 2. Validate Branches
    const branchCount = await Branch.countDocuments({
      _id: { $in: branches_to_be_managed },
    });

    if (branchCount !== branches_to_be_managed.length) {
      throw new Error('INVALID_BRANCH_IDS');
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Record
    const newSalesperson = new Salesperson({
      ...data,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      status: 'active',
    });

    await newSalesperson.save();

    // 5. ✅ Send Welcome Email
    // Defined login link (Adjust route as per your frontend)
    const loginLink = `${process.env.FRONTEND_URL}/${ROUTES.SALESPERSON_AUTH}/login`;

    await sendWelcomeEmail(
      newSalesperson.email,
      newSalesperson.fullName,
      password, // Sending original password so they can login
      'Salesperson',
      loginLink
    );

    // 6. Log Activity
    await logAdminActivity(
      req,
      'create_salesperson',
      `Created salesperson: ${newSalesperson.email}`,
      'salespersons',
      newSalesperson._id
    );

    const safeData = newSalesperson.toObject();
    delete safeData.passwordHash;
    return safeData;
  }

  // ... [Rest of the service methods: getAllSalespersons, updateSalesperson, etc.] ...
  /**
   * Get All Salespersons (With Filters & Pagination)
   */
  async getAllSalespersons(query) {
    const { page = 1, limit = 10, search, branchId, status } = query;

    const filter = {};

    // 1. Build Search Filter
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Build Branch Filter
    if (branchId) {
      filter.branches_to_be_managed = branchId;
    }

    // 3. Build Status Filter
    if (status) {
      filter.status = status;
    }

    // 4. Define Population fields
    const populate = [
      { path: 'branches_to_be_managed', select: 'name code status' },
    ];

    // 5. ✅ Call your Custom Pagination Utility
    // Params: Model, filter, page, limit, populate, sort, select
    const result = await paginate(
      Salesperson,
      filter,
      page,
      limit,
      populate,
      { created_at: -1 }, // Sort Newest First
      '-passwordHash' // Exclude Password
    );

    // 6. Format structure to match Controller expectation
    return {
      salespersons: result.list,
      pagination: {
        total: result.total,
        page: result.currentPage,
        pages: result.totalPages,
        limit: result.limit,
      },
    };
  }

  // ... [Other methods remain unchanged] ...
  async getSalespersonById(id) {
    const salesperson = await Salesperson.findById(id)
      .populate('branches_to_be_managed', 'name code address_id status')
      .populate('address_id')
      .select('-passwordHash');

    if (!salesperson) throw new Error('SALESPERSON_NOT_FOUND');

    return salesperson;
  }

  async updateSalesperson(id, data, req) {
    const salesperson = await Salesperson.findById(id);
    if (!salesperson) throw new Error('SALESPERSON_NOT_FOUND');

    if (data.branches_to_be_managed) {
      const branchCount = await Branch.countDocuments({
        _id: { $in: data.branches_to_be_managed },
      });
      if (branchCount !== data.branches_to_be_managed.length) {
        throw new Error('INVALID_BRANCH_IDS');
      }
    }

    const changes = {};
    for (const key in data) {
      if (salesperson[key] !== data[key]) {
        changes[key] = { old: salesperson[key], new: data[key] };
      }
    }

    Object.assign(salesperson, data);
    await salesperson.save();

    await logAdminActivity(
      req,
      'update_salesperson',
      `Updated profile for ${salesperson.email}`,
      'salespersons',
      salesperson._id,
      changes
    );

    return Salesperson.findById(id)
      .populate('branches_to_be_managed', 'name code')
      .select('-passwordHash');
  }

  async changeStatus(id, status, req) {
    const salesperson = await Salesperson.findById(id);
    if (!salesperson) throw new Error('SALESPERSON_NOT_FOUND');

    const oldStatus = salesperson.status;
    salesperson.status = status.toLowerCase();
    await salesperson.save();

    await logAdminActivity(
      req,
      'change_salesperson_status',
      `Changed status from ${oldStatus} to ${status}`,
      'salespersons',
      salesperson._id,
      { status: { old: oldStatus, new: status.toLowerCase() } }
    );

    return {
      _id: id,
      status: status.toLowerCase(),
      fullName: salesperson.fullName,
    };
  }

  async deleteSalesperson(id, req) {
    const salesperson = await Salesperson.findByIdAndDelete(id);
    if (!salesperson) throw new Error('SALESPERSON_NOT_FOUND');

    await logAdminActivity(
      req,
      'delete_salesperson',
      `Deleted salesperson ${salesperson.email}`,
      'salespersons',
      id
    );

    return true;
  }
}

export default new SalespersonManagementService();
