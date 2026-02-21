import apiClient from '../client';

const BASE_URL = '/admin/activity-logs-analytics';

export const activityLogsService = {
  // GET /api/admin/activity-logs-analytics/overview
  getOverview: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`${BASE_URL}/overview?${params}`);
    return response.data;
  },

  // GET /api/admin/activity-logs-analytics/timeline
  getTimeline: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(`${BASE_URL}/timeline?${params}`);
    return response.data;
  },

  // GET /api/admin/activity-logs-analytics/frequent-actions
  getFrequentActions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.topN) params.append('topN', filters.topN);
    const response = await apiClient.get(
      `${BASE_URL}/frequent-actions?${params}`
    );
    return response.data;
  },

  // GET /api/admin/activity-logs-analytics/login-attempts
  getLoginAttempts: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(
      `${BASE_URL}/login-attempts?${params}`
    );
    return response.data;
  },

  // GET /api/admin/activity-logs-analytics/suspicious-activities
  getSuspiciousActivities: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(
      `${BASE_URL}/suspicious-activities?${params}`
    );
    return response.data;
  },
};
