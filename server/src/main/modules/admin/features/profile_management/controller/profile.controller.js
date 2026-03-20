import sendResponse from '../../../../../utils/sendResponse.js';
import adminProfileService from '../service/profile.service.js';

/**
 * Get admin profile
 * GET /api/admin/profile
 */
export const getProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const result = await adminProfileService.getProfile(adminId);
    return sendResponse(res, 200, 'Profile fetched successfully', result);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Update admin profile information
 * PUT /api/admin/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const result = await adminProfileService.updateProfile(
      adminId,
      req.body,
      req
    );
    return sendResponse(res, 200, 'Profile updated successfully', result);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Upload profile picture
 * PUT /api/admin/profile/picture
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const file = req.file;

    if (!file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const result = await adminProfileService.uploadProfilePicture(
      adminId,
      file,
      req
    );
    return sendResponse(
      res,
      200,
      'Profile picture updated successfully',
      result
    );
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    if (err.message === 'NO_FILE_PROVIDED') {
      return sendResponse(res, 400, 'No image file provided');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Upload cover image
 * PUT /api/admin/profile/cover
 */
export const uploadCoverImage = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const file = req.file;

    if (!file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const result = await adminProfileService.uploadCoverImage(
      adminId,
      file,
      req
    );
    return sendResponse(res, 200, 'Cover image updated successfully', result);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    if (err.message === 'NO_FILE_PROVIDED') {
      return sendResponse(res, 400, 'No image file provided');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Change password
 * PUT /api/admin/profile/password
 */
export const changePassword = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const { currentPassword, newPassword } = req.body;

    const result = await adminProfileService.changePassword(
      adminId,
      currentPassword,
      newPassword,
      req
    );
    return sendResponse(res, 200, 'Password changed successfully', result);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    if (err.message === 'INCORRECT_CURRENT_PASSWORD') {
      return sendResponse(res, 400, 'Current password is incorrect');
    }
    if (err.message === 'NO_PASSWORD_SET') {
      return sendResponse(
        res,
        400,
        'Cannot change password. No password is currently set.'
      );
    }
    if (err.message === 'NEW_PASSWORD_SAME_AS_OLD') {
      return sendResponse(
        res,
        400,
        'New password must be different from current password'
      );
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
