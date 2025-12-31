import sendResponse from '../../../../../utils/sendResponse.js';
import UserManagementService from '../services/user.service.js';

/**
 * Create Admin
 */
export const createAdmin = async (req, res) => {
  try {
    // Handle multiple file uploads (profile_img and cover_img)
    const profileImage = req.files?.profile_img?.[0] || req.file;
    const coverImage = req.files?.cover_img?.[0];

    const admin = await UserManagementService.createAdmin(
      req.body,
      profileImage,
      coverImage,
      req
    );

    return sendResponse(res, 201, 'Admin created successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'EMAIL_EXISTS') {
      return sendResponse(res, 400, 'Email already exists');
    }

    if (err.message === 'INVALID_BRANCH_IDS') {
      return sendResponse(res, 400, 'Invalid branch IDs provided');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Create Salesperson
 */
export const createSalesperson = async (req, res) => {
  try {
    const salesperson = await UserManagementService.createSalesperson(
      req.body,
      req
    );

    return sendResponse(
      res,
      201,
      'Salesperson created successfully',
      salesperson
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'EMAIL_EXISTS') {
      return sendResponse(res, 400, 'Email already exists');
    }

    if (err.message === 'INVALID_BRANCH_IDS') {
      return sendResponse(res, 400, 'Invalid branch IDs provided');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get all admins
 */
export const getAllAdmins = async (req, res) => {
  try {
    const result = await UserManagementService.getAllAdmins(req.query, req);

    return sendResponse(res, 200, 'Admins fetched successfully', result);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get all salespersons
 */
export const getAllSalespersons = async (req, res) => {
  try {
    const result = await UserManagementService.getAllSalespersons(
      req.query,
      req
    );

    return sendResponse(res, 200, 'Salespersons fetched successfully', result);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get single admin by ID
 */
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await UserManagementService.getAdminById(id, req);

    return sendResponse(res, 200, 'Admin details fetched successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get single salesperson by ID
 */
export const getSalespersonById = async (req, res) => {
  try {
    const { id } = req.params;

    const salesperson = await UserManagementService.getSalespersonById(id, req);

    return sendResponse(
      res,
      200,
      'Salesperson details fetched successfully',
      salesperson
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Search admin
 */
export const searchAdmin = async (req, res) => {
  try {
    const admin = await UserManagementService.searchAdmin(req.query, req);

    return sendResponse(res, 200, 'Admin found successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Search salesperson
 */
export const searchSalesperson = async (req, res) => {
  try {
    const salesperson = await UserManagementService.searchSalesperson(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Salesperson found successfully',
      salesperson
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle multiple file uploads (profile_img and cover_img)
    const profileImage = req.files?.profile_img?.[0] || req.file;
    const coverImage = req.files?.cover_img?.[0];

    const admin = await UserManagementService.updateAdmin(
      id,
      req.body,
      profileImage,
      coverImage,
      req
    );

    return sendResponse(res, 200, 'Admin updated successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    if (err.message === 'INVALID_BRANCH_IDS') {
      return sendResponse(res, 400, 'Invalid branch IDs provided');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Update salesperson
 */
export const updateSalesperson = async (req, res) => {
  try {
    const { id } = req.params;

    const salesperson = await UserManagementService.updateSalesperson(
      id,
      req.body,
      req
    );

    return sendResponse(
      res,
      200,
      'Salesperson updated successfully',
      salesperson
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    if (err.message === 'INVALID_BRANCH_IDS') {
      return sendResponse(res, 400, 'Invalid branch IDs provided');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Change salesperson status
 */
export const changeSalespersonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await UserManagementService.changeSalespersonStatus(
      id,
      status,
      req
    );

    return sendResponse(
      res,
      200,
      'Salesperson status updated successfully',
      result
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await UserManagementService.deleteAdmin(id, req);

    return sendResponse(res, 200, 'Admin deleted successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Delete salesperson
 */
export const deleteSalesperson = async (req, res) => {
  try {
    const { id } = req.params;

    await UserManagementService.deleteSalesperson(id, req);

    return sendResponse(res, 200, 'Salesperson deleted successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get Salesperson Task Performance
 * Accessible by Super Admin and Branch Admin
 */
export const getSalespersonTaskPerformance = async (req, res) => {
  try {
    const filters = req.query;
    const adminId = req.session.adminId;

    // Get admin to check category
    const Admin = (await import('../../../../../models/Admin.js')).default;
    const admin = await Admin.findById(adminId).select('category');

    if (!admin) {
      return sendResponse(res, 404, 'Admin not found');
    }

    const result = await UserManagementService.getSalespersonTaskPerformance(
      filters,
      adminId,
      admin.category,
      req
    );

    return sendResponse(
      res,
      200,
      'Salesperson task performance retrieved successfully',
      result
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NO_BRANCHES') {
      return sendResponse(res, 403, 'You do not manage any branches');
    }

    if (err.message === 'UNAUTHORIZED_BRANCH_ACCESS') {
      return sendResponse(res, 403, 'You do not have access to this branch');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
