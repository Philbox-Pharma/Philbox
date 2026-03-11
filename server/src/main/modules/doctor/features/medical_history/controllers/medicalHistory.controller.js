import sendResponse from '../../../../../utils/sendResponse.js';
import { getPatientMedicalHistory } from '../service/medicalHistory.service.js';

/**
 * @desc    Get patient's medical history
 * @route   GET /api/doctor/patients/:patientId/medical-history
 * @access  Private (Doctor)
 */
export const getMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;

    const result = await getPatientMedicalHistory(
      req,
      patientId,
      startDate,
      endDate
    );

    return sendResponse(
      res,
      200,
      'Patient medical history retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getMedicalHistory:', error);

    // Handle specific error types
    if (error.message.startsWith('UNAUTHORIZED_ACCESS')) {
      return sendResponse(
        res,
        403,
        error.message.replace('UNAUTHORIZED_ACCESS: ', ''),
        null
      );
    }

    if (error.message.startsWith('PATIENT_NOT_FOUND')) {
      return sendResponse(
        res,
        404,
        error.message.replace('PATIENT_NOT_FOUND: ', ''),
        null
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve patient medical history',
      null,
      error.message
    );
  }
};
