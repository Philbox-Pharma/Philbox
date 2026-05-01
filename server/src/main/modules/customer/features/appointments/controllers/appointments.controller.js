import customerAppointmentsService from '../service/appointments.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import {
  createAppointmentRequestSchema,
  getMyRequestsSchema,
  cancelRequestSchema,
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
        value,
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
