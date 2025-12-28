// src/core/api/customer/dashboard.service.js
import apiClient from '../client';

export const getDashboard = async () => {
  // Backend endpoint expected: GET /customer/dashboard
  const res = await apiClient.get('/customer/dashboard');
  // Return the data as-is; component will handle shape
  return res.data;
};

export default { getDashboard };
