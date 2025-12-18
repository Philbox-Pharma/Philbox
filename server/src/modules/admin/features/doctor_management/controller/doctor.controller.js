import sendResponse from '../../../../../utils/sendResponse.js';
import DoctorManagementService from '../services/doctor.service.js';

/**
 * Get all doctor applications
 */
export const getDoctorApplications = async (req, res) => {
  try {
    const result = await DoctorManagementService.getDoctorApplications(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Doctor applications fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get single doctor application by ID
 */
export const getDoctorApplicationById = async (req, res) => {
  try {
    const application = await DoctorManagementService.getDoctorApplicationById(
      req.params.id,
      req
    );

    return sendResponse(
      res,
      200,
      'Doctor application fetched successfully',
      application
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'APPLICATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Application not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Approve doctor application
 */
export const approveDoctorApplication = async (req, res) => {
  try {
    const { comment } = req.body;
    const adminId = req.admin._id;

    const result = await DoctorManagementService.approveDoctorApplication(
      req.params.id,
      comment,
      adminId,
      req
    );

    return sendResponse(res, 200, result.message, result);
  } catch (err) {
    console.error(err);

    if (err.message === 'APPLICATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Application not found');
    }

    if (err.message === 'ALREADY_APPROVED') {
      return sendResponse(res, 400, 'Application already approved');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Reject doctor application
 */
export const rejectDoctorApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const adminId = req.admin._id;

    if (!reason) {
      return sendResponse(res, 400, 'Reason for rejection is required');
    }

    const result = await DoctorManagementService.rejectDoctorApplication(
      req.params.id,
      reason,
      adminId,
      req
    );

    return sendResponse(res, 200, result.message, result);
  } catch (err) {
    console.error(err);

    if (err.message === 'APPLICATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Application not found');
    }

    if (err.message === 'CANNOT_REJECT_APPROVED') {
      return sendResponse(
        res,
        400,
        'Cannot reject an already approved application'
      );
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
