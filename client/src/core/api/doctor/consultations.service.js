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
   * Get single consultation details by consultation ID
   * Backend needed: GET /api/doctor/consultations/:consultationId
   */
  getConsultationById: async (consultationId) => {
    const response = await apiClient.get(`${BASE_URL}/${consultationId}`);
    return response.data;
  },

  /**
   * Get prescription for a specific consultation
   * Backend route: GET /api/doctor/consultations/prescription/:prescriptionId
   */
  getPrescriptionDetails: async (prescriptionId) => {
    const response = await apiClient.get(`${BASE_URL}/prescription/${prescriptionId}`);
    return response.data;
  },

  /**
   * Get patient medical history associated with a consultation
   * Backend route: GET /api/doctor/consultations/:consultationId/patient-history
   */
  getPatientHistory: async (consultationId) => {
    const response = await apiClient.get(`${BASE_URL}/${consultationId}/patient-history`);
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
