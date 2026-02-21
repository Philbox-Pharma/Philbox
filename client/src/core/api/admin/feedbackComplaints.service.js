import apiClient from '../client';

const BASE_URL = '/admin/feedback-complaints-analytics';

export const feedbackComplaintsService = {
  // GET /api/admin/feedback-complaints-analytics/summary
  getSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/summary?${params}`);
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/sentiment-analysis
  getSentimentAnalysis: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/sentiment-analysis?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/resolution-time
  getResolutionTime: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/resolution-time?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/complaints-by-category
  getComplaintsByCategory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/complaints-by-category?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/feedback-by-category
  getFeedbackByCategory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/feedback-by-category?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/resolution-status
  getResolutionStatus: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/resolution-status?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/feedback-trends
  getFeedbackTrends: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/feedback-trends?${params}`
    );
    return response.data;
  },

  // GET /api/admin/feedback-complaints-analytics/complaint-trends
  getComplaintTrends: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/complaint-trends?${params}`
    );
    return response.data;
  },
};
