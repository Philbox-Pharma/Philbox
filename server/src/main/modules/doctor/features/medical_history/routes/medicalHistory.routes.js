import express from 'express';
import {
  getDoctorPatients,
  getMedicalHistory,
} from '../controllers/medicalHistory.controller.js';
import {
  authenticate as requireDoctorAuth,
  isApprovedDoctor,
} from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { getMedicalHistorySchema } from '../../../../../dto/doctor/medicalHistory.dto.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);
router.use(isApprovedDoctor);
router.use(roleMiddleware(['doctor']));

/**
 * @route   GET /api/doctor/patients
 * @desc    Get all patients treated by the logged-in doctor
 * @access  Private (Doctor)
 * @query   page, limit, search
 */
router.get('/', rbacMiddleware(['read_patients']), getDoctorPatients);

/**
 * Custom validation middleware to combine params and query
 */
const validateMedicalHistoryRequest = (req, res, next) => {
  const dataToValidate = {
    patientId: req.params.patientId,
    ...req.query,
  };

  const { error } = getMedicalHistorySchema.validate(dataToValidate, {
    abortEarly: false,
  });

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
 * @route   GET /api/doctor/patients/:patientId/medical-history
 * @desc    Get patient's complete medical history
 * @access  Private (Doctor) - Only accessible for patients the doctor has treated
 * @query   startDate (optional), endDate (optional), page (optional), limit (optional)
 */
router.get(
  '/:patientId/medical-history',
  rbacMiddleware(['read_medical_history']),
  validateMedicalHistoryRequest,
  getMedicalHistory
);

export default router;
