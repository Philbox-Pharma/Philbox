import express from 'express';
import {
  getPastConsultations,
  getConsultationDetails,
  getPrescriptionDetails,
  getConsultationStats,
  getPatientHistoryFromConsultation,
  exportConsultationHistory,
  getConsultationSession,
  startConsultation,
  endConsultation,
  getConsultationMessages,
  sendConsultationMessage,
  updateConsultationRecording,
} from '../controllers/consultations.controller.js';
import {
  authenticate as requireDoctorAuth,
  isApprovedDoctor,
} from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { uploadRecordings } from '../../../../../middlewares/multer.middleware.js';
import { getConsultationPatientHistorySchema } from '../../../../../dto/doctor/consultations.dto.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);
router.use(isApprovedDoctor);
router.use(roleMiddleware(['doctor']));

/**
 * @route   GET /api/doctor/consultations/statistics
 * @desc    Get consultation statistics
 * @access  Private (Doctor)
 * @query   start_date (optional), end_date (optional)
 */
router.get(
  '/statistics',
  rbacMiddleware(['read_consultations']),
  getConsultationStats
);

/**
 * @route   GET /api/doctor/consultations/:consultationId/session
 * @desc    Get the live consultation session
 * @access  Private (Doctor)
 */
router.get(
  '/:consultationId/session',
  rbacMiddleware(['read_consultations']),
  getConsultationSession
);

/**
 * @route   POST /api/doctor/consultations/:consultationId/start
 * @desc    Start a live consultation
 * @access  Private (Doctor)
 */
router.post(
  '/:consultationId/start',
  rbacMiddleware(['update_consultations']),
  startConsultation
);

/**
 * @route   POST /api/doctor/consultations/:consultationId/end
 * @desc    End a live consultation
 * @access  Private (Doctor)
 */
router.post(
  '/:consultationId/end',
  rbacMiddleware(['update_consultations']),
  endConsultation
);

/**
 * @route   GET /api/doctor/consultations/:consultationId/messages
 * @desc    Get consultation messages
 * @access  Private (Doctor)
 */
router.get(
  '/:consultationId/messages',
  rbacMiddleware(['read_consultations']),
  getConsultationMessages
);

/**
 * @route   POST /api/doctor/consultations/:consultationId/messages
 * @desc    Send a consultation message
 * @access  Private (Doctor)
 */
router.post(
  '/:consultationId/messages',
  rbacMiddleware(['update_consultations']),
  sendConsultationMessage
);

/**
 * @route   POST /api/doctor/consultations/:consultationId/recording
 * @desc    Update consultation recording URL
 * @access  Private (Doctor)
 */
router.post(
  '/:consultationId/recording',
  rbacMiddleware(['update_consultations']),
  uploadRecordings.single('recordingFile'),
  updateConsultationRecording
);

/**
 * @route   GET /api/doctor/consultations/export/pdf
 * @desc    Export consultation history to PDF
 * @access  Private (Doctor)
 * @query   page, limit, patient_name, start_date, end_date, sort_by, sort_order
 */
router.get(
  '/export/pdf',
  rbacMiddleware(['export_consultation_history']),
  exportConsultationHistory
);

/**
 * @route   GET /api/doctor/consultations/prescription/:prescriptionId
 * @desc    Get prescription details
 * @access  Private (Doctor)
 */
router.get(
  '/prescription/:prescriptionId',
  rbacMiddleware(['read_prescriptions']),
  getPrescriptionDetails
);

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
  rbacMiddleware(['read_consultations']),
  validateConsultationPatientHistory,
  getPatientHistoryFromConsultation
);

/**
 * @route   GET /api/doctor/consultations/:consultationId
 * @desc    Get detailed information about a specific consultation
 * @access  Private (Doctor)
 */
router.get(
  '/:consultationId',
  rbacMiddleware(['read_consultations']),
  getConsultationDetails
);

/**
 * @route   GET /api/doctor/consultations
 * @desc    Get list of past consultations (completed appointments)
 * @access  Private (Doctor)
 * @query   page, limit, patient_name, start_date, end_date, sort_by, sort_order
 */
router.get('/', rbacMiddleware(['read_consultations']), getPastConsultations);

export default router;
