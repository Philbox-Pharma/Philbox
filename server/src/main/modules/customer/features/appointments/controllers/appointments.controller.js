import customerAppointmentsService from '../service/appointments.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import {
  createAppointmentRequestSchema,
  getMyRequestsSchema,
  cancelRequestSchema,
  rescheduleRequestSchema,
  getAppointmentDetailsSchema,
} from '../../../../../dto/customer/appointments.dto.js';

/**
 * @desc    Create a new appointment request
 * @route   POST /api/customer/appointments/requests
 * @access  Private (Customer)
 */
export const createAppointmentRequest = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = createAppointmentRequestSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment =
      await customerAppointmentsService.createAppointmentRequest(
        customerId,
        {
          ...value,
          upload_files: Array.isArray(req.files) ? req.files : [],
        },
        req
      );

    return sendResponse(
      res,
      201,
      'Appointment request created successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in createAppointmentRequest:', error);

    if (error.message === 'DOCTOR_NOT_FOUND_OR_INACTIVE') {
      return sendResponse(res, 404, 'Doctor not found or inactive');
    }

    if (error.message === 'SLOT_NOT_AVAILABLE') {
      return sendResponse(res, 400, 'Selected time slot is not available');
    }

    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return sendResponse(res, 404, 'Customer not found');
    }

    if (
      [
        'INVALID_PAYMENT_METHOD',
        'WALLET_NUMBER_REQUIRED',
        'STRIPE_PAYMENT_METHOD_REQUIRED',
        'STRIPE_PAYMENT_NOT_COMPLETED',
        'JAZZCASH_PAYMENT_FAILED',
        'EASYPAISA_PAYMENT_FAILED',
        'INVALID_CONSULTATION_FEE',
        'CURRENCY_NOT_CONFIGURED',
      ].includes(error.message)
    ) {
      return sendResponse(res, 400, error.message.replace(/_/g, ' '));
    }

    if (
      [
        'STRIPE_NOT_CONFIGURED',
        'JAZZCASH_NOT_CONFIGURED',
        'EASYPAISA_NOT_CONFIGURED',
      ].includes(error.message)
    ) {
      return sendResponse(res, 503, error.message.replace(/_/g, ' '));
    }

    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(
        res,
        400,
        'Failed to upload one or more medical documents'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to create appointment request',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get customer's appointment requests
 * @route   GET /api/customer/appointments/requests
 * @access  Private (Customer)
 */
export const getMyRequests = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getMyRequestsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await customerAppointmentsService.getMyRequests(
      customerId,
      value
    );

    return sendResponse(
      res,
      200,
      'Appointment requests retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getMyRequests:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve appointment requests',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get appointment request status/details
 * @route   GET /api/customer/appointments/requests/:appointmentId
 * @access  Private (Customer)
 */
export const getRequestStatus = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate params
    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await customerAppointmentsService.getRequestStatus(
      customerId,
      value.appointmentId
    );

    return sendResponse(
      res,
      200,
      'Appointment request details retrieved successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in getRequestStatus:', error);

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
 * @desc    Cancel an appointment request
 * @route   POST /api/customer/appointments/requests/:appointmentId/cancel
 * @access  Private (Customer)
 */
export const cancelRequest = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = cancelRequestSchema.validate({
      ...req.body,
      ...req.params,
    });
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await customerAppointmentsService.cancelRequest(
      customerId,
      value.appointmentId,
      value,
      req
    );

    return sendResponse(
      res,
      200,
      'Appointment request cancelled successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in cancelRequest:', error);

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
      'Failed to cancel appointment request',
      null,
      error.message
    );
  }
};

/**
 * @desc    Reschedule an appointment request (only while processing)
 * @route   PATCH /api/customer/appointments/requests/:appointmentId/reschedule
 * @access  Private (Customer)
 */
