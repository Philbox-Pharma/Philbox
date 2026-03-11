import express from 'express';
import { getMedicalHistory } from '../controllers/medicalHistory.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';
import { getMedicalHistorySchema } from '../../../../../dto/doctor/medicalHistory.dto.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);

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
  validateMedicalHistoryRequest,
  getMedicalHistory
);

export default router;
