import apiClient from '../client';

const BASE_URL = '/doctor/prescriptions';

export const doctorPrescriptionsApi = {
  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    const response = await apiClient.post(BASE_URL, prescriptionData);
    return response.data;
  },

  // Get prescription for a specific appointment
  getByAppointment: async (appointmentId) => {
    const response = await apiClient.get(`${BASE_URL}/appointment/${appointmentId}`);
    return response.data;
  },

  // Get all prescriptions for a specific patient
  getByPatient: async (patientId) => {
    const response = await apiClient.get(`${BASE_URL}/patient/${patientId}`);
    return response.data;
  },

  // Update an existing prescription
  updatePrescription: async (prescriptionId, data) => {
    const response = await apiClient.put(`${BASE_URL}/${prescriptionId}`, data);
    return response.data;
  },

  // Get PDF URL for a prescription
  getPrescriptionPDF: async (prescriptionId) => {
    const response = await apiClient.get(`${BASE_URL}/${prescriptionId}/pdf`);
    return response.data;
  },
};
