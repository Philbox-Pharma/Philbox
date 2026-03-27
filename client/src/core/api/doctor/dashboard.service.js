import apiClient from '../client';

export const doctorDashboardApi = {
  /**
   * Get consultation statistics
   * Backend route: GET /api/doctor/consultations/statistics
   */
  getConsultationStats: async (filters = {}) => {
    const response = await apiClient.get('/doctor/consultations/statistics', { params: filters });
    return response.data;
  },

  /**
   * Get review statistics
   * Backend route: GET /api/doctor/reviews/statistics
   */
  getReviewStats: async (filters = {}) => {
    const response = await apiClient.get('/doctor/reviews/statistics', { params: filters });
    return response.data;
  },

  /**
   * Get pending appointment requests (for dashboard count)
   * Backend route: GET /api/doctor/appointments/requests
   */
  getPendingRequests: async (filters = {}) => {
    const response = await apiClient.get('/doctor/appointments/requests', { params: filters });
    return response.data;
  },

  /**
   * Get accepted appointments (upcoming schedule)
   * Backend route: GET /api/doctor/appointments/accepted
   */
  getUpcomingAppointments: async (filters = {}) => {
    const response = await apiClient.get('/doctor/appointments/accepted', { params: filters });
    return response.data;
  },

  /**
   * Get doctor profile info
   * Backend route: GET /api/doctor/profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/doctor/profile');
    return response.data;
  },

  /**
   * Get slots summary
   * Backend route: GET /api/doctor/slots
   */
  getSlots: async (filters = {}) => {
    const response = await apiClient.get('/doctor/slots', { params: filters });
    return response.data;
  },
};
