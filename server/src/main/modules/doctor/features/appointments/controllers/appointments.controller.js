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
