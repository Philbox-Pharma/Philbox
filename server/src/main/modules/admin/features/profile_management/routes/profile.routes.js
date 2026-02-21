import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  updateProfileDTO,
  changePasswordDTO,
  uploadProfilePictureDTO,
  uploadCoverImageDTO,
} from '../../../../../dto/admin/profile.dto.js';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverImage,
  changePassword,
} from '../controller/profile.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/admin/profile
 * @desc    Get current admin profile with addresses and branches
 * @access  Private (Admin)
 */
router.get('/', getProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile information (name, phone_number, address)
 * @access  Private (Admin)
 */
router.put('/', validate(updateProfileDTO), updateProfile);

/**
 * @route   PUT /api/admin/profile/picture
 * @desc    Upload or update profile picture
 * @access  Private (Admin)
 */
router.put(
  '/picture',
  upload.single('profile_img'),
  validate(uploadProfilePictureDTO),
  uploadProfilePicture
);

/**
 * @route   PUT /api/admin/profile/cover
 * @desc    Upload or update cover image
 * @access  Private (Admin)
 */
router.put(
  '/cover',
  upload.single('cover_img'),
  validate(uploadCoverImageDTO),
  uploadCoverImage
);

/**
 * @route   PUT /api/admin/profile/password
 * @desc    Change password (requires current password)
 * @access  Private (Admin)
 */
router.put('/password', validate(changePasswordDTO), changePassword);

export default router;
