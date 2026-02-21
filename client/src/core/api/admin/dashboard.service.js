import apiClient from '../client';

/**
 * dashboard.service.js
 * Aggregates the "overview" endpoints used to populate the main dashboard page.
 * Each method fetches a specific summary metric; combine them on the dashboard
 * with Promise.allSettled for resilient parallel loading.
 */

export const dashboardService = {
  // GET /api/admin/branches/statistics/all
  getBranchStatistics: async () => {
    const response = await apiClient.get('/admin/branches/statistics/all');
    return response.data;
  },

  // GET /api/admin/revenue-analytics/overview
  getRevenueOverview: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(
      `/admin/revenue-analytics/overview?${params}`
    );
    return response.data;
  },

  // GET /api/admin/orders-analytics/overview
  getOrdersOverview: async (startDate, endDate, branchId) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    const response = await apiClient.get(
      `/admin/orders-analytics/overview?${params}`
    );
    return response.data;
  },

  // GET /api/admin/user-engagement-analytics/overview
  getUserEngagementOverview: async (startDate, endDate, period, branchId) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (period) params.append('period', period);
    if (branchId) params.append('branchId', branchId);
    const response = await apiClient.get(
      `/admin/user-engagement-analytics/overview?${params}`
    );
    return response.data;
  },

  // GET /api/admin/appointment-analytics/overview
  getAppointmentOverview: async (startDate, endDate, branchId) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    const response = await apiClient.get(
      `/admin/appointment-analytics/overview?${params}`
    );
    return response.data;
  },
};
