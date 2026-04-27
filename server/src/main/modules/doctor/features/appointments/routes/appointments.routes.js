import express from 'express';
import {
  getPendingRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  getAcceptedAppointments,
  startConsultation,
  completeConsultation,
  markAsMissed,
  getMeetingInfo,
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

/**
 * @route   POST /api/doctor/appointments/:appointmentId/start
 * @desc    Start an online consultation (generates Jitsi meeting link)
 * @access  Private (Doctor)
 */
router.post('/:appointmentId/start', startConsultation);

/**
 * @route   POST /api/doctor/appointments/:appointmentId/complete
 * @desc    Complete a consultation with notes
 * @access  Private (Doctor)
 * @body    notes (optional), recording_url (optional)
 */
router.post('/:appointmentId/complete', completeConsultation);

/**
 * @route   POST /api/doctor/appointments/:appointmentId/missed
 * @desc    Mark appointment as missed
 * @access  Private (Doctor)
 * @body    missed_by ('doctor' | 'patient')
 */
router.post('/:appointmentId/missed', markAsMissed);

/**
 * @route   GET /api/doctor/appointments/:appointmentId/meeting
 * @desc    Get meeting info for a specific appointment
 * @access  Private (Doctor)
 */
router.get('/:appointmentId/meeting', getMeetingInfo);

export default router;
