import express from 'express';
import {
  getPastConsultations,
  getConsultationDetails,
  getPrescriptionDetails,
  getConsultationStats,
  getPatientHistoryFromConsultation,
} from '../controllers/consultations.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';
import { getConsultationPatientHistorySchema } from '../../../../../dto/doctor/consultations.dto.js';

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
 * Custom validation middleware for consultation patient history
 */
const validateConsultationPatientHistory = (req, res, next) => {
  const dataToValidate = {
    consultationId: req.params.consultationId,
    ...req.query,
  };

  const { error } = getConsultationPatientHistorySchema.validate(
    dataToValidate,
    { abortEarly: false }
  );

  if (error) {
    const details = error.details.map(d => d.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: details,
    });
  }

  next();
};

/**
 * @route   GET /api/doctor/consultations/:consultationId/patient-history
 * @desc    Get patient medical history from consultation context
 * @access  Private (Doctor)
 * @query   startDate (optional), endDate (optional), page (optional), limit (optional)
 */
router.get(
  '/:consultationId/patient-history',
  validateConsultationPatientHistory,
  getPatientHistoryFromConsultation
);

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
