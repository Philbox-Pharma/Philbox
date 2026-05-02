import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getDoctorApplications,
  getDoctorApplicationById,
  approveDoctorApplication,
  rejectDoctorApplication,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateDoctorStatus,
  getDoctorPerformanceMetrics,
  getDoctorStats,
} from '../controller/doctor.controller.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  getDoctorApplicationsDTO,
  approveDoctorApplicationDTO,
  rejectDoctorApplicationDTO,
} from '../../../../../dto/admin/doctorApplication.dto.js';
import {
  getDoctorsDTO,
  updateDoctorProfileDTO,
  updateDoctorStatusDTO,
} from '../../../../../dto/admin/doctor.dto.js';

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

/**
 * ===== DOCTOR PROFILE MANAGEMENT =====
 */

// 🩺 GET All Doctors (with filters & search)
router.get('/', validate(getDoctorsDTO, 'query'), getAllDoctors);

// 📊 GET Doctor Stats (Counts by status)
router.get('/stats', getDoctorStats);

// 📊 GET Doctor Performance Metrics (must come before /:id to avoid conflicts)
router.get('/:id/metrics', getDoctorPerformanceMetrics);

// 🩺 GET Single Doctor by ID (with details & metrics)
router.get('/:id', getDoctorById);

// ✏️ UPDATE Doctor Profile
router.put('/:id', validate(updateDoctorProfileDTO), updateDoctorProfile);

// 🔄 UPDATE Doctor Account Status (Suspend/Activate/Block)
router.patch(
  '/:id/status',
  validate(updateDoctorStatusDTO),
  updateDoctorStatus
);

export default router;
