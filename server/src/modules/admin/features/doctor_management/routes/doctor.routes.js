import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getDoctorApplications,
  getDoctorApplicationById,
  approveDoctorApplication,
  rejectDoctorApplication,
} from '../controller/doctor.controller.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  getDoctorApplicationsDTO,
  approveDoctorApplicationDTO,
  rejectDoctorApplicationDTO,
} from '../../../../../dto/admin/doctorApplication.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== DOCTOR APPLICATION MANAGEMENT =====
 */

// 🩺 GET All Doctor Applications (with filters)
// Super Admin & Branch Admin can view pending applications
router.get(
  '/applications',
  validate(getDoctorApplicationsDTO, 'query'),
  getDoctorApplications
);

// 🩺 GET Single Doctor Application by ID
router.get('/applications/:id', getDoctorApplicationById);

// ✅ APPROVE Doctor Application
router.patch(
  '/applications/:id/approve',
  validate(approveDoctorApplicationDTO),
  approveDoctorApplication
);

// ❌ REJECT Doctor Application
router.patch(
  '/applications/:id/reject',
  validate(rejectDoctorApplicationDTO),
  rejectDoctorApplication
);

export default router;
