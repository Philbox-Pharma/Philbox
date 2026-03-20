import apiClient from '../client';

const BASE_URL = '/customer/profile';

export const getProfile = async () => {
  const res = await apiClient.get(BASE_URL);
  return res.data;
};

export const updateProfile = async payload => {
  const res = await apiClient.put(BASE_URL, payload);
  return res.data;
};

export const uploadProfilePicture = async formData => {
  const res = await apiClient.put(`${BASE_URL}/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const uploadCoverImage = async formData => {
  const res = await apiClient.put(`${BASE_URL}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const changePassword = async payload => {
  const res = await apiClient.put(`${BASE_URL}/password`, payload);
  return res.data;
};

export default {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverImage,
  changePassword,
};
