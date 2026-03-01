import express from 'express';
import {
  getPastConsultations,
  getConsultationDetails,
  getPrescriptionDetails,
  getConsultationStats,
} from '../controllers/consultations.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);

/**
 * @route   GET /api/doctor/consultations/statistics
 * @desc    Get consultation statistics
 * @access  Private (Doctor)
 * @query   start_date (optional), end_date (optional)
 */
router.get('/statistics', getConsultationStats);

/**
 * @route   GET /api/doctor/consultations/prescription/:prescriptionId
 * @desc    Get prescription details
 * @access  Private (Doctor)
 */
router.get('/prescription/:prescriptionId', getPrescriptionDetails);

/**
 * @route   GET /api/doctor/consultations/:consultationId
 * @desc    Get detailed information about a specific consultation
 * @access  Private (Doctor)
 */
router.get('/:consultationId', getConsultationDetails);

/**
 * @route   GET /api/doctor/consultations
 * @desc    Get list of past consultations (completed appointments)
 * @access  Private (Doctor)
 * @query   page, limit, patient_name, start_date, end_date, sort_by, sort_order
 */
router.get('/', getPastConsultations);

export default router;
