import apiClient from '../client';

const BASE_URL = '/admin/branches';

export const branchesService = {
  // GET /api/admin/branches?page=1&limit=10&search=&status=
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    const response = await apiClient.get(`${BASE_URL}?${params}`);
    return response.data;
  },

  // GET /api/admin/branches/:id
  getById: async id => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // POST /api/admin/branches
  create: async branchData => {
    const response = await apiClient.post(BASE_URL, branchData);
    return response.data;
  },

  // PUT /api/admin/branches/:id
  update: async (id, branchData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, branchData);
    return response.data;
  },

  // DELETE /api/admin/branches/:id
  delete: async id => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // PATCH /api/admin/branches/:id/toggle-status
  toggleStatus: async id => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/toggle-status`);
    return response.data;
  },

  // PATCH /api/admin/branches/:id/assign-admins
  assignAdmins: async (id, adminIds) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/assign-admins`, {
      adminIds,
    });
    return response.data;
  },

  // PATCH /api/admin/branches/:id/assign-salespersons
  assignSalespersons: async (id, salespersonIds) => {
    const response = await apiClient.patch(
      `${BASE_URL}/${id}/assign-salespersons`,
      { salespersonIds }
    );
    return response.data;
  },

  // GET /api/admin/branches/statistics/all
  getStatistics: async () => {
    const response = await apiClient.get(`${BASE_URL}/statistics/all`);
    return response.data;
  },

  // GET /api/admin/branches/:id/performance
  getPerformance: async (id, startDate, endDate, period) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (period) params.append('period', period);
    const query = params.toString() ? `?${params}` : '';
    const response = await apiClient.get(
      `${BASE_URL}/${id}/performance${query}`
    );
    return response.data;
  },
};
