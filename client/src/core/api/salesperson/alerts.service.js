import apiClient from '../client';

export const salespersonAlertsApi = {
  getLowStockAlerts: async (params = {}) => {
    const response = await apiClient.get('/salesperson/alerts/low-stock', { params });
    return response;
  },
  getLowStockCount: async (params = {}) => {
    const response = await apiClient.get('/salesperson/alerts/low-stock/count', { params });
    return response;
  },
  resolveLowStockAlert: async (stockId) => {
    const response = await apiClient.patch(`/salesperson/alerts/low-stock/${stockId}/resolve`);
    return response;
  },
  updateThreshold: async (medicineId, threshold) => {
    const response = await apiClient.put(`/salesperson/alerts/low-stock/threshold/${medicineId}`, { threshold });
    return response;
  },
};
