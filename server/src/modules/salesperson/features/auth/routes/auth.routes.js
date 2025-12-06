import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
} from '../../../../../dto/salesperson/auth.dto.js';
import {
  login,
  forgetPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js'; // Ensure this middleware checks req.session.role === 'salesperson'

const router = express.Router();
router.use(authRoutesLimiter);

// ✅ Login
router.post(`/login`, validate(loginDTO), login);

// ✅ Forget Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);

// ✅ Reset Password
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ Logout
router.post(`/logout`, authenticate, logout);

export default router;
