import doctorAppointmentsService from '../service/appointments.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import {
  getRequestsSchema,
  acceptRequestSchema,
  rejectRequestSchema,
  getAppointmentDetailsSchema,
} from '../../../../../dto/doctor/appointments.dto.js';

/**
 * @desc    Get pending appointment requests
 * @route   GET /api/doctor/appointments/requests
 * @access  Private (Doctor)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getRequestsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorAppointmentsService.getPendingRequests(
      doctorId,
      value
    );

    return sendResponse(
      res,
      200,
      'Pending appointment requests retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getPendingRequests:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve pending requests',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get appointment request details
 * @route   GET /api/doctor/appointments/requests/:appointmentId
 * @access  Private (Doctor)
 */
export const getRequestDetails = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate params
    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await doctorAppointmentsService.getRequestDetails(
      doctorId,
      value.appointmentId
    );

    return sendResponse(
      res,
      200,
      'Appointment request details retrieved successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in getRequestDetails:', error);

    if (error.message === 'APPOINTMENT_NOT_FOUND') {
      return sendResponse(res, 404, 'Appointment request not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve appointment details',
      null,
      error.message
    );
  }
};

/**
 * @desc    Accept an appointment request
 * @route   POST /api/doctor/appointments/requests/:appointmentId/accept
 * @access  Private (Doctor)
 */
export const acceptRequest = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = acceptRequestSchema.validate({
      ...req.body,
      ...req.params,
    });
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await doctorAppointmentsService.acceptRequest(
      doctorId,
      value.appointmentId,
      value,
      req
    );

    return sendResponse(
      res,
      200,
      'Appointment request accepted successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in acceptRequest:', error);

    if (error.message === 'APPOINTMENT_NOT_FOUND_OR_ALREADY_PROCESSED') {
      return sendResponse(
        res,
        404,
        'Appointment request not found or already processed'
      );
    }

    if (error.message === 'SLOT_NOT_AVAILABLE') {
      return sendResponse(res, 400, 'Selected time slot is not available');
    }

    return sendResponse(
      res,
      500,
      'Failed to accept appointment request',
      null,
      error.message
    );
  }
};

/**
 * @desc    Reject an appointment request
 * @route   POST /api/doctor/appointments/requests/:appointmentId/reject
 * @access  Private (Doctor)
 */
export const rejectRequest = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = rejectRequestSchema.validate({
      ...req.body,
      ...req.params,
    });
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await doctorAppointmentsService.rejectRequest(
      doctorId,
      value.appointmentId,
      value,
      req
    );

    return sendResponse(
      res,
      200,
      'Appointment request rejected successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in rejectRequest:', error);

    if (error.message === 'APPOINTMENT_NOT_FOUND_OR_ALREADY_PROCESSED') {
      return sendResponse(
        res,
        404,
        'Appointment request not found or already processed'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to reject appointment request',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get accepted appointments (schedule)
 * @route   GET /api/doctor/appointments/accepted
 * @access  Private (Doctor)
 */
export const getAcceptedAppointments = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getRequestsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorAppointmentsService.getAcceptedAppointments(
      doctorId,
      value
    );

    return sendResponse(
      res,
      200,
      'Accepted appointments retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getAcceptedAppointments:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve accepted appointments',
      null,
      error.message
    );
  }
};

/**
 * @desc    Start an online consultation (generates Jitsi meeting link)
 * @route   POST /api/doctor/appointments/:appointmentId/start
 * @access  Private (Doctor)
 */
export const startConsultation = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    if (!doctorId) return sendResponse(res, 401, 'Unauthorized');

    const { appointmentId } = req.params;
    const result = await doctorAppointmentsService.startConsultation(
      doctorId,
      appointmentId,
      req
    );

    return sendResponse(res, 200, 'Consultation started successfully', result);
  } catch (error) {
    console.error('Error in startConsultation:', error);
    if (error.message === 'APPOINTMENT_NOT_FOUND_OR_NOT_READY') {
      return sendResponse(res, 404, 'Appointment not found or not ready to start');
    }
    return sendResponse(res, 500, 'Failed to start consultation', null, error.message);
  }
};

/**
 * @desc    Complete a consultation
 * @route   POST /api/doctor/appointments/:appointmentId/complete
 * @access  Private (Doctor)
 */
export const completeConsultation = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    if (!doctorId) return sendResponse(res, 401, 'Unauthorized');

    const { appointmentId } = req.params;
    const result = await doctorAppointmentsService.completeConsultation(
      doctorId,
      appointmentId,
      req.body,
      req
    );

    return sendResponse(res, 200, 'Consultation completed successfully', result);
  } catch (error) {
    console.error('Error in completeConsultation:', error);
    if (error.message === 'APPOINTMENT_NOT_FOUND_OR_ALREADY_COMPLETED') {
      return sendResponse(res, 404, 'Appointment not found or already completed');
    }
    return sendResponse(res, 500, 'Failed to complete consultation', null, error.message);
  }
};

/**
 * @desc    Mark appointment as missed
 * @route   POST /api/doctor/appointments/:appointmentId/missed
 * @access  Private (Doctor)
 */
export const markAsMissed = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    if (!doctorId) return sendResponse(res, 401, 'Unauthorized');

    const { appointmentId } = req.params;
    const result = await doctorAppointmentsService.markAsMissed(
      doctorId,
      appointmentId,
      req.body,
      req
    );

    return sendResponse(res, 200, 'Appointment marked as missed', result);
  } catch (error) {
    console.error('Error in markAsMissed:', error);
    if (error.message === 'APPOINTMENT_NOT_FOUND') {
      return sendResponse(res, 404, 'Appointment not found');
    }
    return sendResponse(res, 500, 'Failed to mark as missed', null, error.message);
  }
};

/**
 * @desc    Get meeting info for an appointment
 * @route   GET /api/doctor/appointments/:appointmentId/meeting
 * @access  Private (Doctor)
 */
export const getMeetingInfo = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    if (!doctorId) return sendResponse(res, 401, 'Unauthorized');

    const { appointmentId } = req.params;
    const result = await doctorAppointmentsService.getMeetingInfo(
      doctorId,
      appointmentId
    );

    return sendResponse(res, 200, 'Meeting info retrieved', result);
  } catch (error) {
    console.error('Error in getMeetingInfo:', error);
    if (error.message === 'APPOINTMENT_NOT_FOUND') {
      return sendResponse(res, 404, 'Appointment not found');
    }
    return sendResponse(res, 500, 'Failed to get meeting info', null, error.message);
  }
};
