import Admin from '../../../../../models/Admin.js';
import Salesperson from '../../../../../models/Salesperson.js';
import Branch from '../../../../../models/Branch.js';
import Role from '../../../../../models/Role.js';
import bcrypt from 'bcryptjs';
import { seedAddress } from '../../../utils/seedAddress.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { paginate } from '../../../../../utils/paginate.js';
import { sendWelcomeEmail } from '../../../../../utils/sendEmail.js';
import { ROUTES } from '../../../../../constants/global.routes.constants.js';

class UserManagementService {
  /**
   * Create Admin User
   */
  async createAdmin(data, profileImage, req) {
    const {
      name,
      email,
      password,
      phone_number,
      branches_managed = [],
      addresses = [],
    } = data;

    // Check if email already exists
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload profile image if provided
    let profile_img_url = null;
    if (profileImage) {
      profile_img_url = await uploadToCloudinary(profileImage.path, 'admins');
    }

    // Get branch_admin role
    let roleId = null;
    const role = await Role.findOne({ name: 'branch_admin' });
    if (role) {
      roleId = role._id;
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number: phone_number || '',
      category: 'branch-admin',
      branches_managed,
      profile_img_url,
      roleId,
    });

    // Update branches with new admin
    for (let branchId of branches_managed) {
      const branch = await Branch.findById(branchId);
      if (branch) {
        branch.under_administration_of.push(newAdmin._id);
        await branch.save();
      }
    }

    // Create addresses
    const addressIds = [];
    for (let address of addresses) {
      address.id = newAdmin._id;
      const addressId = await seedAddress(address);
      addressIds.push(addressId);
    }
    if (addressIds.length > 0) {
      newAdmin.addresses = addressIds;
    }

    await newAdmin.save();

    // Send welcome email
    const loginLink = `${process.env.FRONTEND_URL}/${ROUTES.ADMIN_AUTH}/login`;
    await sendWelcomeEmail(
      newAdmin.email,
      newAdmin.name,
      password,
      'Admin',
      loginLink
    );

    // Log activity
    await logAdminActivity(
      req,
      'create_admin',
      `Super Admin created branch admin '${name}' (${newAdmin.email})`,
      'admins',
      newAdmin._id,
      { new: newAdmin }
    );

