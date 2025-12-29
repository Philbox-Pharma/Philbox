import sendResponse from '../../../../../utils/sendResponse.js';
import customerProfileService from '../service/profile.service.js';

/**
 * Get customer profile
 * GET /api/customer/profile
 */
export const getProfile = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const result = await customerProfileService.getProfile(customerId);
    return sendResponse(res, 200, 'Profile fetched successfully', result);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Update customer profile information
 * PUT /api/customer/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const result = await customerProfileService.updateProfile(
      customerId,
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
 * PUT /api/customer/profile/picture
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const file = req.file;

    if (!file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const result = await customerProfileService.uploadProfilePicture(
      customerId,
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
 * PUT /api/customer/profile/cover
 */
export const uploadCoverImage = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const file = req.file;

    if (!file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const result = await customerProfileService.uploadCoverImage(
      customerId,
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
 * PUT /api/customer/profile/password
 */
export const changePassword = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { currentPassword, newPassword } = req.body;

    const result = await customerProfileService.changePassword(
      customerId,
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
        'Cannot change password for OAuth accounts without a password set'
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
