import apiClient from '../client';

const BASE_URL = '/admin/auth';
const USERS_URL = '/admin/users';

export const profileService = {
  // GET /api/admin/auth/me (Session Check)
  verifySession: async () => {
    const response = await apiClient.get(`${BASE_URL}/me`);
    return response.data;
  },

  // PUT /api/admin/users/admin/:id (Update Admin Profile)
  updateProfile: async (adminId, data) => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(
      `${USERS_URL}/admin/${adminId}`,
      data,
      {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      }
    );
    return response.data;
  },

  // PATCH /api/admin/auth/2fa-settings
  update2FASettings: async isTwoFactorEnabled => {
    const response = await apiClient.patch(`${BASE_URL}/2fa-settings`, {
      isTwoFactorEnabled,
    });
    return response.data;
  },
};
