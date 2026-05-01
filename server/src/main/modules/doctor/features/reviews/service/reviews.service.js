import mongoose from 'mongoose';
import Review from '../../../../../models/Review.js';

class DoctorReviewsService {
  /**
   * Get reviews for a doctor with pagination and filters
   */
  async getReviews(doctorId, filters) {
    try {
      const {
        page = 1,
        limit = 10,
        rating,
        sentiment,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build query
      const query = {
        target_type: 'doctor',
        target_id: new mongoose.Types.ObjectId(doctorId),
      };

      // Apply filters
      if (rating) {
        query.rating = rating;
      }

      if (sentiment) {
        query.sentiment = sentiment;
      }

      if (start_date || end_date) {
        query.created_at = {};
        if (start_date) {
          query.created_at.$gte = new Date(start_date);
        }
        if (end_date) {
          query.created_at.$lte = new Date(end_date);
        }
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort_by] = sort_order === 'asc' ? 1 : -1;

      // Execute query with pagination
      const [reviews, total] = await Promise.all([
        Review.find(query)
          .populate('customer_id', 'fullName profile_img_url')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Review.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        reviews,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error in getReviews:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a doctor
   */
  async getReviewStatistics(doctorId, filters = {}) {
    try {
      const { start_date, end_date } = filters;

      // Build base query
      const query = {
        target_type: 'doctor',
        target_id: new mongoose.Types.ObjectId(doctorId),
      };

      // Apply date filters if provided
      if (start_date || end_date) {
        query.created_at = {};
        if (start_date) {
          query.created_at.$gte = new Date(start_date);
        }
        if (end_date) {
          query.created_at.$lte = new Date(end_date);
        }
      }

      // Get total count
      const totalReviews = await Review.countDocuments(query);

      // Get average rating
      const averageRatingResult = await Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
          },
        },
      ]);

      const averageRating =
        averageRatingResult.length > 0
          ? parseFloat(averageRatingResult[0].averageRating.toFixed(2))
          : 0;

      // Get rating distribution (count for each star rating)
      const ratingDistribution = await Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Format rating distribution
      const ratingCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      ratingDistribution.forEach(item => {
        ratingCounts[item._id] = item.count;
      });

      // Get sentiment distribution
      const sentimentDistribution = await Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 },
          },
        },
      ]);

      // Format sentiment distribution
      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      sentimentDistribution.forEach(item => {
        sentimentCounts[item._id] = item.count;
      });

      // Calculate percentages for sentiment
      const sentimentPercentages = {
        positive:
          totalReviews > 0
            ? parseFloat(
                ((sentimentCounts.positive / totalReviews) * 100).toFixed(2)
              )
            : 0,
        negative:
          totalReviews > 0
            ? parseFloat(
                ((sentimentCounts.negative / totalReviews) * 100).toFixed(2)
              )
            : 0,
        neutral:
          totalReviews > 0
            ? parseFloat(
                ((sentimentCounts.neutral / totalReviews) * 100).toFixed(2)
              )
            : 0,
      };

      return {
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingCounts,
        sentiment_distribution: {
          counts: sentimentCounts,
          percentages: sentimentPercentages,
        },
      };
    } catch (error) {
      console.error('Error in getReviewStatistics:', error);
      throw error;
    }
  }

  /**
   * Get a single review by ID (for doctor to view details)
   */
  async getReviewById(doctorId, reviewId) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        target_type: 'doctor',
        target_id: new mongoose.Types.ObjectId(doctorId),
      })
        .populate('customer_id', 'fullName profile_img_url email')
        .lean();

      if (!review) {
        throw new Error('REVIEW_NOT_FOUND');
      }

      return review;
    } catch (error) {
      console.error('Error in getReviewById:', error);
      throw error;
    }
  }
}

// Export singleton instance
const doctorReviewsService = new DoctorReviewsService();
export default doctorReviewsService;
