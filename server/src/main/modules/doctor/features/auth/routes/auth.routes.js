import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  doctorRegisterDTO,
  verifyEmailDTO,
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
} from '../../../../../dto/doctor/auth.dto.js';
import {
  register,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
  logout,
  googleAuth,
  googleAuthCallback,
  getMe,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import passport from '../config/passport.config.js';

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

// ✅ 4. Forget Password (rate limited)
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
