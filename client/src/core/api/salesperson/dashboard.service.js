import apiClient from '../client';

export const salespersonDashboardApi = {
  getDashboard: async (params = {}) => {
    const response = await apiClient.get('/salesperson/dashboard', { params });
    return response;
  },
};
