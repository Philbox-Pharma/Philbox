import apiClient from '../client';

const ADMIN_URL = '/admin/users/admin';
const SALESPERSON_URL = '/admin/users/salesperson';

export const staffService = {
  // ─── ADMIN MANAGEMENT ────────────────────────────────────────────────────────

  // GET /api/admin/users/admin
  getAdmins: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.branch) params.append('branch', filters.branch);
    const response = await apiClient.get(`${ADMIN_URL}?${params}`);
    return response.data;
  },

  // GET /api/admin/users/admin/:id
  getAdminById: async id => {
    const response = await apiClient.get(`${ADMIN_URL}/${id}`);
    return response.data;
  },

  // POST /api/admin/users/admin (multipart/form-data)
  createAdmin: async formData => {
    const response = await apiClient.post(ADMIN_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // PUT /api/admin/users/admin/:id (multipart/form-data)
  updateAdmin: async (id, formData) => {
    const response = await apiClient.put(`${ADMIN_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // DELETE /api/admin/users/admin/:id
  deleteAdmin: async id => {
    const response = await apiClient.delete(`${ADMIN_URL}/${id}`);
    return response.data;
  },

  // GET /api/admin/users/admin/search?name=
  searchAdmins: async searchParams => {
    const params = new URLSearchParams();
    if (searchParams.id) params.append('id', searchParams.id);
    if (searchParams.email) params.append('email', searchParams.email);
    if (searchParams.name) params.append('name', searchParams.name);
    const response = await apiClient.get(`${ADMIN_URL}/search?${params}`);
    return response.data;
  },

  // ─── SALESPERSON MANAGEMENT ──────────────────────────────────────────────────

  // GET /api/admin/users/salesperson
  getSalespersons: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.branch) params.append('branch', filters.branch);
    const response = await apiClient.get(`${SALESPERSON_URL}?${params}`);
    return response.data;
  },

  // GET /api/admin/users/salesperson/:id
  getSalespersonById: async id => {
    const response = await apiClient.get(`${SALESPERSON_URL}/${id}`);
    return response.data;
  },

  // POST /api/admin/users/salesperson
  createSalesperson: async data => {
    const response = await apiClient.post(SALESPERSON_URL, data);
    return response.data;
  },

  // PUT /api/admin/users/salesperson/:id
  updateSalesperson: async (id, data) => {
    const response = await apiClient.put(`${SALESPERSON_URL}/${id}`, data);
    return response.data;
  },

  // PATCH /api/admin/users/salesperson/:id/status
  changeSalespersonStatus: async (id, status) => {
    const response = await apiClient.patch(`${SALESPERSON_URL}/${id}/status`, {
      status,
    });
    return response.data;
  },

  // DELETE /api/admin/users/salesperson/:id
  deleteSalesperson: async id => {
    const response = await apiClient.delete(`${SALESPERSON_URL}/${id}`);
    return response.data;
  },

  // GET /api/admin/users/salesperson/search
  searchSalespersons: async searchParams => {
    const params = new URLSearchParams();
    if (searchParams.id) params.append('id', searchParams.id);
    if (searchParams.email) params.append('email', searchParams.email);
    if (searchParams.fullName) params.append('fullName', searchParams.fullName);
    const response = await apiClient.get(`${SALESPERSON_URL}/search?${params}`);
    return response.data;
  },

  // GET /api/admin/users/salesperson-tasks/performance
  getSalespersonTaskPerformance: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.salesperson_id)
      params.append('salesperson_id', filters.salesperson_id);
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(
      `/admin/users/salesperson-tasks/performance?${params}`
    );
    return response.data;
  },
};
