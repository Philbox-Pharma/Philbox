import apiClient from '../client';

const BASE_URL = '/admin/orders-analytics';

export const ordersAnalyticsService = {
  // GET /api/admin/orders-analytics/overview
  getOverview: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/overview?${params}`);
    return response.data;
  },

  // GET /api/admin/orders-analytics/trends
  getTrends: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/trends?${params}`);
    return response.data;
  },

  // GET /api/admin/orders-analytics/status-breakdown
  getStatusBreakdown: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/status-breakdown?${params}`
    );
    return response.data;
  },

  // GET /api/admin/orders-analytics/top-medicines
  getTopMedicines: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/top-medicines?${params}`);
    return response.data;
  },

  // GET /api/admin/orders-analytics/stock-alerts
  getStockAlerts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.threshold) params.append('threshold', filters.threshold);
    const response = await apiClient.get(`${BASE_URL}/stock-alerts?${params}`);
    return response.data;
  },

  // GET /api/admin/orders-analytics/revenue-by-category
  getRevenueByCategory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/revenue-by-category?${params}`
    );
    return response.data;
  },

  // GET /api/admin/orders-analytics/refund-rate
  getRefundRate: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/refund-rate?${params}`);
    return response.data;
  },
};
