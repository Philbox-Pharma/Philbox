import express from 'express';
import { validate } from '../../../../validator/joiValidate.middleware.js';
import {
  doctorRegisterDTO,
  verifyEmailDTO,
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
  // Note: Onboarding DTO is complex due to files, validation usually happens in controller or multer
} from '../../../../dto/doctor/auth.dto.js';
import {
  register,
  verifyEmail,
  login,
  submitOnboarding,
  forgetPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { upload } from '../../../../middlewares/multer.middleware.js'; // You need this for files

const router = express.Router();
router.use(authRoutesLimiter);

// ✅ 1. Registration (Basic Info)
router.post(`/register`, validate(doctorRegisterDTO), register);

// ✅ 2. Verify Email
router.post(`/verify-email`, validate(verifyEmailDTO), verifyEmail);

// ✅ 3. Login
router.post(`/login`, validate(loginDTO), login);

// ✅ 4. Onboarding (Submit Documents) - Requires Authentication first
// 'fields' configures multer to accept specific file keys
router.post(
  `/onboarding`,
  authenticate,
  upload.fields([
    { name: 'cnic', maxCount: 1 },
    { name: 'medical_license', maxCount: 1 },
    { name: 'specialist_license', maxCount: 1 },
    { name: 'mbbs_md_degree', maxCount: 1 },
    { name: 'experience_letters', maxCount: 1 },
  ]),
  submitOnboarding
);

// ✅ Forget Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);

// ✅ Reset Password
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ Logout
router.post(`/logout`, authenticate, logout);

export default router;
