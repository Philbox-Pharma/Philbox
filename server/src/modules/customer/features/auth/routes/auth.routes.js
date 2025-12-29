import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  customerRegisterDTO,
  verifyEmailDTO,
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
} from '../../../../../dto/customer/auth.dto.js';
import {
  register,
  verifyEmail,
  login,
  logout,
  forgetPassword,
  resetPassword,
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
  validate(customerRegisterDTO),
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

// ✅ 4. Google OAuth (rate limited)
router.get(`/google`, authRoutesLimiter, googleAuth);
router.get(
  `/google/callback`,
  passport.authenticate('customer-google', {
    failureRedirect: '/auth/oauth/error',
  }),
  googleAuthCallback
);

// ✅ 5. Forget & Reset Password (rate limited)
router.post(
  `/forget-password`,
  authRoutesLimiter,
  validate(forgetPasswordDTO),
  forgetPassword
);
router.post(
  `/reset-password`,
  authRoutesLimiter,
  validate(resetPasswordDTO),
  resetPassword
);

// ✅ 6. Logout (NOT rate limited)
router.post(`/logout`, authenticate, logout);

// ✅ 7. Get Current User (NOT rate limited)
router.get(`/me`, authenticate, getMe);

export default router;
