import express from 'express';
import {
  getPendingRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  getAcceptedAppointments,
} from '../controllers/appointments.controller.js';
import {
  authenticate as requireDoctorAuth,
  isApprovedDoctor,
} from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);
router.use(isApprovedDoctor);
router.use(roleMiddleware(['doctor']));

/**
 * @route   GET /api/doctor/appointments/requests
 * @desc    Get pending appointment requests
 * @access  Private (Doctor)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get(
  '/requests',
  rbacMiddleware(['read_appointments']),
  getPendingRequests
);

/**
 * @route   GET /api/doctor/appointments/requests/:appointmentId
 * @desc    Get appointment request details
 * @access  Private (Doctor)
 */
router.get(
  '/requests/:appointmentId',
  rbacMiddleware(['read_appointments']),
  getRequestDetails
);

/**
 * @route   POST /api/doctor/appointments/requests/:appointmentId/accept
 * @desc    Accept an appointment request
 * @access  Private (Doctor)
 * @body    slot_id (optional), notes (optional)
 */
router.post(
  '/requests/:appointmentId/accept',
  rbacMiddleware(['update_appointments']),
  acceptRequest
);

/**
 * @route   POST /api/doctor/appointments/requests/:appointmentId/reject
 * @desc    Reject an appointment request
 * @access  Private (Doctor)
 * @body    rejection_reason (required)
 */
router.post(
  '/requests/:appointmentId/reject',
  rbacMiddleware(['update_appointments']),
  rejectRequest
);

/**
 * @route   GET /api/doctor/appointments/accepted
 * @desc    Get accepted appointments (schedule)
 * @access  Private (Doctor)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get(
  '/accepted',
  rbacMiddleware(['read_appointments']),
  getAcceptedAppointments
);

export default router;
