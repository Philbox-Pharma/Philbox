import express from 'express';
import * as prescriptionsController from '../controllers/prescription.controller.js';
import {
  authenticate,
  isApprovedDoctor,
} from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  getPrescriptionByAppointmentSchema,
  getPrescriptionsByPatientSchema,
  prescriptionIdSchema,
} from '../../../../../dto/doctor/prescription.dto.js';

const router = express.Router();

router.use(authenticate);
router.use(isApprovedDoctor);
router.use(roleMiddleware(['doctor']));

/**
 * @route   POST /api/doctor/prescriptions
 * @desc    Create a new prescription for an appointment
 * @access  Private - Approved Doctor only
 */
router.post(
  '/',
  rbacMiddleware(['create_prescriptions']),
  validate(createPrescriptionSchema, 'body'),
  prescriptionsController.createPrescription
);

/**
 * @route   GET /api/doctor/prescriptions/appointment/:appointmentId
 * @desc    Get prescription for a specific appointment
 * @access  Private - Approved Doctor only
 */
router.get(
  '/appointment/:appointmentId',
  rbacMiddleware(['read_prescriptions']),
  validate(getPrescriptionByAppointmentSchema, 'params'),
  prescriptionsController.getPrescriptionByAppointment
);

/**
 * @route   GET /api/doctor/prescriptions/patient/:patientId
 * @desc    Get all prescriptions for a specific patient
 * @access  Private - Approved Doctor only
 */
router.get(
  '/patient/:patientId',
  rbacMiddleware(['read_prescriptions']),
  validate(getPrescriptionsByPatientSchema, 'params'),
  prescriptionsController.getPrescriptionsByPatient
);

/**
 * @route   PUT /api/doctor/prescriptions/:prescriptionId
 * @desc    Update an existing prescription
 * @access  Private - Approved Doctor only
 */
router.put(
  '/:prescriptionId',
  rbacMiddleware(['update_prescriptions']),
  validate(prescriptionIdSchema, 'params'),
  validate(updatePrescriptionSchema, 'body'),
  prescriptionsController.updatePrescription
);

/**
 * @route   GET /api/doctor/prescriptions/:prescriptionId/pdf
 * @desc    Get PDF URL for a prescription
 * @access  Private - Approved Doctor only
 */
router.get(
  '/:prescriptionId/pdf',
  rbacMiddleware(['export_prescriptions']),
  validate(prescriptionIdSchema, 'params'),
  prescriptionsController.getPrescriptionPDF
);

export default router;
