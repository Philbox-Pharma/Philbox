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
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import passport from '../config/passport.js';

const router = express.Router();
router.use(authRoutesLimiter);

// ✅ 1. Registration (Basic Info: name, email, password, gender, DOB, contact)
router.post(`/register`, validate(doctorRegisterDTO), register);

// ✅ 2. Verify Email
router.post(`/verify-email`, validate(verifyEmailDTO), verifyEmail);

// ✅ 3. Login
router.post(`/login`, validate(loginDTO), login);

// ✅ 4. Application Submission (Document Upload) - Step 1 of Onboarding
// This submits documents for admin verification
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

// ✅ 5. Complete Profile (Education, Experience, Specialization) - Step 2 of Onboarding
// This is done AFTER admin approves the documents
router.post(
  `/complete-profile`,
  authenticate,
  validate(completeProfileDTO),
  upload.fields([
    { name: 'education_files', maxCount: 5 }, // Multiple degree certificates
    { name: 'experience_files', maxCount: 10 }, // Multiple institution images
    { name: 'digital_signature', maxCount: 1 },
    { name: 'profile_img', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
  ]),
  completeProfile
);

// ✅ Forget Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);

// ✅ Reset Password
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ Logout
router.post(`/logout`, authenticate, logout);

// ✅ 4. Google OAuth
router.get(`/google`, googleAuth);
router.get(
  `/google/callback`,
  passport.authenticate('doctor-google', {
    failureRedirect: '/auth/oauth/error',
  }),
  googleAuthCallback
);

export default router;