    // Return user without password
    const safeData = newAdmin.toObject();
    delete safeData.password;
    return safeData;
  }

  /**
   * Create Salesperson User
   */
  async createSalesperson(data, req) {
    const {
      fullName,
      email,
      password,
      contactNumber,
      gender,
      dateOfBirth,
      branches_to_be_managed = [],
    } = data;

    // Check if email already exists
    const existing = await Salesperson.findOne({
      email: email.toLowerCase(),
    });
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    // Validate branches
    if (branches_to_be_managed.length > 0) {
      const branchCount = await Branch.countDocuments({
        _id: { $in: branches_to_be_managed },
      });
      if (branchCount !== branches_to_be_managed.length) {
        throw new Error('INVALID_BRANCH_IDS');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get salesperson role
    let roleId = null;
    const role = await Role.findOne({ name: 'salesperson' });
    if (role) {
      roleId = role._id;
    }

    // Create new salesperson
    const newSalesperson = new Salesperson({
      fullName,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      contactNumber,
      gender,
      dateOfBirth,
      branches_to_be_managed,
      status: 'active',
      roleId,
    });

    await newSalesperson.save();

    // Send welcome email
    const loginLink = `${process.env.FRONTEND_URL}/${ROUTES.SALESPERSON_AUTH}/login`;
    await sendWelcomeEmail(
      newSalesperson.email,
      newSalesperson.fullName,
      password,
      'Salesperson',
      loginLink
    );

    // Log activity
    await logAdminActivity(
      req,
      'create_salesperson',
      `Super Admin created salesperson '${fullName}' (${newSalesperson.email})`,
      'salespersons',
      newSalesperson._id,
      { new: newSalesperson }
    );

    // Return user without password
    const safeData = newSalesperson.toObject();
    delete safeData.passwordHash;
    return safeData;
  }

  /**
   * Get all admins with pagination and filters
   */
  async getAllAdmins(query) {
    const { page = 1, limit = 10, search, status, branch } = query;

    const filter = { category: 'branch-admin' };

    // Build search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build status filter
    if (status) {
      filter.status = status.toLowerCase();
    }

    // Build branch filter
    if (branch) {
      filter.branches_managed = branch;
    }

    const populate = [
      { path: 'branches_managed', select: 'branch_name city code' },
      { path: 'roleId', select: 'name description' },
    ];

    const result = await paginate(
      Admin,
      filter,
      page,
      limit,
      populate,
      { createdAt: -1 },
      '-password'
    );

    return {
      admins: result.list,
      pagination: {
        total: result.total,
        page: result.currentPage,
        pages: result.totalPages,
        limit: result.limit,
      },
    };
  }

  /**
   * Get all salespersons with pagination and filters
   */
  async getAllSalespersons(query) {
    const { page = 1, limit = 10, search, status, branch } = query;

    const filter = {};

    // Build search filter
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build status filter
    if (status) {
      filter.status = status.toLowerCase();
    }

    // Build branch filter
    if (branch) {
      filter.branches_to_be_managed = branch;
    }

    const populate = [
      { path: 'branches_to_be_managed', select: 'name code status' },
      { path: 'roleId', select: 'name description' },
    ];

    const result = await paginate(
      Salesperson,
      filter,
      page,
      limit,
      populate,
      { created_at: -1 },
      '-passwordHash'
    );

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

  /**
   * Get single admin by ID
   */
  async getAdminById(adminId) {
    const admin = await Admin.findById(adminId)
      .populate({
        path: 'branches_managed',
        select: 'branch_name city code',
      })
      .populate({ path: 'addresses' })
      .populate({ path: 'roleId', select: 'name description permissions' })
      .select('-password');

    if (!admin || admin.category !== 'branch-admin') {
      throw new Error('ADMIN_NOT_FOUND');
    }

    return admin;
  }

  /**
   * Get single salesperson by ID
   */
  async getSalespersonById(salespersonId) {
    const salesperson = await Salesperson.findById(salespersonId)
      .populate({
        path: 'branches_to_be_managed',
        select: 'name code status',
      })
      .populate({ path: 'roleId', select: 'name description permissions' })
      .select('-passwordHash');

    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    return salesperson;
  }

  /**
   * Search admin
   */
  async searchAdmin(searchParams) {
    const { id, email, name } = searchParams;

    let query = { category: 'branch-admin' };
    if (id) query._id = id;
    if (email) query.email = email.toLowerCase();
    if (name) query.name = { $regex: name, $options: 'i' };

    const admin = await Admin.findOne(query)
      .select('-password')
      .populate('branches_managed', 'branch_name city')
      .populate('addresses');

    if (!admin) {
      throw new Error('ADMIN_NOT_FOUND');
    }

    return admin;
  }

  /**
   * Search salesperson
   */
  async searchSalesperson(searchParams) {
    const { id, email, fullName } = searchParams;

    let query = {};
    if (id) query._id = id;
    if (email) query.email = email.toLowerCase();
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };

    const salesperson = await Salesperson.findOne(query)
      .select('-passwordHash')
      .populate('branches_to_be_managed', 'name code');

    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    return salesperson;
  }

  /**
   * Update admin
   */
  async updateAdmin(adminId, updateData, req) {
    const { name, email, phone_number, password, branches_managed, addresses } =
      updateData;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.category !== 'branch-admin') {
      throw new Error('ADMIN_NOT_FOUND');
    }

    const oldAdmin = admin.toObject();

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone_number) admin.phone_number = phone_number;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    if (branches_managed) admin.branches_managed = branches_managed;

    // Update addresses
    if (addresses && addresses.length > 0) {
      const addressIds = [];
      for (let address of addresses) {
        address.id = adminId;
        const addressId = await seedAddress(address);
        addressIds.push(addressId);
      }
      admin.addresses = addressIds;
    }

    await admin.save();

    // Log activity
    await logAdminActivity(
      req,
      'update_admin',
      `Super Admin updated branch admin '${admin.name}' (${admin.email})`,
      'admins',
      adminId,
      { old: oldAdmin, new: admin }
    );

    // Return admin without password
    const safeData = admin.toObject();
    delete safeData.password;
    return safeData;
  }

  /**
   * Update salesperson
   */
  async updateSalesperson(salespersonId, updateData, req) {
    const {
      fullName,
      email,
      password,
      contactNumber,
      gender,
      dateOfBirth,
      branches_to_be_managed,
    } = updateData;

    const salesperson = await Salesperson.findById(salespersonId);
    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    const oldSalesperson = salesperson.toObject();

    // Update fields
    if (fullName) salesperson.fullName = fullName;
    if (email) salesperson.email = email.toLowerCase();
    if (contactNumber) salesperson.contactNumber = contactNumber;
    if (gender) salesperson.gender = gender;
    if (dateOfBirth) salesperson.dateOfBirth = dateOfBirth;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      salesperson.passwordHash = await bcrypt.hash(password, salt);
    }

    if (branches_to_be_managed) {
      const branchCount = await Branch.countDocuments({
        _id: { $in: branches_to_be_managed },
      });
      if (branchCount !== branches_to_be_managed.length) {
        throw new Error('INVALID_BRANCH_IDS');
      }
      salesperson.branches_to_be_managed = branches_to_be_managed;
    }

    await salesperson.save();

    // Log activity
    await logAdminActivity(
      req,
      'update_salesperson',
      `Super Admin updated salesperson '${salesperson.fullName}' (${salesperson.email})`,
      'salespersons',
      salespersonId,
      { old: oldSalesperson, new: salesperson }
    );

    // Return salesperson without password
    const safeData = salesperson.toObject();
    delete safeData.passwordHash;
    return safeData;
  }

  /**
   * Change salesperson status
   */
  async changeSalespersonStatus(salespersonId, status, req) {
    const salesperson = await Salesperson.findById(salespersonId);
    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    const oldStatus = salesperson.status;
    salesperson.status = status.toLowerCase();
    await salesperson.save();

    // Log activity
    await logAdminActivity(
      req,
      'change_salesperson_status',
      `Changed salesperson status from ${oldStatus} to ${status}`,
      'salespersons',
      salespersonId,
      { status: { old: oldStatus, new: status.toLowerCase() } }
    );

    return {
      _id: salespersonId,
      status: status.toLowerCase(),
      fullName: salesperson.fullName,
    };
  }

  /**
   * Delete admin
   */
  async deleteAdmin(adminId, req) {
    const admin = await Admin.findById(adminId);
    if (!admin || admin.category !== 'branch-admin') {
      throw new Error('ADMIN_NOT_FOUND');
    }

    // Remove admin from all branches
    for (let branchId of admin.branches_managed) {
      const branch = await Branch.findById(branchId);
      if (branch) {
        branch.under_administration_of = branch.under_administration_of.filter(
          id => id.toString() !== adminId
        );
        await branch.save();
      }
    }

    await Admin.deleteOne({ _id: adminId });

    // Log activity
    await logAdminActivity(
      req,
      'delete_admin',
      `Super Admin deleted branch admin '${admin.name}' (${admin.email})`,
      'admins',
      adminId,
      { old: admin }
    );

    return { name: admin.name, email: admin.email };
  }

  /**
   * Delete salesperson
   */
  async deleteSalesperson(salespersonId, req) {
    const salesperson = await Salesperson.findByIdAndDelete(salespersonId);
    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    // Log activity
    await logAdminActivity(
      req,
      'delete_salesperson',
      `Super Admin deleted salesperson '${salesperson.fullName}' (${salesperson.email})`,
      'salespersons',
      salespersonId,
      { old: salesperson }
    );

    return { fullName: salesperson.fullName, email: salesperson.email };
  }
}

export default new UserManagementService();
