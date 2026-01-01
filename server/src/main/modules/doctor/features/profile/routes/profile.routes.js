import express from 'express';
import {
  getMyProfile,
  updateProfile,
  updateProfileImage,
  updateCoverImage,
  updateConsultationType,
  updateConsultationFee,
  changePassword,
} from '../controllers/profile.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireDoctorAuth);

/**
 * @route   GET /api/doctor/profile
 * @desc    Get current doctor's complete profile
 * @access  Private (Doctor)
 */
router.get('/', getMyProfile);

/**
 * @route   PUT /api/doctor/profile
 * @desc    Update profile details (name, specialization, bio, qualifications)
 * @access  Private (Doctor)
 */
router.put('/', updateProfile);

/**
 * @route   PUT /api/doctor/profile/profile-image
 * @desc    Upload/update profile picture
 * @access  Private (Doctor)
 */
router.put(
  '/profile-image',
  upload.single('profile_image'),
  updateProfileImage
);

/**
 * @route   PUT /api/doctor/profile/cover-image
 * @desc    Upload/update cover image
 * @access  Private (Doctor)
 */
router.put('/cover-image', upload.single('cover_image'), updateCoverImage);

/**
 * @route   PUT /api/doctor/profile/consultation-type
 * @desc    Set consultation type (in-person, online, both)
 * @access  Private (Doctor)
 */
router.put('/consultation-type', updateConsultationType);

/**
 * @route   PUT /api/doctor/profile/consultation-fee
 * @desc    Update consultation fee
 * @access  Private (Doctor)
 */
router.put('/consultation-fee', updateConsultationFee);

/**
 * @route   PUT /api/doctor/profile/change-password
 * @desc    Change password
 * @access  Private (Doctor)
 */
router.put('/change-password', changePassword);

export default router;
