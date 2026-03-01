import doctorConsultationsService from '../service/consultations.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import {
  getPastConsultationsSchema,
  getConsultationDetailsSchema,
  getPrescriptionDetailsSchema,
  getConsultationStatsSchema,
} from '../../../../../dto/doctor/consultations.dto.js';

/**
 * @desc    Get past consultations (completed appointments)
 * @route   GET /api/doctor/consultations
 * @access  Private (Doctor)
 */
export const getPastConsultations = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getPastConsultationsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorConsultationsService.getPastConsultations(
      doctorId,
      value
    );

    return sendResponse(
      res,
      200,
      'Past consultations retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getPastConsultations:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve past consultations',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get detailed information about a specific consultation
 * @route   GET /api/doctor/consultations/:consultationId
 * @access  Private (Doctor)
 */
export const getConsultationDetails = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate params
    const { error, value } = getConsultationDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorConsultationsService.getConsultationDetails(
      doctorId,
      value.consultationId
    );

    return sendResponse(
      res,
      200,
      'Consultation details retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getConsultationDetails:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Consultation not found or does not belong to this doctor'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve consultation details',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get prescription details for a consultation
 * @route   GET /api/doctor/consultations/prescription/:prescriptionId
 * @access  Private (Doctor)
 */
export const getPrescriptionDetails = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate params
    const { error, value } = getPrescriptionDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const prescription =
      await doctorConsultationsService.getPrescriptionDetails(
        doctorId,
        value.prescriptionId
      );

    return sendResponse(
      res,
      200,
      'Prescription details retrieved successfully',
      prescription
    );
  } catch (error) {
    console.error('Error in getPrescriptionDetails:', error);

    if (error.message === 'PRESCRIPTION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Prescription not found or does not belong to this doctor'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve prescription details',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get consultation statistics
 * @route   GET /api/doctor/consultations/statistics
 * @access  Private (Doctor)
 */
export const getConsultationStats = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getConsultationStatsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const stats = await doctorConsultationsService.getConsultationStats(
      doctorId,
      value
    );

    return sendResponse(
      res,
      200,
      'Consultation statistics retrieved successfully',
      stats
    );
  } catch (error) {
    console.error('Error in getConsultationStats:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve consultation statistics',
      null,
      error.message
    );
  }
};
