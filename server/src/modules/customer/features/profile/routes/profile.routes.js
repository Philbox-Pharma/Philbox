import express from 'express';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  updateProfileDTO,
  changePasswordDTO,
  uploadProfilePictureDTO,
  uploadCoverImageDTO,
} from '../../../../../dto/customer/profile.dto.js';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverImage,
  changePassword,
} from '../controllers/profile.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/customer/profile
 * @desc    Get current customer profile with address
 * @access  Private (Customer)
 */
router.get('/', getProfile);

/**
 * @route   PUT /api/customer/profile
 * @desc    Update customer profile information (name, contact, gender, DOB, address)
 * @access  Private (Customer)
 */
router.put('/', validate(updateProfileDTO), updateProfile);

/**
 * @route   PUT /api/customer/profile/picture
 * @desc    Upload or update profile picture
 * @access  Private (Customer)
 */
router.put(
  '/picture',
  upload.single('profile_img'),
  validate(uploadProfilePictureDTO),
  uploadProfilePicture
);

/**
 * @route   PUT /api/customer/profile/cover
 * @desc    Upload or update cover image
 * @access  Private (Customer)
 */
router.put(
  '/cover',
  upload.single('cover_img'),
  validate(uploadCoverImageDTO),
  uploadCoverImage
);

/**
 * @route   PUT /api/customer/profile/password
 * @desc    Change password (requires current password)
 * @access  Private (Customer)
 */
router.put('/password', validate(changePasswordDTO), changePassword);

export default router;
