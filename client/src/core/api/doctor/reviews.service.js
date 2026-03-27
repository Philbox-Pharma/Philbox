import apiClient from '../client';

const BASE_URL = '/doctor/reviews';

export const doctorReviewsApi = {
  /**
   * Get all reviews for the logged-in doctor
   * @param {Object} filters - { page, limit, rating, start_date, end_date, sentiment, sort_by, sort_order }
   */
  getReviews: async (filters = {}) => {
    const response = await apiClient.get(BASE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get review statistics (average rating, distribution, sentiment)
   * Backend route: GET /api/doctor/reviews/statistics
   */
  getReviewStats: async (filters = {}) => {
    const response = await apiClient.get(`${BASE_URL}/statistics`, { params: filters });
    return response.data;
  },

  /**
   * Get a single review by ID
   */
  getReviewById: async (reviewId) => {
    const response = await apiClient.get(`${BASE_URL}/${reviewId}`);
    return response.data;
  },
};
