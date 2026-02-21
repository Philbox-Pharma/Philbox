import apiClient from '../client';

const BASE_URL = '/admin/revenue-analytics';

export const revenueService = {
  // GET /api/admin/revenue-analytics/overview
  getOverview: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`${BASE_URL}/overview?${params}`);
    return response.data;
  },

  // GET /api/admin/revenue-analytics/trends
  getTrends: async (startDate, endDate, period = 'daily') => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('period', period);
    const response = await apiClient.get(`${BASE_URL}/trends?${params}`);
    return response.data;
  },

  // GET /api/admin/revenue-analytics/split
  getSplit: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`${BASE_URL}/split?${params}`);
    return response.data;
  },

  // GET /api/admin/revenue-analytics/top-branches (Super Admin Only)
  getTopBranches: async (startDate, endDate, limit = 5) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit);
    const response = await apiClient.get(`${BASE_URL}/top-branches?${params}`);
    return response.data;
  },

  // GET /api/admin/revenue-analytics/refunds
  getRefunds: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`${BASE_URL}/refunds?${params}`);
    return response.data;
  },

  // GET /api/admin/revenue-analytics/average-per-customer
  getAvgPerCustomer: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(
      `${BASE_URL}/average-per-customer?${params}`
    );
    return response.data;
  },

  // GET /api/admin/revenue-analytics/payment-methods
  getPaymentMethods: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(
      `${BASE_URL}/payment-methods?${params}`
    );
    return response.data;
  },
};
