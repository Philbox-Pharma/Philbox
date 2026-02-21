import apiClient from '../client';

const BASE_URL = '/salesperson/auth';

export const salespersonAuthApi = {
  // Login
  login: async (email, password) => {
    const response = await apiClient.post(`${BASE_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post(`${BASE_URL}/logout`);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async email => {
    const response = await apiClient.post(`${BASE_URL}/forget-password`, {
      email,
    });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post(`${BASE_URL}/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
};
