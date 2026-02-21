import apiClient from '../client';

const BASE_URL = '/doctor/auth';

export const doctorAuthApi = {
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

  // Logout
  logout: async () => {
    const response = await apiClient.post(`${BASE_URL}/logout`);
    return response.data;
  },

  // Submit Application (Step 1 - Documents)
  submitApplication: async formData => {
    const response = await apiClient.post(
      `${BASE_URL}/submit-application`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Complete Profile (Step 2)
  completeProfile: async formData => {
    const response = await apiClient.post(
      `${BASE_URL}/complete-profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
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

  // Google OAuth URL
  getGoogleAuthUrl: () => {
    return `${apiClient.defaults.baseURL}/doctor/auth/google`;
  },
};
