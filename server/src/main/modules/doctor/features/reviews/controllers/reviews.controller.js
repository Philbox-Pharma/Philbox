import doctorReviewsService from '../service/reviews.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import {
  getReviewsSchema,
  getReviewStatsSchema,
} from '../../../../../dto/doctor/reviews.dto.js';

/**
 * @desc    Get reviews for logged-in doctor with filters
 * @route   GET /api/doctor/reviews
 * @access  Private (Doctor)
 */
export const getReviews = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getReviewsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const result = await doctorReviewsService.getReviews(doctorId, value);

    await logDoctorActivity(
      req,
      'view_reviews',
      `Viewed doctor reviews with filters: ${JSON.stringify(value)}`,
      'reviews',
      null,
      {
        filters: value,
        total_reviews:
          result.pagination?.total_items ?? result.reviews?.length ?? 0,
      }
    );

    return sendResponse(res, 200, 'Reviews retrieved successfully', result);
  } catch (error) {
    console.error('Error in getReviews:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve reviews',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get review statistics for logged-in doctor
 * @route   GET /api/doctor/reviews/statistics
 * @access  Private (Doctor)
 */
export const getReviewStatistics = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getReviewStatsSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const statistics = await doctorReviewsService.getReviewStatistics(
      doctorId,
      value
    );

    await logDoctorActivity(
      req,
      'view_review_statistics',
      `Viewed review statistics with filters: ${JSON.stringify(value)}`,
      'reviews',
      null,
      {
        filters: value,
        total_reviews: statistics.total_reviews,
        average_rating: statistics.average_rating,
      }
    );

    return sendResponse(
      res,
      200,
      'Review statistics retrieved successfully',
      statistics
    );
  } catch (error) {
    console.error('Error in getReviewStatistics:', error);
    return sendResponse(
      res,
      500,
      'Failed to retrieve review statistics',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get a single review by ID
 * @route   GET /api/doctor/reviews/:reviewId
 * @access  Private (Doctor)
 */
export const getReviewById = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { reviewId } = req.params;

    if (!reviewId) {
      return sendResponse(res, 400, 'Review ID is required');
    }

    const review = await doctorReviewsService.getReviewById(doctorId, reviewId);

    await logDoctorActivity(
      req,
      'view_review_details',
      `Viewed review details for review ${reviewId}`,
      'reviews',
      review._id,
      {
        reviewId,
        rating: review.rating,
        sentiment: review.sentiment,
      }
    );

    return sendResponse(res, 200, 'Review retrieved successfully', review);
  } catch (error) {
    console.error('Error in getReviewById:', error);

    if (error.message === 'REVIEW_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        'Review not found or does not belong to this doctor'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve review',
      null,
      error.message
    );
  }
};
