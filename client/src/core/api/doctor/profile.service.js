import apiClient from '../client';

const BASE_URL = '/doctor/profile';

export const doctorProfileApi = {
  // Get current doctor's complete profile
  getProfile: async () => {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  },

  // Update profile details (name, specialization, bio, qualifications)
  updateProfile: async (profileData) => {
    const response = await apiClient.put(BASE_URL, profileData);
    return response.data;
  },

  // Upload/update profile image
  updateProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    const response = await apiClient.put(`${BASE_URL}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload/update cover image
  updateCoverImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('cover_image', imageFile);
    const response = await apiClient.put(`${BASE_URL}/cover-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update consultation type (in-person, online, both)
  updateConsultationType: async (consultationType) => {
    const response = await apiClient.put(`${BASE_URL}/consultation-type`, {
      consultation_type: consultationType,
    });
    return response.data;
  },

  // Update consultation fee
  updateConsultationFee: async (fee) => {
    const response = await apiClient.put(`${BASE_URL}/consultation-fee`, {
      consultation_fee: fee,
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.put(`${BASE_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
