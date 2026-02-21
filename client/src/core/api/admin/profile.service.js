import apiClient from '../client';

const BASE_URL = '/admin/auth';
const PROFILE_URL = '/admin/profile';

export const profileService = {
  // GET /api/admin/auth/me (Session Check)
  verifySession: async () => {
    const response = await apiClient.get(`${BASE_URL}/me`);
    return response.data;
  },

  // GET /api/admin/profile (Get Admin Profile)
  getProfile: async () => {
    const response = await apiClient.get(PROFILE_URL);
    return response.data;
  },

  // PUT /api/admin/profile (Update Admin Profile)
  updateProfile: async data => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(PROFILE_URL, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // PUT /api/admin/profile/picture (Upload Profile Picture)
  uploadProfilePicture: async file => {
    const formData = new FormData();
    formData.append('profile_img', file);
    const response = await apiClient.put(`${PROFILE_URL}/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // PUT /api/admin/profile/cover (Upload Cover Image)
  uploadCoverImage: async file => {
    const formData = new FormData();
    formData.append('cover_img', file);
    const response = await apiClient.put(`${PROFILE_URL}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // PUT /api/admin/profile/password (Change Password)
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await apiClient.put(`${PROFILE_URL}/password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
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
