import Branch from '../../../../../models/Branch.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { seedAddress } from '../../../utils/seedAddress.js';

/* ======================================================
   CREATE BRANCH
====================================================== */
export const createBranch = async (req, res) => {
  try {
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
    } = req.body;

    // ✅ Step 1: Seed address
    const address_id = await seedAddress({
      street,
      town,
      city,
      province,
      zip_code,
      country,
      google_map_link,
    });

    // ✅ Step 2: Determine current year (last two digits)
    const year = new Date().getFullYear().toString().slice(-2); // "25" for 2025

    // ✅ Step 3: Find last branch code for this year
    const regex = new RegExp(`^PHIL${year}#(\\d+)$`);
    const lastBranch = await Branch.findOne({ code: { $regex: regex } })
      .sort({ created_at: -1 })
      .select('code');

    let nextNumber = 1;
    if (lastBranch && lastBranch.code) {
      const match = lastBranch.code.match(/#(\d+)$/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }

    // ✅ Step 4: Generate new unique code
    const code = `PHIL${year}#${String(nextNumber).padStart(3, '0')}`;

    // ✅ Step 5: Create and save branch
    const branch = new Branch({
      name,
      address_id,
      under_administration_of,
      code,
    });

    await branch.save();
    return sendResponse(res, 201, 'Branch created successfully', branch, null);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   READ: LIST ALL BRANCHES
====================================================== */
export const listBranches = async (req, res) => {
  try {
    const {
      search = '', // for searching by name or code
      status, // optional filter
      page = 1, // current page number
      limit = 10, // results per page
    } = req.query;

    const query = {};

    // 🔍 Search filter (by name or code)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // 🎚️ Status filter
    if (status) {
      query.status = status;
    }

    const { data, total, totalPages, currentPage } = await paginate(
      Branch,
      query,
      page,
      limit,
      ['under_administration_of', 'address_id']
    );

    return sendResponse(
      res,
      200,
      'Branches fetched successfully',
      {
        total,
        totalPages,
        currentPage,
        data,
      },
      null
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   READ: SINGLE BRANCH BY ID
====================================================== */
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id)
      .populate('under_administration_of', 'name email')
      .populate('address_id');

    if (!branch) {
      return sendResponse(res, 404, 'Branch not found', null, null);
    }

    return sendResponse(res, 200, 'Branch fetched successfully', branch, null);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   UPDATE BRANCH
====================================================== */
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return sendResponse(res, 404, 'Branch not found', null, null);
    }

    // ✅ Update address if provided
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

    // ✅ Update branch details
    if (name) branch.name = name;
    if (status) branch.status = status;
    if (under_administration_of)
      branch.under_administration_of = under_administration_of;

    await branch.save();

    return sendResponse(res, 200, 'Branch updated successfully', branch, null);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   DELETE BRANCH
====================================================== */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return sendResponse(res, 404, 'Branch not found', null, null);
    }

    await Branch.findByIdAndDelete(id);

    return sendResponse(res, 200, 'Branch deleted successfully', null, null);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
