import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import { completeProfileDTO } from '../../../../../dto/doctor/auth.dto.js';
import {
  submitApplication,
  getApplicationStatus,
  completeProfile,
} from '../controllers/onboarding.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// ✅ 1. Application Submission (authenticated users only)
router.post(
  `/submit-application`,
  authenticate,
  upload.fields([
    { name: 'cnic', maxCount: 1 },
    { name: 'medical_license', maxCount: 1 },
    { name: 'specialist_license', maxCount: 1 },
    { name: 'mbbs_md_degree', maxCount: 1 },
    { name: 'experience_letters', maxCount: 1 },
  ]),
  submitApplication
);

// ✅ 2. Get Application Status (authenticated users only)
router.get(`/application-status`, authenticate, getApplicationStatus);

// ✅ 3. Complete Profile (authenticated users only)
router.post(
  `/complete-profile`,
  authenticate,
  validate(completeProfileDTO),
  upload.fields([
    { name: 'education_files', maxCount: 5 },
    { name: 'experience_files', maxCount: 10 },
    { name: 'digital_signature', maxCount: 1 },
    { name: 'profile_img', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
  ]),
  completeProfile
);

export default router;
