import sendResponse from '../../../../../utils/sendResponse.js';
import doctorOnboardingService from '../service/onboarding.service.js';

// ------------------------- GET APPLICATION STATUS --------------------------
export const getApplicationStatus = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.doctor?._id;

    if (!doctorId) {
      return sendResponse(
        res,
        401,
        'Unauthorized',
        null,
        'Doctor authentication required'
      );
    }

    const result = await doctorOnboardingService.getApplicationStatus(
      doctorId,
      req
    );

    return sendResponse(
      res,
      200,
      'Application status fetched successfully',
      result
    );
  } catch (error) {
    console.error(error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Doctor Not Found',
        null,
        'The specified doctor does not exist.'
      );
    }

    return sendResponse(
      res,
      500,
      'Server Error',
      null,
      'An unexpected error occurred. Please try again later.'
    );
  }
};

// ------------------------- SUBMIT APPLICATION (DOCUMENTS) --------------------------
export const submitApplication = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.doctor?._id;

    if (!doctorId) {
      return sendResponse(
        res,
        401,
        'Unauthorized',
        null,
        'Doctor authentication required'
      );
    }

    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return sendResponse(
        res,
        400,
        'Bad Request',
        null,
        'No files uploaded. Please upload required documents.'
      );
    }

    const result = await doctorOnboardingService.submitApplication(
      doctorId,
      files,
      req
    );

    return sendResponse(res, 200, result.message, result);
  } catch (error) {
    console.warn(error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Doctor Not Found',
        null,
        'The specified doctor does not exist.'
      );
    }

    if (error.message === 'ALREADY_SUBMITTED') {
      return sendResponse(
        res,
        400,
        'Application Already Submitted',
        null,
        'Your documents are already pending review. Please wait for admin approval.'
      );
    }

    if (error.message.startsWith('MISSING_REQUIRED_FILES')) {
      return sendResponse(
        res,
        400,
        'Missing Required Documents',
        { missingFiles: error.missingFiles },
        `Please upload the following required documents: ${error.missingFiles.join(', ')}`
      );
    }

    if (error.name === 'ValidationError') {
      const missingFields = Object.keys(error.errors).map(key =>
        key.replace(/_/g, ' ').toUpperCase()
      );
      return sendResponse(
        res,
        400,
        'Validation Failed',
        { missingFields },
        `Missing required documents: ${missingFields.join(', ')}`
      );
    }

    if (
      error.message.includes('Cloudinary') ||
      error.message.includes('upload')
    ) {
      return sendResponse(
        res,
        500,
        'File Upload Failed',
        null,
        'There was an error uploading your documents. Please try again.'
      );
    }

    return sendResponse(
      res,
      500,
      'Server Error',
      null,
      'An unexpected error occurred. Please try again later.'
    );
  }
};

// ------------------------- COMPLETE PROFILE (EDUCATION, EXPERIENCE, ETC) --------------------------
export const completeProfile = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.doctor?._id;

    if (!doctorId) {
      return sendResponse(
        res,
        401,
        'Unauthorized',
        null,
        'Doctor authentication required'
      );
    }

    const profileData = {
      educational_details: req.body.educational_details
        ? JSON.parse(req.body.educational_details)
        : [],
      specialization: req.body.specialization
        ? JSON.parse(req.body.specialization)
        : [],
      experience_details: req.body.experience_details
        ? JSON.parse(req.body.experience_details)
        : [],
      license_number: req.body.license_number,
      affiliated_hospital: req.body.affiliated_hospital,
      consultation_type: req.body.consultation_type,
      consultation_fee: req.body.consultation_fee,
      onlineProfileURL: req.body.onlineProfileURL,
    };

    const files = req.files;

    const result = await doctorOnboardingService.completeProfile(
      doctorId,
      profileData,
      files,
      req
    );

    return sendResponse(res, 200, result.message, result);
  } catch (error) {
    console.warn(error);

    if (error.message === 'DOCTOR_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Doctor Not Found',
        null,
        'The specified doctor does not exist.'
      );
    }

    if (error.message === 'APPLICATION_NOT_APPROVED') {
      return sendResponse(
        res,
        403,
        'Application Not Approved',
        null,
        'Your document verification is still pending. Please wait for admin approval before completing your profile.'
      );
    }

    if (error.message === 'PROFILE_ALREADY_COMPLETED') {
      return sendResponse(
        res,
        400,
        'Profile Already Completed',
        null,
        'Your profile has already been completed.'
      );
    }

    if (error.name === 'ValidationError') {
      return sendResponse(res, 400, 'Validation Failed', null, error.message);
    }

    return sendResponse(
      res,
      500,
      'Server Error',
      null,
      'An unexpected error occurred. Please try again later.'
    );
  }
};