export const rescheduleRequest = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = rescheduleRequestSchema.validate({
      ...req.params,
      ...req.body,
    });

    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const appointment = await customerAppointmentsService.rescheduleRequest(
      customerId,
      value.appointmentId,
      value,
      req
    );

    return sendResponse(
      res,
      200,
      'Appointment request rescheduled successfully',
      appointment
    );
  } catch (error) {
    console.error('Error in rescheduleRequest:', error);

    if (error.message === 'APPOINTMENT_NOT_RESCHEDULABLE') {
      return sendResponse(
        res,
        409,
        'Appointment request cannot be rescheduled once accepted/cancelled'
      );
    }

    if (error.message === 'SLOT_NOT_AVAILABLE') {
      return sendResponse(res, 400, 'Selected time slot is not available');
    }

    return sendResponse(
      res,
      500,
      'Failed to reschedule appointment request',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get accepted appointments
 * @route   GET /api/customer/appointments
 * @access  Private (Customer)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getMyRequestsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await customerAppointmentsService.getMyAppointments(
      customerId,
      value
    );

    return sendResponse(
      res,
      200,
      'Appointments retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getMyAppointments:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve appointments',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get consultation session details for an appointment
 * @route   GET /api/customer/appointments/requests/:appointmentId/consultation
 * @access  Private (Customer)
 */
export const getConsultationSession = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await customerAppointmentsService.getConsultationSession(
      customerId,
      value.appointmentId
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
 * @desc    Join the live consultation room
 * @route   POST /api/customer/appointments/requests/:appointmentId/consultation/join
 * @access  Private (Customer)
 */
export const joinConsultation = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await customerAppointmentsService.joinConsultation(
      customerId,
      value.appointmentId
    );

    await logCustomerActivity(
      req,
      'join_consultation',
      `Joined consultation room for appointment ${value.appointmentId}`,
      'appointments',
      value.appointmentId,
      {
        room_name: result.room_name,
        consultation_mode: result.can_video_call ? 'video' : 'chat',
      }
    );

    return sendResponse(
      res,
      200,
      'Consultation room joined successfully',
      result
    );
  } catch (error) {
    console.error('Error in joinConsultation:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }
    if (error.message === 'CONSULTATION_NOT_READY') {
      return sendResponse(res, 409, 'Consultation is not ready yet');
    }

    return sendResponse(
      res,
      500,
      'Failed to join consultation room',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get consultation messages
 * @route   GET /api/customer/appointments/requests/:appointmentId/messages
 * @access  Private (Customer)
 */
export const getConsultationMessages = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await customerAppointmentsService.listConsultationMessages(
      customerId,
      value.appointmentId,
      {
        page: req.query.page,
        limit: req.query.limit,
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
 * @desc    Send a chat message during consultation
 * @route   POST /api/customer/appointments/requests/:appointmentId/messages
 * @access  Private (Customer)
 */
export const sendConsultationMessage = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const text = String(req.body?.text || '').trim();
    const mediaUrl = req.body?.media_url || req.body?.mediaUrl || null;

    if (!text && !mediaUrl) {
      return sendResponse(res, 400, 'Message content is required');
    }

    const result = await customerAppointmentsService.sendConsultationMessage(
      customerId,
      value.appointmentId,
      { text, media_url: mediaUrl }
    );

    await logCustomerActivity(
      req,
      'send_consultation_message',
      `Sent consultation message for appointment ${value.appointmentId}`,
      'appointments',
      value.appointmentId,
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
 * @desc    Review a completed consultation
 * @route   POST /api/customer/appointments/requests/:appointmentId/review
 * @access  Private (Customer)
 */
export const createConsultationReview = async (req, res) => {
  try {
    const customerId = req.session.customerId || req.user?.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { error, value } = getAppointmentDetailsSchema.validate(req.params);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const rating = Number(req.body?.rating);
    const message = String(req.body?.message || '').trim();

    const result = await customerAppointmentsService.createConsultationReview(
      customerId,
      value.appointmentId,
      { rating, message }
    );

    await logCustomerActivity(
      req,
      'review_consultation',
      `Reviewed consultation for appointment ${value.appointmentId}`,
      'appointments',
      value.appointmentId,
      { rating }
    );

    return sendResponse(res, 201, 'Consultation review created successfully', {
      review: result.review,
    });
  } catch (error) {
    console.error('Error in createConsultationReview:', error);

    if (error.message === 'CONSULTATION_NOT_FOUND') {
      return sendResponse(res, 404, 'Consultation not found');
    }
    if (error.message === 'CONSULTATION_NOT_COMPLETED') {
      return sendResponse(
        res,
        409,
        'Consultation must be completed before reviewing'
      );
    }
    if (error.message === 'INVALID_RATING') {
      return sendResponse(res, 400, 'Rating must be between 1 and 5');
    }
    if (error.message === 'REVIEW_MESSAGE_REQUIRED') {
      return sendResponse(res, 400, 'Review message is required');
    }
    if (error.message === 'INVALID_REVIEW_MESSAGE_LENGTH') {
      return sendResponse(
        res,
        400,
        'Review message must be between 10 and 500 characters'
      );
    }
    if (error.message === 'REVIEW_ALREADY_EXISTS') {
      return sendResponse(
        res,
        409,
        'Review already exists for this consultation'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to create consultation review',
      null,
      error.message
    );
  }
};
