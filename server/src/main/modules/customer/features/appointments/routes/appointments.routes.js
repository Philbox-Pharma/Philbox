import express from 'express';
import {
  createAppointmentRequest,
  getMyRequests,
  getRequestStatus,
  cancelRequest,
  rescheduleRequest,
  getMyAppointments,
  getConsultationSession,
  joinConsultation,
  getConsultationMessages,
  sendConsultationMessage,
  createConsultationReview,
} from '../controllers/appointments.controller.js';
import { authenticate as requireCustomerAuth } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { uploadDocuments } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// All routes require customer authentication
router.use(requireCustomerAuth);
router.use(roleMiddleware(['customer']));

/**
 * @route   POST /api/customer/appointments/requests
 * @desc    Create a new appointment request
 * @access  Private (Customer)
 * @body    doctor_id, slot_id (optional), appointment_type, consultation_reason, preferred_date (optional), preferred_time (optional)
 */
router.post(
  '/requests',
  rbacMiddleware(['create_appointments']),
  uploadDocuments.array('medical_documents', 5),
  createAppointmentRequest
);

/**
 * @route   GET /api/customer/appointments/requests
 * @desc    Get customer's appointment requests
 * @access  Private (Customer)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/requests', rbacMiddleware(['read_appointments']), getMyRequests);

/**
 * @route   GET /api/customer/appointments/requests/:appointmentId
 * @desc    Get appointment request status/details
 * @access  Private (Customer)
 */
router.get(
  '/requests/:appointmentId',
  rbacMiddleware(['read_appointments']),
  getRequestStatus
);

/**
 * @route   POST /api/customer/appointments/requests/:appointmentId/cancel
 * @desc    Cancel an appointment request
 * @access  Private (Customer)
 * @body    cancellation_reason (optional)
 */
router.post(
  '/requests/:appointmentId/cancel',
  rbacMiddleware(['update_appointments']),
  cancelRequest
);

/**
 * @route   PATCH /api/customer/appointments/requests/:appointmentId/reschedule
 * @desc    Reschedule an appointment request (only while processing)
 * @access  Private (Customer)
 */
router.patch(
  '/requests/:appointmentId/reschedule',
  rbacMiddleware(['update_appointments']),
  rescheduleRequest
);

/**
 * @route   GET /api/customer/appointments/requests/:appointmentId/consultation
 * @desc    Get consultation room/session details
 * @access  Private (Customer)
 */
router.get(
  '/requests/:appointmentId/consultation',
  rbacMiddleware(['read_appointments']),
  getConsultationSession
);

/**
 * @route   POST /api/customer/appointments/requests/:appointmentId/consultation/join
 * @desc    Join a consultation room
 * @access  Private (Customer)
 */
router.post(
  '/requests/:appointmentId/consultation/join',
  rbacMiddleware(['read_appointments']),
  joinConsultation
);

/**
 * @route   GET /api/customer/appointments/requests/:appointmentId/messages
 * @desc    Get chat messages for a consultation
 * @access  Private (Customer)
 */
router.get(
  '/requests/:appointmentId/messages',
  rbacMiddleware(['read_appointments']),
  getConsultationMessages
);

/**
 * @route   POST /api/customer/appointments/requests/:appointmentId/messages
 * @desc    Send a chat message in a consultation
 * @access  Private (Customer)
 */
router.post(
  '/requests/:appointmentId/messages',
  rbacMiddleware(['update_appointments']),
  sendConsultationMessage
);

/**
 * @route   POST /api/customer/appointments/requests/:appointmentId/review
 * @desc    Review a completed consultation
 * @access  Private (Customer)
 */
router.post(
  '/requests/:appointmentId/review',
  rbacMiddleware(['create_appointments']),
  createConsultationReview
);

/**
 * @route   GET /api/customer/appointments
 * @desc    Get accepted appointments
 * @access  Private (Customer)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/', rbacMiddleware(['read_appointments']), getMyAppointments);

export default router;
