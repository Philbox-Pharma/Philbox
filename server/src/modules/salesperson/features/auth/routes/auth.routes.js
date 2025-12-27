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
router.use(authRoutesLimiter);

// ✅ Login
router.post(`/login`, validate(loginDTO), login);

// ✅ Verify OTP (for 2FA)
router.post(`/verify-otp`, validate(verifyOTPDTO), verifyOTP);

// ✅ Forget Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);

// ✅ Reset Password
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ Logout
router.post(`/logout`, authenticate, logout);

// ✅ Get Current Salesperson (Session check)
router.get(`/me`, authenticate, getMe);

// ✅ Update 2FA Settings
router.patch(
  `/2fa-settings`,
  authenticate,
  validate(update2FADTO),
  update2FASettings
);

export default router;
