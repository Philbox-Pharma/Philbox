import apiClient from '../client';

const BASE_URL = '/admin/salesperson-tasks';

export const salespersonTasksService = {
  // GET /api/admin/salesperson-tasks
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.salesperson_id)
      params.append('salesperson_id', filters.salesperson_id);
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(`${BASE_URL}?${params}`);
    return response.data;
  },

  // GET /api/admin/salesperson-tasks/:id
  getTaskById: async taskId => {
    const response = await apiClient.get(`${BASE_URL}/${taskId}`);
    return response.data;
  },

  // POST /api/admin/salesperson-tasks
  createTask: async taskData => {
    const response = await apiClient.post(BASE_URL, taskData);
    return response.data;
  },

  // PUT /api/admin/salesperson-tasks/:id
  updateTask: async (taskId, taskData) => {
    const response = await apiClient.put(`${BASE_URL}/${taskId}`, taskData);
    return response.data;
  },

  // POST /api/admin/salesperson-tasks/:id/updates
  addTaskUpdate: async (taskId, updateData) => {
    const response = await apiClient.post(
      `${BASE_URL}/${taskId}/updates`,
      updateData
    );
    return response.data;
  },

  // DELETE /api/admin/salesperson-tasks/:id
  deleteTask: async taskId => {
    const response = await apiClient.delete(`${BASE_URL}/${taskId}`);
    return response.data;
  },

  // GET /api/admin/salesperson-tasks/statistics
  getStatistics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.salesperson_id)
      params.append('salesperson_id', filters.salesperson_id);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const response = await apiClient.get(`${BASE_URL}/statistics?${params}`);
    return response.data;
  },
};
