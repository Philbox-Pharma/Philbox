import doctorConsultationsService from '../service/consultations.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
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

    await logDoctorActivity(
      req,
      'view_consultation_history',
      `Viewed past consultations with filters: ${JSON.stringify(value)}`,
      'appointments',
      null,
      {
        filters: value,
        total_consultations:
          result.pagination?.total_items ?? result.consultations?.length ?? 0,
      }
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

    await logDoctorActivity(
      req,
      'view_consultation_details',
      `Viewed consultation details for ${value.consultationId}`,
      'appointments',
      value.consultationId,
      {
        consultation_id: value.consultationId,
        patient_name: result.appointment?.patient_id?.fullName || null,
      }
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

    await logDoctorActivity(
      req,
      'view_consultation_prescription',
      `Viewed prescription details for ${value.prescriptionId}`,
      'prescriptions',
      value.prescriptionId,
      {
        prescription_id: value.prescriptionId,
        patient_name: prescription.patient_id?.fullName || null,
      }
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

    await logDoctorActivity(
      req,
      'view_consultation_statistics',
      `Viewed consultation statistics with filters: ${JSON.stringify(value)}`,
      'appointments',
      null,
      {
        filters: value,
        statistics: stats,
      }
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

/**
 * @desc    Get patient's medical history from consultation context
 * @route   GET /api/doctor/consultations/:consultationId/patient-history
 * @access  Private (Doctor)
 */
export const getPatientHistoryFromConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { startDate, endDate } = req.query;

    const result =
      await doctorConsultationsService.getPatientHistoryFromConsultation(
        req,
        consultationId,
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
    console.error('Error in getPatientHistoryFromConsultation:', error);

    // Handle specific error types
    if (error.message.startsWith('UNAUTHORIZED_ACCESS')) {
      return sendResponse(
        res,
        403,
        error.message.replace('UNAUTHORIZED_ACCESS: ', ''),
        null
      );
    }

    if (error.message.startsWith('CONSULTATION_NOT_FOUND')) {
      return sendResponse(
        res,
        404,
        error.message.replace('CONSULTATION_NOT_FOUND: ', ''),
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

/**
 * @desc    Get the live consultation session
 * @route   GET /api/doctor/consultations/:consultationId/session
 * @access  Private (Doctor)
 */
export const getConsultationSession = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    const result = await doctorConsultationsService.getConsultationSession(
      doctorId,
      consultationId
    );

    await logDoctorActivity(
      req,
      'view_consultation_session',
      `Viewed consultation session for ${consultationId}`,
      'appointments',
      consultationId
    );

    return sendResponse(
      res,
      200,
      'Consultation session fetched successfully',
      result
    );
  } catch (error) {
    console.error('Error in getConsultationSession:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }
    if (error.message === 'CONSULTATION_NOT_READY') {
      return sendResponse(res, 409, 'Consultation is not ready yet');
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve consultation session',
      null,
      error.message
    );
  }
};

/**
 * @desc    Start a live consultation
 * @route   POST /api/doctor/consultations/:consultationId/start
 * @access  Private (Doctor)
 */
export const startConsultation = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    const result = await doctorConsultationsService.startConsultation(
      doctorId,
      consultationId
    );

    await logDoctorActivity(
      req,
      'start_consultation',
      `Started consultation ${consultationId}`,
      'appointments',
      consultationId
    );

    return sendResponse(res, 200, 'Consultation started successfully', result);
  } catch (error) {
    console.error('Error in startConsultation:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }
    if (error.message === 'CONSULTATION_NOT_READY') {
      return sendResponse(res, 409, 'Consultation is not ready yet');
    }
    if (error.code === 'CONSULTATION_OUTSIDE_SLOT_WINDOW') {
      return sendResponse(
        res,
        409,
        'Consultation can only be started during the scheduled slot time and date.'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to start consultation',
      null,
      error.message
    );
  }
};

/**
 * @desc    End a live consultation
 * @route   POST /api/doctor/consultations/:consultationId/end
 * @access  Private (Doctor)
 */
export const endConsultation = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    const result = await doctorConsultationsService.endConsultation(
      doctorId,
      consultationId,
      {
        recording_url:
          req.body?.recording_url || req.body?.recordingUrl || null,
        notes: req.body?.notes || null,
      }
    );

    await logDoctorActivity(
      req,
      'end_consultation',
      `Ended consultation ${consultationId}`,
      'appointments',
      consultationId,
      {
        recording_url:
          req.body?.recording_url || req.body?.recordingUrl || null,
      }
    );

    return sendResponse(res, 200, 'Consultation ended successfully', result);
  } catch (error) {
    console.error('Error in endConsultation:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to end consultation',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get consultation messages
 * @route   GET /api/doctor/consultations/:consultationId/messages
 * @access  Private (Doctor)
 */
export const getConsultationMessages = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    const result = await doctorConsultationsService.listConsultationMessages(
      doctorId,
      consultationId,
      {
        page: req.query.page,
        limit: req.query.limit,
      }
    );

    await logDoctorActivity(
      req,
      'view_consultation_messages',
      `Viewed consultation messages for ${consultationId}`,
      'appointments',
      consultationId,
      {
        messages_count: result.messages?.length ?? result.items?.length ?? 0,
      }
    );

    return sendResponse(
      res,
      200,
      'Consultation messages fetched successfully',
      result
    );
  } catch (error) {
    console.error('Error in getConsultationMessages:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve consultation messages',
      null,
      error.message
    );
  }
};

/**
 * @desc    Send a consultation message
 * @route   POST /api/doctor/consultations/:consultationId/messages
 * @access  Private (Doctor)
 */
export const sendConsultationMessage = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    const text = String(req.body?.text || '').trim();
    const mediaUrl = req.body?.media_url || req.body?.mediaUrl || null;

    if (!text && !mediaUrl) {
      return sendResponse(res, 400, 'Message content is required');
    }

    const result = await doctorConsultationsService.sendConsultationMessage(
      doctorId,
      consultationId,
      { text, media_url: mediaUrl }
    );

    await logDoctorActivity(
      req,
      'send_consultation_message',
      `Sent consultation message for ${consultationId}`,
      'appointments',
      consultationId,
      { has_media: Boolean(mediaUrl) }
    );

    return sendResponse(
      res,
      201,
      'Consultation message sent successfully',
      result
    );
  } catch (error) {
    console.error('Error in sendConsultationMessage:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }
    if (error.message === 'MESSAGE_CONTENT_REQUIRED') {
      return sendResponse(res, 400, 'Message content is required');
    }

    return sendResponse(
      res,
      500,
      'Failed to send consultation message',
      null,
      error.message
    );
  }
};

/**
 * @desc    Update recording URL for a consultation
 * @route   POST /api/doctor/consultations/:consultationId/recording
 * @access  Private (Doctor)
 */
export const updateConsultationRecording = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { consultationId } = req.params;
    let recordingUrl = req.body?.recording_url || req.body?.recordingUrl;

    if (req.file?.path) {
      recordingUrl = await uploadToCloudinary(
        req.file.path,
        'consultation_recordings'
      );
    }

    if (!recordingUrl) {
      return sendResponse(res, 400, 'Recording URL is required');
    }

    const result = await doctorConsultationsService.updateRecordingUrl(
      doctorId,
      consultationId,
      recordingUrl
    );

    await logDoctorActivity(
      req,
      'update_consultation_recording',
      `Updated consultation recording for ${consultationId}`,
      'appointments',
      consultationId,
      { recording_url: recordingUrl }
    );

    return sendResponse(res, 200, 'Recording URL updated successfully', result);
  } catch (error) {
    console.error('Error in updateConsultationRecording:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to update recording URL',
      null,
      error.message
    );
  }
};

/**
 * @desc    Export consultation history to PDF
 * @route   GET /api/doctor/consultations/export/pdf
 * @access  Private (Doctor)
 */
export const exportConsultationHistory = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getPastConsultationsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorConsultationsService.exportConsultationHistory(
      doctorId,
      value,
      req.doctor
    );

    await logDoctorActivity(
      req,
      'export_consultation_history_pdf',
      `Exported consultation history to PDF with filters: ${JSON.stringify(value)}`,
      'appointments',
      null,
      {
        filters: value,
        total_consultations: result.total_consultations,
        pdf_url: result.pdf_url,
      }
    );

    return sendResponse(
      res,
      200,
      'Consultation history exported successfully',
      result
    );
  } catch (error) {
    console.error('Error in exportConsultationHistory:', error);
    return sendResponse(
      res,
      500,
      'Failed to export consultation history',
      null,
      error.message
    );
  }
};
