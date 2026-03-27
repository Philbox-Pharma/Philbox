import apiClient from '../client';

export const doctorPatientsApi = {
  getMedicalHistory: async (patientId, filters = {}) => {
    // Generate query params safely
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/doctor/patients/${patientId}/medical-history`, {
      params,
    });
    return response.data;
  },
};
