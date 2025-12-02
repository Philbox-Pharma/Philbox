import Branch from '../../../../../models/Branch.js';
import { seedAddress } from '../../../utils/seedAddress.js';
import { paginate } from '../../../../../utils/paginate.js';

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
  async createBranch(data) {
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
    } = data;

    if (!name) {
      throw new Error('BRANCH_NAME_REQUIRED');
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
      code,
    });

    await branch.save();
    return branch;
  }

  /**
   * List all branches with filtering and pagination
   */
  async listBranches(queryParams) {
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
      'address_id',
    ]);

    return result;
  }

  /**
   * Get a single branch by ID
   */
  async getBranchById(branchId) {
    const branch = await Branch.findById(branchId)
      .populate('under_administration_of', 'name email')
      .populate('address_id');

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    return branch;
  }

  /**
   * Update a branch
   */
  async updateBranch(branchId, updateData) {
    const {
      name,
      status,
      under_administration_of,
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
    if (under_administration_of)
      branch.under_administration_of = under_administration_of;

    await branch.save();
    return branch;
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchId) {
    const branch = await Branch.findById(branchId);

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    await Branch.findByIdAndDelete(branchId);
    return { name: branch.name, code: branch.code };
  }
}

export default new BranchService();
