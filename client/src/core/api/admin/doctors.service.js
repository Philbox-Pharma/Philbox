import apiClient from '../client';

const BASE_URL = '/admin/doctors';

export const doctorsService = {
  // ─── DOCTOR MANAGEMENT ───────────────────────────────────────────────────────

  // GET /api/admin/doctors
  getAllDoctors: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.specialty) params.append('specialty', filters.specialty);
    const response = await apiClient.get(`${BASE_URL}?${params}`);
    return response.data;
  },

  // GET /api/admin/doctors/:id
  getDoctorById: async id => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // PUT /api/admin/doctors/:id
  updateDoctorProfile: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // PATCH /api/admin/doctors/:id/status
  updateDoctorStatus: async (id, statusData) => {
    const response = await apiClient.patch(
      `${BASE_URL}/${id}/status`,
      statusData
    );
    return response.data;
  },

  // GET /api/admin/doctors/:id/metrics
  getDoctorMetrics: async id => {
    const response = await apiClient.get(`${BASE_URL}/${id}/metrics`);
    return response.data;
  },

  // ─── DOCTOR APPLICATIONS ─────────────────────────────────────────────────────

  // GET /api/admin/doctors/applications
  getApplications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status || 'pending');
    const response = await apiClient.get(`${BASE_URL}/applications?${params}`);
    return response.data;
  },

  // GET /api/admin/doctors/applications/:id
  getApplicationById: async id => {
    const response = await apiClient.get(`${BASE_URL}/applications/${id}`);
    return response.data;
  },

  // PATCH /api/admin/doctors/applications/:id/approve
  approveApplication: async (id, comment = '') => {
    const response = await apiClient.patch(
      `${BASE_URL}/applications/${id}/approve`,
      { comment }
    );
    return response.data;
  },

  // PATCH /api/admin/doctors/applications/:id/reject
  rejectApplication: async (id, reason) => {
    const response = await apiClient.patch(
      `${BASE_URL}/applications/${id}/reject`,
      { reason }
    );
    return response.data;
  },
};
