import express from 'express';
import {
  createAppointmentRequest,
  getMyRequests,
  getRequestStatus,
  cancelRequest,
  getMyAppointments,
} from '../controllers/appointments.controller.js';
import { authenticate as requireCustomerAuth } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require customer authentication
router.use(requireCustomerAuth);

/**
 * @route   POST /api/customer/appointments/requests
 * @desc    Create a new appointment request
 * @access  Private (Customer)
 * @body    doctor_id, slot_id (optional), appointment_type, consultation_reason, preferred_date (optional), preferred_time (optional)
 */
router.post('/requests', createAppointmentRequest);

/**
 * @route   GET /api/customer/appointments/requests
 * @desc    Get customer's appointment requests
 * @access  Private (Customer)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/requests', getMyRequests);

/**
 * @route   GET /api/customer/appointments/requests/:appointmentId
 * @desc    Get appointment request status/details
 * @access  Private (Customer)
 */
router.get('/requests/:appointmentId', getRequestStatus);

/**
 * @route   POST /api/customer/appointments/requests/:appointmentId/cancel
 * @desc    Cancel an appointment request
 * @access  Private (Customer)
 * @body    cancellation_reason (optional)
 */
router.post('/requests/:appointmentId/cancel', cancelRequest);

/**
 * @route   GET /api/customer/appointments
 * @desc    Get accepted appointments
 * @access  Private (Customer)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/', getMyAppointments);

export default router;
