import apiClient from '../client';

export const salespersonTasksApi = {
  // GET /api/salesperson/tasks
  getMyTasks: async (params = {}) => {
    const response = await apiClient.get('/salesperson/tasks', { params });
    return response;
  },

  // GET /api/salesperson/tasks/statistics
  getTaskStatistics: async (params = {}) => {
    const response = await apiClient.get('/salesperson/tasks/statistics', { params });
    return response;
  },

  // GET /api/salesperson/tasks/:taskId
  getTaskById: async (taskId) => {
    const response = await apiClient.get(`/salesperson/tasks/${taskId}`);
    return response;
  },

  // PUT /api/salesperson/tasks/:taskId/status
  updateTaskStatus: async (taskId, status) => {
    const response = await apiClient.put(`/salesperson/tasks/${taskId}/status`, { status });
    return response;
  },

  // POST /api/salesperson/tasks/:taskId/updates
  addTaskUpdate: async (taskId, message) => {
    const response = await apiClient.post(`/salesperson/tasks/${taskId}/updates`, { message });
    return response;
  },
};
