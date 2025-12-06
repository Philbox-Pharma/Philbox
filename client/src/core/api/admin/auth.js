import apiClient from "../client";

const BASE_URL = "/admin/auth";

export const adminAuthApi = {
  // Step 1: Send Credentials
  login: async (email, password) => {
    const response = await apiClient.post(`${BASE_URL}/login`, { email, password });
    return response.data;
  },

  // Step 2: Verify OTP
  verifyOtp: async (email, otp) => {
    const response = await apiClient.post(`${BASE_URL}/verify-otp`, { email, otp });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(`${BASE_URL}/logout`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post(`${BASE_URL}/forget-password`, { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post(`${BASE_URL}/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
};
