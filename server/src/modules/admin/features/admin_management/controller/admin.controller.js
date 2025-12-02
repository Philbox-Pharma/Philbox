import sendResponse from '../../../../../utils/sendResponse.js';
import AdminManagementService from '../services/admin.service.js';

// 🟩 CREATE Branch Admin
export const createBranchAdmin = async (req, res) => {
  try {
    const profileImage = req.file; // multer adds this

    const admin = await AdminManagementService.createBranchAdmin(
      req.body,
      profileImage,
      req // Pass entire request object for logging
    );

    return sendResponse(res, 201, 'Branch Admin created successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'EMAIL_EXISTS') {
      return sendResponse(res, 400, 'Email already exists');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

// 🟦 READ ALL Branch Admins with Pagination
export const listAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await AdminManagementService.listBranchAdmins(page, limit);

    return sendResponse(res, 200, 'Branch Admins fetched successfully', result);
  } catch (err) {
    console.error(err);

    if (err.message === 'NO_ADMINS_FOUND') {
      return sendResponse(res, 404, 'No Branch Admins found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

// 🟦 READ ONE Branch Admin (Search)
export const searchBranchAdmin = async (req, res) => {
  try {
    const admin = await AdminManagementService.searchBranchAdmin(req.query);

    return sendResponse(res, 200, 'Branch Admin fetched successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

// 🟥 DELETE Branch Admin
export const removeBranchAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await AdminManagementService.removeBranchAdmin(
      id,
      req // Pass entire request object for logging
    );

    return sendResponse(res, 200, 'Branch Admin removed successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

// 🟧 UPDATE Branch Admin
export const updateBranchAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await AdminManagementService.updateBranchAdmin(
      id,
      req.body,
      req // Pass entire request object for logging
    );

    return sendResponse(res, 200, 'Branch Admin updated successfully', admin);
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
