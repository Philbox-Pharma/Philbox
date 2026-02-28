import express from 'express';
import {
  getReviews,
  getReviewStatistics,
  getReviewById,
} from '../controllers/reviews.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);

/**
 * @route   GET /api/doctor/reviews/statistics
 * @desc    Get review statistics (average rating, distribution, sentiment)
 * @access  Private (Doctor)
 * @query   start_date (optional), end_date (optional)
 */
router.get('/statistics', getReviewStatistics);

/**
 * @route   GET /api/doctor/reviews
 * @desc    Get all reviews for the logged-in doctor
 * @access  Private (Doctor)
 * @query   page, limit, rating, sentiment, start_date, end_date, sort_by, sort_order
 */
router.get('/', getReviews);

/**
 * @route   GET /api/doctor/reviews/:reviewId
 * @desc    Get a single review by ID
 * @access  Private (Doctor)
 */
router.get('/:reviewId', getReviewById);

export default router;
