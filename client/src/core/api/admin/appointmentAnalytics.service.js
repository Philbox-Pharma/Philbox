import apiClient from '../client';

const BASE_URL = '/admin/appointment-analytics';

export const appointmentAnalyticsService = {
  // GET /api/admin/appointment-analytics/overview
  getOverview: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/overview?${params}`);
    return response.data;
  },

  // GET /api/admin/appointment-analytics/trends
  getTrends: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(`${BASE_URL}/trends?${params}`);
    return response.data;
  },

  // GET /api/admin/appointment-analytics/completion-rate
  getCompletionRate: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/completion-rate?${params}`
    );
    return response.data;
  },

  // GET /api/admin/appointment-analytics/top-doctors/appointments
  getTopDoctorsByAppointments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/top-doctors/appointments?${params}`
    );
    return response.data;
  },

  // GET /api/admin/appointment-analytics/appointment-types
  getAppointmentTypes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    const response = await apiClient.get(
      `${BASE_URL}/appointment-types?${params}`
    );
    return response.data;
  },
};
