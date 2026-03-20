import apiClient from '../client';

const BASE_URL = '/customer/refill-reminders';

export const getReminders = async (params = {}) => {
  const res = await apiClient.get(BASE_URL, { params });
  return res.data;
};

export const getReminderById = async id => {
  const res = await apiClient.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const createReminder = async payload => {
  const res = await apiClient.post(BASE_URL, payload);
  return res.data;
};

export const updateReminder = async (id, payload) => {
  const res = await apiClient.put(`${BASE_URL}/${id}`, payload);
  return res.data;
};

export const markAsCompleted = async id => {
  const res = await apiClient.patch(`${BASE_URL}/${id}/complete`, {
    isActive: false,
  });
  return res.data;
};

export const deleteReminder = async id => {
  const res = await apiClient.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export default {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  markAsCompleted,
  deleteReminder,
};
