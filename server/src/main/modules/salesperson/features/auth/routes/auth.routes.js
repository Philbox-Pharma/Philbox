import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  loginDTO,
  verifyOTPDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
  update2FADTO,
} from '../../../../../dto/salesperson/auth.dto.js';
import {
  login,
  verifyOTP,
  forgetPassword,
  resetPassword,
  logout,
  update2FASettings,
  getMe,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js'; // Ensure this middleware checks req.session.role === 'salesperson'

const router = express.Router();

// ✅ Login (rate limited)
router.post(`/login`, authRoutesLimiter, validate(loginDTO), login);

// ✅ Verify OTP (rate limited)
router.post(
  `/verify-otp`,
  authRoutesLimiter,
  validate(verifyOTPDTO),
  verifyOTP
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

// ✅ Logout (NOT rate limited)
router.post(`/logout`, authenticate, logout);

// ✅ Get Current Salesperson (NOT rate limited)
router.get(`/me`, authenticate, getMe);

// ✅ Update 2FA Settings (NOT rate limited)
router.patch(
  `/2fa-settings`,
  authenticate,
  validate(update2FADTO),
  update2FASettings
);

export default router;
