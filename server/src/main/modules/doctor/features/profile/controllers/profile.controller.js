import doctorProfileService from '../service/profile.service.js';
import { sendResponse } from '../../../../../utils/sendResponse.js';

/**
 * @desc    Get current doctor's complete profile
 * @route   GET /api/doctor/profile
 * @access  Private (Doctor)
 */
export const getMyProfile = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    const profile = await doctorProfileService.getDoctorProfile(doctorId);

    return sendResponse(
      res,
      200,
      true,
      'Profile retrieved successfully',
      profile
    );
  } catch (error) {
    console.error('Error in getMyProfile:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to retrieve profile',
      null,
      error.message
    );
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/doctor/profile
 * @access  Private (Doctor)
 */
export const updateProfile = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    const updatedProfile = await doctorProfileService.updateDoctorProfile(
      doctorId,
      req.body,
      req
    );

    return sendResponse(
      res,
      200,
      true,
      'Profile updated successfully',
      updatedProfile
    );
  } catch (error) {
    console.error('Error in updateProfile:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    if (error.message === 'INVALID_DATA') {
      return sendResponse(res, 400, false, 'Invalid profile data', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to update profile',
      null,
      error.message
    );
  }
};

/**
 * @desc    Upload/update profile image
 * @route   PUT /api/doctor/profile/profile-image
 * @access  Private (Doctor)
 */
export const updateProfileImage = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    if (!req.file) {
      return sendResponse(res, 400, false, 'No image file provided', null);
    }

    const updatedProfile = await doctorProfileService.updateProfileImage(
      doctorId,
      req.file,
      req
    );

    return sendResponse(res, 200, true, 'Profile image updated successfully', {
      profile_img_url: updatedProfile.profile_img_url,
    });
  } catch (error) {
    console.error('Error in updateProfileImage:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 500, false, 'Failed to upload image', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to update profile image',
      null,
      error.message
    );
  }
};

/**
 * @desc    Upload/update cover image
 * @route   PUT /api/doctor/profile/cover-image
 * @access  Private (Doctor)
 */
export const updateCoverImage = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    if (!req.file) {
      return sendResponse(res, 400, false, 'No image file provided', null);
    }

    const updatedProfile = await doctorProfileService.updateCoverImage(
      doctorId,
      req.file,
      req
    );

    return sendResponse(res, 200, true, 'Cover image updated successfully', {
      cover_img_url: updatedProfile.cover_img_url,
    });
  } catch (error) {
    console.error('Error in updateCoverImage:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 500, false, 'Failed to upload image', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to update cover image',
      null,
      error.message
    );
  }
};

/**
 * @desc    Update consultation type
 * @route   PUT /api/doctor/profile/consultation-type
 * @access  Private (Doctor)
 */
export const updateConsultationType = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    const { consultation_type } = req.body;

    if (!consultation_type) {
      return sendResponse(
        res,
        400,
        false,
        'Consultation type is required',
        null
      );
    }

    if (!['in-person', 'online', 'both'].includes(consultation_type)) {
      return sendResponse(
        res,
        400,
        false,
        'Invalid consultation type. Must be: in-person, online, or both',
        null
      );
    }

    const updatedProfile = await doctorProfileService.updateConsultationType(
      doctorId,
      consultation_type,
      req
    );

    return sendResponse(
      res,
      200,
      true,
      'Consultation type updated successfully',
      { consultation_type: updatedProfile.consultation_type }
    );
  } catch (error) {
    console.error('Error in updateConsultationType:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to update consultation type',
      null,
      error.message
    );
  }
};

/**
 * @desc    Update consultation fee
 * @route   PUT /api/doctor/profile/consultation-fee
 * @access  Private (Doctor)
 */
export const updateConsultationFee = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    const { consultation_fee } = req.body;

    if (consultation_fee === undefined || consultation_fee === null) {
      return sendResponse(
        res,
        400,
        false,
        'Consultation fee is required',
        null
      );
    }

    const fee = parseFloat(consultation_fee);

    if (isNaN(fee) || fee < 0) {
      return sendResponse(
        res,
        400,
        false,
        'Consultation fee must be a positive number',
        null
      );
    }

    const updatedProfile = await doctorProfileService.updateConsultationFee(
      doctorId,
      fee,
      req
    );

    return sendResponse(
      res,
      200,
      true,
      'Consultation fee updated successfully',
      { consultation_fee: updatedProfile.consultation_fee }
    );
  } catch (error) {
    console.error('Error in updateConsultationFee:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to update consultation fee',
      null,
      error.message
    );
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/doctor/profile/change-password
 * @access  Private (Doctor)
 */
export const changePassword = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, false, 'Unauthorized', null);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(
        res,
        400,
        false,
        'Current password and new password are required',
        null
      );
    }

    if (newPassword.length < 8) {
      return sendResponse(
        res,
        400,
        false,
        'New password must be at least 8 characters',
        null
      );
    }

    await doctorProfileService.changePassword(
      doctorId,
      currentPassword,
      newPassword,
      req
    );

    return sendResponse(res, 200, true, 'Password changed successfully', null);
  } catch (error) {
    console.error('Error in changePassword:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, false, 'Doctor not found', null);
    }

    if (error.message === 'INCORRECT_PASSWORD') {
      return sendResponse(
        res,
        401,
        false,
        'Current password is incorrect',
        null
      );
    }

    if (error.message === 'OAUTH_ACCOUNT') {
      return sendResponse(
        res,
        400,
        false,
        'Cannot change password for OAuth accounts',
        null
      );
    }

    return sendResponse(
      res,
      500,
      false,
      'Failed to change password',
      null,
      error.message
    );
  }
};
