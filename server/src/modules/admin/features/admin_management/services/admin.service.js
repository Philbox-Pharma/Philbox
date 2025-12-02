import Admin from '../../../../../models/Admin.js';
import Branch from '../../../../../models/Branch.js';
import bcrypt from 'bcryptjs';
import { seedAddress } from '../../../utils/seedAddress.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { paginate } from '../../../../../utils/paginate.js';

class AdminManagementService {
  /**
   * Create a new branch admin
   */
  async createBranchAdmin(data, profileImage, req) {
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
    const hashed = await bcrypt.hash(password, salt);

    // Upload profile image if provided
    let profile_img_url;
    if (profileImage) {
      profile_img_url = await uploadToCloudinary(
        profileImage.path,
        'branch_admins'
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone_number: phone_number || '',
      category: 'branch-admin',
      branches_managed,
      profile_img_url,
    });

    // Update branches with new admin
    for (let branchID of branches_managed) {
      const branch = await Branch.findById(branchID);
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
    newAdmin.addresses = addressIds;

    await newAdmin.save();

    // Log activity
    const requestingAdmin = req.user || req.admin;
    await logAdminActivity(
      req,
      'create_branch_admin',
      `Super Admin with id ${requestingAdmin._id} created branch admin '${name}' (${email})`,
      'admins',
      newAdmin._id,
      { new: newAdmin }
    );

    // Return admin without password
    const { password: _, ...safeData } = newAdmin.toObject();
    return safeData;
  }

  /**
   * Get all branch admins with pagination
   */
  async listBranchAdmins(page = 1, limit = 10) {
    const result = await paginate(
      Admin,
      { category: 'branch-admin' },
      page,
      limit
    );

    if (!result.data.length) {
      throw new Error('NO_ADMINS_FOUND');
    }

    return result;
  }

  /**
   * Search for a branch admin
   */
  async searchBranchAdmin(searchParams) {
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
   * Delete a branch admin
   */
  async removeBranchAdmin(adminId, req) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('ADMIN_NOT_FOUND');
    }

    // Remove admin from all branches
    for (let branchID of admin.branches_managed) {
      const branch = await Branch.findById(branchID);
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
      'delete_branch_admin',
      `Super Admin deleted branch admin '${admin.name}' (${admin.email})`,
      'admins',
      adminId,
      { old: admin }
    );

    return { name: admin.name, email: admin.email };
  }

  /**
   * Update a branch admin
   */
  async updateBranchAdmin(adminId, updateData, req) {
    const { name, email, phone_number, password, branches_managed, addresses } =
      updateData;

    const admin = await Admin.findById(adminId);
    if (!admin) {
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
        address.id = admin._id;
        const addressId = await seedAddress(address);
        addressIds.push(addressId);
      }
      admin.addresses = addressIds;
    }

    await admin.save();

    // Log activity
    await logAdminActivity(
      req,
      'update_branch_admin',
      `Super Admin updated branch admin '${admin.name}' (${admin.email})`,
      'admins',
      adminId,
      { old: oldAdmin, new: admin }
    );

    // Return admin without password
    const { password: _, ...safeData } = admin.toObject();
    return safeData;
  }
}

export default new AdminManagementService();
