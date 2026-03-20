import apiClient from '../client';

const BASE_URL = '/doctor/slots';

export const doctorSlotsApi = {
  // Create a single time slot
  createSlot: async (slotData) => {
    const response = await apiClient.post(BASE_URL, slotData);
    return response.data;
  },

  // Create recurring time slots
  createRecurringSlots: async (slotData) => {
    const response = await apiClient.post(`${BASE_URL}/recurring`, slotData);
    return response.data;
  },

  // Get all slots with optional filtering (start_date, end_date, status)
  getSlots: async (filters = {}) => {
    const response = await apiClient.get(BASE_URL, { params: filters });
    return response.data;
  },

  // Get calendar view for a specific month
  getCalendarView: async (year, month) => {
    const response = await apiClient.get(`${BASE_URL}/calendar/${year}/${month}`);
    return response.data;
  },

  // Get a single slot by ID
  getSlotById: async (slotId) => {
    const response = await apiClient.get(`${BASE_URL}/${slotId}`);
    return response.data;
  },

  // Update a slot (only unbooked, future)
  updateSlot: async (slotId, updateData) => {
    const response = await apiClient.put(`${BASE_URL}/${slotId}`, updateData);
    return response.data;
  },

  // Mark slot as unavailable
  markSlotUnavailable: async (slotId) => {
    const response = await apiClient.patch(`${BASE_URL}/${slotId}/unavailable`);
    return response.data;
  },

  // Delete a slot (only unbooked, future)
  deleteSlot: async (slotId) => {
    const response = await apiClient.delete(`${BASE_URL}/${slotId}`);
    return response.data;
  },
};
