import apiClient from '../client';

const BASE_URL = '/admin/user-engagement-analytics';

export const userEngagementService = {
  // GET /api/admin/user-engagement-analytics/overview
  getOverview: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(`${BASE_URL}/overview?${params}`);
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/new-customers
  getNewCustomers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    const response = await apiClient.get(`${BASE_URL}/new-customers?${params}`);
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/customer-status
  getCustomerStatus: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const response = await apiClient.get(
      `${BASE_URL}/customer-status?${params}`
    );
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/doctor-applications
  getDoctorApplications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    const response = await apiClient.get(
      `${BASE_URL}/doctor-applications?${params}`
    );
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/doctor-activity
  getDoctorActivity: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(
      `${BASE_URL}/doctor-activity?${params}`
    );
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/top-customers
  getTopCustomers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.metric) params.append('metric', filters.metric);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/top-customers?${params}`);
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/retention-rate
  getRetentionRate: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/retention-rate?${params}`
    );
    return response.data;
  },
};
