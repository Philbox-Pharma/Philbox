import express from 'express';
import * as prescriptionsController from '../controllers/prescription.controller.js';
import {
  authenticate,
  isApprovedDoctor,
} from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  getPrescriptionByAppointmentSchema,
  getPrescriptionsByPatientSchema,
  prescriptionIdSchema,
} from '../../../../../dto/doctor/prescription.dto.js';

const router = express.Router();

/**
 * @route   POST /api/doctor/prescriptions
 * @desc    Create a new prescription for an appointment
 * @access  Private - Approved Doctor only
 */
router.post(
  '/',
  authenticate,
  isApprovedDoctor,
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
  authenticate,
  isApprovedDoctor,
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
  authenticate,
  isApprovedDoctor,
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
  authenticate,
  isApprovedDoctor,
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
  authenticate,
  isApprovedDoctor,
  validate(prescriptionIdSchema, 'params'),
  prescriptionsController.getPrescriptionPDF
);

export default router;
