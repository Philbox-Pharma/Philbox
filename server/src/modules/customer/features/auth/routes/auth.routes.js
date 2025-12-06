import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  customerRegisterDTO,
  verifyEmailDTO,
  loginDTO,
  forgetPasswordDTO,
  resetPasswordDTO,
  updateProfileDTO,
} from '../../../../../dto/customer/auth.dto.js';
import {
  register,
  verifyEmail,
  login,
  logout,
  forgetPassword,
  resetPassword,
  updateProfile,
  googleAuth,
  googleAuthCallback,
  getMe,
} from '../controllers/auth.controller.js';
import { authRoutesLimiter } from '../../../../../utils/authRoutesLimiter.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import passport from '../config/passport.config.js';

const router = express.Router();
router.use(authRoutesLimiter);

// ✅ 1. Registration
router.post(`/register`, validate(customerRegisterDTO), register);

// ✅ 2. Verify Email
router.post(`/verify-email`, validate(verifyEmailDTO), verifyEmail);

// ✅ 3. Login
router.post(`/login`, validate(loginDTO), login);

// ✅ 4. Google OAuth
router.get(`/google`, googleAuth);
router.get(
  `/google/callback`,
  passport.authenticate('customer-google', {
    failureRedirect: '/auth/oauth/error',
  }),
  googleAuthCallback
);

// ✅ 5. Forget & Reset Password
router.post(`/forget-password`, validate(forgetPasswordDTO), forgetPassword);
router.post(`/reset-password`, validate(resetPasswordDTO), resetPassword);

// ✅ 6. Logout
router.post(`/logout`, authenticate, logout);

// ✅ 7. Get Current User (Session check)
router.get(`/me`, authenticate, getMe);

// ✅ 8. Update Profile (including Address & Images)
router.put(
  `/profile`,
  authenticate,
  validate(updateProfileDTO),
  upload.fields([
    { name: 'profile_img', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
  ]),
  updateProfile
);

export default router;
