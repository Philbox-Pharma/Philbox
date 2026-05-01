import express from 'express';
import {
  getPendingRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  getAcceptedAppointments,
} from '../controllers/appointments.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);

/**
 * @route   GET /api/doctor/appointments/requests
 * @desc    Get pending appointment requests
 * @access  Private (Doctor)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/requests', getPendingRequests);

/**
 * @route   GET /api/doctor/appointments/requests/:appointmentId
 * @desc    Get appointment request details
 * @access  Private (Doctor)
 */
router.get('/requests/:appointmentId', getRequestDetails);

/**
 * @route   POST /api/doctor/appointments/requests/:appointmentId/accept
 * @desc    Accept an appointment request
 * @access  Private (Doctor)
 * @body    slot_id (optional), notes (optional)
 */
router.post('/requests/:appointmentId/accept', acceptRequest);

/**
 * @route   POST /api/doctor/appointments/requests/:appointmentId/reject
 * @desc    Reject an appointment request
 * @access  Private (Doctor)
 * @body    rejection_reason (required)
 */
router.post('/requests/:appointmentId/reject', rejectRequest);

/**
 * @route   GET /api/doctor/appointments/accepted
 * @desc    Get accepted appointments (schedule)
 * @access  Private (Doctor)
 * @query   page, limit, status, appointment_type, sort_by, sort_order
 */
router.get('/accepted', getAcceptedAppointments);

export default router;
