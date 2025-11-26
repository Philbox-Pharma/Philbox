import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  loginDTO,
  verifyOtpDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
} from '../../../../../dto/auth.dto.js';
import {
  login,
  verifyOTP,
  forgetPassword,
  resetPassword,
  logout,
} from '../controller/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = express.Router();
router.use(authRoutesLimiter);

// ✅ Login
router.post(`/login`, validate(loginDTO), login);

// ✅ Verify OTP
router.post(`/verify-otp`, validate(verifyOtpDTO), verifyOTP);

// ✅ Forget Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);

// ✅ Reset Password
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ Logout
router.post(`/logout`, authenticate, logout);
export default router;
