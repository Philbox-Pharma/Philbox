import doctorProfileService from '../service/profile.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

/**
 * @desc    Get current doctor's complete profile
 * @route   GET /api/doctor/profile
 * @access  Private (Doctor)
 */
export const getMyProfile = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const profile = await doctorProfileService.getDoctorProfile(doctorId);

    return sendResponse(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    console.error('Error in getMyProfile:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    const updatedProfile = await doctorProfileService.updateDoctorProfile(
      doctorId,
      req.body,
      req
    );

    return sendResponse(
      res,
      200,
      'Profile updated successfully',
      updatedProfile
    );
  } catch (error) {
    console.error('Error in updateProfile:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    if (error.message === 'INVALID_DATA') {
      return sendResponse(res, 400, 'Invalid profile data');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    if (!req.file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const updatedProfile = await doctorProfileService.updateProfileImage(
      doctorId,
      req.file,
      req
    );

    return sendResponse(res, 200, 'Profile image updated successfully', {
      profile_img_url: updatedProfile.profile_img_url,
    });
  } catch (error) {
    console.error('Error in updateProfileImage:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 500, 'Failed to upload image');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    if (!req.file) {
      return sendResponse(res, 400, 'No image file provided');
    }

    const updatedProfile = await doctorProfileService.updateCoverImage(
      doctorId,
      req.file,
      req
    );

    return sendResponse(res, 200, 'Cover image updated successfully', {
      cover_img_url: updatedProfile.cover_img_url,
    });
  } catch (error) {
    console.error('Error in updateCoverImage:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 500, 'Failed to upload image');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultation_type } = req.body;

    if (!consultation_type) {
      return sendResponse(res, 400, 'Consultation type is required');
    }

    if (!['in-person', 'online', 'both'].includes(consultation_type)) {
      return sendResponse(
        res,
        400,
        'Invalid consultation type. Must be: in-person, online, or both'
      );
    }

    const updatedProfile = await doctorProfileService.updateConsultationType(
      doctorId,
      consultation_type,
      req
    );

    return sendResponse(res, 200, 'Consultation type updated successfully', {
      consultation_type: updatedProfile.consultation_type,
    });
  } catch (error) {
    console.error('Error in updateConsultationType:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultation_fee } = req.body;

    if (consultation_fee === undefined || consultation_fee === null) {
      return sendResponse(res, 400, 'Consultation fee is required');
    }

    const fee = parseFloat(consultation_fee);

    if (isNaN(fee) || fee < 0) {
      return sendResponse(
        res,
        400,
        'Consultation fee must be a positive number'
      );
    }

    const updatedProfile = await doctorProfileService.updateConsultationFee(
      doctorId,
      fee,
      req
    );

    return sendResponse(res, 200, 'Consultation fee updated successfully', {
      consultation_fee: updatedProfile.consultation_fee,
    });
  } catch (error) {
    console.error('Error in updateConsultationFee:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    return sendResponse(
      res,
      500,
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
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(
        res,
        400,
        'Current password and new password are required'
      );
    }

    if (newPassword.length < 8) {
      return sendResponse(
        res,
        400,
        'New password must be at least 8 characters'
      );
    }

    await doctorProfileService.changePassword(
      doctorId,
      currentPassword,
      newPassword,
      req
    );

    return sendResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Error in changePassword:', error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(res, 404, 'Doctor not found');
    }

    if (error.message === 'INCORRECT_PASSWORD') {
      return sendResponse(res, 401, 'Current password is incorrect');
    }

    if (error.message === 'OAUTH_ACCOUNT') {
      return sendResponse(
        res,
        400,
        'Cannot change password for OAuth accounts'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to change password',
      null,
      error.message
    );
  }
};
