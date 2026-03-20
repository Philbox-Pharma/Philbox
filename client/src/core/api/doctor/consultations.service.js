import apiClient from '../client';

const BASE_URL = '/doctor/consultations';

export const doctorConsultationsApi = {
  /**
   * Get completed consultations list with optional filters
   * @param {Object} filters - { page, limit, start_date, end_date, patient_name, status }
   * Backend needed: GET /api/doctor/consultations
   */
  getConsultations: async (filters = {}) => {
    const response = await apiClient.get(BASE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get single consultation details by appointment ID
   * Backend needed: GET /api/doctor/consultations/:appointmentId
   */
  getConsultationById: async (appointmentId) => {
    const response = await apiClient.get(`${BASE_URL}/${appointmentId}`);
    return response.data;
  },

  /**
   * Export consultation history to PDF
   * Backend needed: GET /api/doctor/consultations/export/pdf
   */
  exportToPDF: async (filters = {}) => {
    const response = await apiClient.get(`${BASE_URL}/export/pdf`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
