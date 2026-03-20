import apiClient from '../client';

const BASE_URL = '/customer/search-history';

export const saveSearch = async query => {
  const res = await apiClient.post(BASE_URL, { query });
  return res.data;
};

export const getHistory = async () => {
  const res = await apiClient.get(BASE_URL);
  return res.data;
};

export const deleteSearch = async id => {
  const res = await apiClient.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export const clearAllHistory = async () => {
  const res = await apiClient.delete(`${BASE_URL}/clear/all`);
  return res.data;
};

export default {
  saveSearch,
  getHistory,
  deleteSearch,
  clearAllHistory,
};
