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
  async createAdmin(data, profileImage, coverImage, req) {
    const {
      name,
      email,
      password,
      phone_number,
      branches_managed = [],
      addresses = [],
      roleId,
      category,
      status,
      isTwoFactorEnabled,
    } = data;

    // Check if email already exists
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get role - either from provided roleId or default to branch_admin
    let adminRoleId = roleId;
    if (!adminRoleId) {
      const role = await Role.findOne({ name: 'branch_admin' });
      if (role) {
        adminRoleId = role._id;
      }
    }

    // Create new admin object
    const adminData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number: phone_number || '',
      category: category || 'branch-admin',
      branches_managed,
      roleId: adminRoleId,
      isTwoFactorEnabled: isTwoFactorEnabled || false,
    };

    // Only set status if provided (let model default handle it otherwise)
    if (status) {
      adminData.status = status;
    }

    // Upload and set profile image if provided, otherwise let model default handle it
    if (profileImage) {
      adminData.profile_img_url = await uploadToCloudinary(
        profileImage.path,
        'admins/profiles'
      );
    }

    // Upload and set cover image if provided, otherwise let model default handle it
    if (coverImage) {
      adminData.cover_img_url = await uploadToCloudinary(
        coverImage.path,
        'admins/covers'
      );
    }

    const newAdmin = new Admin(adminData);

    // In createAdmin method, replace the loop with:
    if (branches_managed.length > 0) {
      // Validate branches exist
      const branchCount = await Branch.countDocuments({
        _id: { $in: branches_managed },
      });
      if (branchCount !== branches_managed.length) {
        throw new Error('INVALID_BRANCH_IDS');
      }

      // Update branches with new admin using bulk operation
      await Branch.updateMany(
        { _id: { $in: branches_managed } },
        { $addToSet: { under_administration_of: newAdmin._id } }
      );
    }

    // Create addresses
    const addressIds = [];
    for (let address of addresses) {
      address.address_of_persons_id = newAdmin._id;
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
  async getAllAdmins(query, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_all_admins',
        `Viewed all admins list (${result.total} admins, page ${result.currentPage})`,
        'admins',
        null,
        { query_params: { search, status, branch, page, limit } }
      );
    }

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
  async getAllSalespersons(query, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_all_salespersons',
        `Viewed all salespersons list (${result.total} salespersons, page ${result.currentPage})`,
        'salespersons',
        null,
        { query_params: { search, status, branch, page, limit } }
      );
    }

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
  async getAdminById(adminId, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_admin_details',
        `Viewed admin details: ${admin.name} (${admin.email})`,
        'admins',
        admin._id
      );
    }

    return admin;
  }

  /**
   * Get single salesperson by ID
   */
  async getSalespersonById(salespersonId, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'view_salesperson_details',
        `Viewed salesperson details: ${salesperson.fullName} (${salesperson.email})`,
        'salespersons',
        salesperson._id
      );
    }

    return salesperson;
  }

  /**
   * Search admin
   */
  async searchAdmin(searchParams, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'search_admin',
        `Searched for admin: ${admin.name} (${admin.email})`,
        'admins',
        admin._id,
        { search_params: searchParams }
      );
    }

    return admin;
  }

  /**
   * Search salesperson
   */
  async searchSalesperson(searchParams, req) {
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

    // Log activity
    if (req) {
      await logAdminActivity(
        req,
        'search_salesperson',
        `Searched for salesperson: ${salesperson.fullName} (${salesperson.email})`,
        'salespersons',
        salesperson._id,
        { search_params: searchParams }
      );
    }

    return salesperson;
  }

  /**
   * Update admin
   */
  async updateAdmin(adminId, updateData, profileImage, coverImage, req) {
    const {
      name,
      email,
      phone_number,
      branches_managed,
      addresses,
      category,
      status,
      roleId,
      isTwoFactorEnabled,
    } = updateData;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.category !== 'branch-admin') {
      throw new Error('ADMIN_NOT_FOUND');
    }

    const oldAdmin = admin.toObject();

    // Update basic fields
    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone_number !== undefined) admin.phone_number = phone_number;
    if (category) admin.category = category;
    if (status) admin.status = status;
    if (roleId) admin.roleId = roleId;
    if (isTwoFactorEnabled !== undefined)
      admin.isTwoFactorEnabled = isTwoFactorEnabled;

    // Upload and update profile image only if provided
    if (profileImage) {
      admin.profile_img_url = await uploadToCloudinary(
        profileImage.path,
        'admins/profiles'
      );
    }

    // Upload and update cover image only if provided
    if (coverImage) {
      admin.cover_img_url = await uploadToCloudinary(
        coverImage.path,
        'admins/covers'
      );
    }

    // Update addresses
    if (addresses && addresses.length > 0) {
      const addressIds = [];
      for (let address of addresses) {
        address.address_of_persons_id = adminId;
        const addressId = await seedAddress(address);
        addressIds.push(addressId);
      }
      admin.addresses = addressIds;
    }
    // In updateAdmin method, add this before saving:
    if (branches_managed) {
      // Validate new branches
      const branchCount = await Branch.countDocuments({
        _id: { $in: branches_managed },
      });
      if (branchCount !== branches_managed.length) {
        throw new Error('INVALID_BRANCH_IDS');
      }

      // Get old and new branch lists
      const oldBranches = admin.branches_managed.map(id => id.toString());
      const newBranches = branches_managed.map(id => id.toString());

      // Find branches to remove (in old but not in new)
      const branchesToRemove = oldBranches.filter(
        id => !newBranches.includes(id)
      );

      // Find branches to add (in new but not in old)
      const branchesToAdd = newBranches.filter(id => !oldBranches.includes(id));

      // Remove admin from branches that are no longer assigned
      if (branchesToRemove.length > 0) {
        await Branch.updateMany(
          { _id: { $in: branchesToRemove } },
          { $pull: { under_administration_of: adminId } }
        );
      }

      // Add admin to newly assigned branches
      if (branchesToAdd.length > 0) {
        await Branch.updateMany(
          { _id: { $in: branchesToAdd } },
          { $addToSet: { under_administration_of: adminId } }
        );
      }

      admin.branches_managed = branches_managed;
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
