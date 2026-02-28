import apiClient from '../client';

const BASE_URL = '/super-admin/customers';

export const customersService = {
  // GET /api/super-admin/customers
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.account_status)
      params.append('account_status', filters.account_status);
    if (filters.is_Verified) params.append('is_Verified', filters.is_Verified);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}?${params}`);
    return response.data;
  },

  // GET /api/super-admin/customers/:id
  getCustomerById: async customerId => {
    const response = await apiClient.get(`${BASE_URL}/${customerId}`);
    return response.data;
  },

  // PATCH /api/super-admin/customers/:id/status
  toggleCustomerStatus: async (customerId, statusData) => {
    const response = await apiClient.patch(
      `${BASE_URL}/${customerId}/status`,
      statusData
    );
    return response.data;
  },

  // GET /api/super-admin/customers/metrics/analytics
  getMetrics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/metrics/analytics?${params}`
    );
    return response.data;
  },
};
