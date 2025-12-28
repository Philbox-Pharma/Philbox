import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  doctorRegisterDTO,
  verifyEmailDTO,
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
  completeProfileDTO,
} from '../../../../../dto/doctor/auth.dto.js';
import {
  register,
  verifyEmail,
  login,
  submitApplication,
  completeProfile,
  forgetPassword,
  resetPassword,
  logout,
  googleAuth, // <--- Add this
  googleAuthCallback, // <--- Add this
  getMe,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import passport from '../config/passport.js';

const router = express.Router();

// ✅ 1. Registration (rate limited)
router.post(
  `/register`,
  authRoutesLimiter,
  validate(doctorRegisterDTO),
  register
);

// ✅ 2. Verify Email (rate limited)
router.post(
  `/verify-email`,
  authRoutesLimiter,
  validate(verifyEmailDTO),
  verifyEmail
);

// ✅ 3. Login (rate limited)
router.post(`/login`, authRoutesLimiter, validate(loginDTO), login);

// ✅ 4. Application Submission (NOT rate limited - authenticated users only)
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

// ✅ 5. Complete Profile (NOT rate limited - authenticated users only)
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

// ✅ Forget Password (rate limited)
router.post(
  `/forget-password`,
  authRoutesLimiter,
  validate(forgetPasswordDTO),
  forgetPassword
);

// ✅ Reset Password (rate limited)
router.post(
  `/reset-password`,
  authRoutesLimiter,
  validate(resetPasswordDTO),
  resetPassword
);

// ✅ Get Current Doctor (NOT rate limited)
router.get(`/me`, authenticate, getMe);

// ✅ Logout (NOT rate limited)
router.post(`/logout`, authenticate, logout);

// ✅ Google OAuth (rate limited)
router.get(`/google`, authRoutesLimiter, googleAuth);
router.get(
  `/google/callback`,
  passport.authenticate('doctor-google', {
    failureRedirect: '/auth/oauth/error',
  }),
  googleAuthCallback
);

export default router;
