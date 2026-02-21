import apiClient from '../client';

const BASE_URL = '/customer/auth';

export const customerAuthApi = {
  // Register
  register: async data => {
    const response = await apiClient.post(`${BASE_URL}/register`, data);
    return response.data;
  },

  // Verify Email
  verifyEmail: async token => {
    const response = await apiClient.post(`${BASE_URL}/verify-email`, {
      token,
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await apiClient.post(`${BASE_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  // Get Current User
  getMe: async () => {
    const response = await apiClient.get(`${BASE_URL}/me`);
    return response.data;
  },

  // Update Profile (with images)
  updateProfile: async formData => {
    const response = await apiClient.put(`${BASE_URL}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // Logout
  logout: async () => {
    const response = await apiClient.post(`${BASE_URL}/logout`);
    return response.data;
  },

  // Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${apiClient.defaults.baseURL}/customer/auth/google`;
  },
  cancelOrder: async orderId => {
    const response = await apiClient.post(`/customer/orders/${orderId}/cancel`);
    return response.data;
  },
};
