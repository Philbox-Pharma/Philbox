import apiClient from '../client';

const BASE_URL = '/doctor/reviews';

export const doctorReviewsApi = {
  /**
   * Get all reviews for the logged-in doctor
   * @param {Object} filters - { page, limit, rating, start_date, end_date, sentiment }
   * Backend needed: GET /api/doctor/reviews
   */
  getReviews: async (filters = {}) => {
    const response = await apiClient.get(BASE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get review stats/summary for the logged-in doctor
   * Backend needed: GET /api/doctor/reviews/stats
   * Expected response: { averageRating, totalReviews, distribution: {1: n, 2: n, ...}, sentimentBreakdown }
   */
  getReviewStats: async () => {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data;
  },
};
