import apiClient from '../client';

const BASE_URL = '/doctor/appointments';

export const doctorAppointmentsApi = {
  // Get pending appointment requests
  getPendingRequests: async (filters = {}) => {
    const response = await apiClient.get(`${BASE_URL}/requests`, { params: filters });
    return response.data;
  },

  // Get appointment request details
  getRequestDetails: async (appointmentId) => {
    const response = await apiClient.get(`${BASE_URL}/requests/${appointmentId}`);
    return response.data;
  },

  // Accept an appointment request
  acceptRequest: async (appointmentId, data = {}) => {
    const response = await apiClient.post(`${BASE_URL}/requests/${appointmentId}/accept`, data);
    return response.data;
  },

  // Reject an appointment request
  rejectRequest: async (appointmentId, rejectionReason) => {
    const response = await apiClient.post(`${BASE_URL}/requests/${appointmentId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  // Get accepted appointments (schedule)
  getAcceptedAppointments: async (filters = {}) => {
    const response = await apiClient.get(`${BASE_URL}/accepted`, { params: filters });
    return response.data;
  },
};
