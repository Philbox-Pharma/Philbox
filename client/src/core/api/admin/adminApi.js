// src/core/api/admin/adminApi.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic fetch wrapper with credentials
const fetchWithAuth = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw {
        status: response.status,
        message: 'Server returned non-JSON response',
        data: null,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Something went wrong',
        data: data,
      };
    }

    return data;
  } catch (error) {
    // Re-throw if already formatted
    if (error.status) throw error;

    // Network or other errors
    throw {
      status: 0,
      message: error.message || 'Network error',
      data: null,
    };
  }
};

// ============ AUTH APIs ============
// Base: /api/admin/auth
export const adminAuthApi = {
  // POST /api/admin/auth/login
  login: (email, password) =>
    fetchWithAuth('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // POST /api/admin/auth/verify-otp
  verifyOtp: (email, otp) =>
    fetchWithAuth('/admin/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  // GET /api/admin/auth/me (Session Check)
  verifySession: () => fetchWithAuth('/admin/auth/me'),

  // PUT /api/admin/users/admin/:id (Update Admin Profile)
  updateProfile: (adminId, data) =>
    fetchWithAuth(`/admin/users/admin/${adminId}`, {
      method: 'PUT',
      body: data, // FormData or JSON
      headers:
        data instanceof FormData ? {} : { 'Content-Type': 'application/json' }, // fetchWithAuth adds json content type by default but FormData needs none allowed (to let browser set boundary)
    }),

  // POST /api/admin/auth/logout
  logout: () => fetchWithAuth('/admin/auth/logout', { method: 'POST' }),

  // POST /api/admin/auth/forget-password
  forgotPassword: email =>
    fetchWithAuth('/admin/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // POST /api/admin/auth/reset-password
  resetPassword: (token, newPassword) =>
    fetchWithAuth('/admin/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  // PATCH /api/admin/auth/2fa-settings
  update2FASettings: isTwoFactorEnabled =>
    fetchWithAuth('/admin/auth/2fa-settings', {
      method: 'PATCH',
      body: JSON.stringify({ isTwoFactorEnabled }),
    }),
};
// ============ BRANCH APIs ============
// Base: /api/admin/branches
export const branchApi = {
  // GET /api/admin/branches?page=1&limit=10&search=&status=
  getAll: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    return fetchWithAuth(`/admin/branches?${params}`);
  },

  // GET /api/admin/branches/:id
  getById: id => fetchWithAuth(`/admin/branches/${id}`),

  // POST /api/admin/branches
  create: branchData =>
    fetchWithAuth('/admin/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    }),

  // PUT /api/admin/branches/:id
  update: (id, branchData) =>
    fetchWithAuth(`/admin/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    }),

  // DELETE /api/admin/branches/:id
  delete: id => fetchWithAuth(`/admin/branches/${id}`, { method: 'DELETE' }),

  // PATCH /api/admin/branches/:id/toggle-status
  toggleStatus: id =>
    fetchWithAuth(`/admin/branches/${id}/toggle-status`, { method: 'PATCH' }),

  // PATCH /api/admin/branches/:id/assign-admins
  assignAdmins: (id, adminIds) =>
    fetchWithAuth(`/admin/branches/${id}/assign-admins`, {
      method: 'PATCH',
      body: JSON.stringify({ adminIds }),
    }),

  // PATCH /api/admin/branches/:id/assign-salespersons
  assignSalespersons: (id, salespersonIds) =>
    fetchWithAuth(`/admin/branches/${id}/assign-salespersons`, {
      method: 'PATCH',
      body: JSON.stringify({ salespersonIds }),
    }),

  // GET /api/admin/branches/statistics/all
  getStatistics: () => fetchWithAuth('/admin/branches/statistics/all'),

  // GET /api/admin/branches/:id/performance
  getPerformance: (id, startDate, endDate, period) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (period) params.append('period', period);
    const query = params.toString() ? `?${params}` : '';

    // Correct URL: /admin/branches/:id/performance
    return fetchWithAuth(`/admin/branches/${id}/performance${query}`);
  },
};

// ============ REVENUE ANALYTICS APIs ============
// Base: /api/admin/revenue-analytics
export const revenueApi = {
  // GET /api/admin/revenue-analytics/overview
  getOverview: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchWithAuth(`/admin/revenue-analytics/overview${query}`);
  },

  // GET /api/admin/revenue-analytics/trends
  getTrends: (startDate, endDate, period = 'daily') => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('period', period);
    return fetchWithAuth(`/admin/revenue-analytics/trends?${params}`);
  },

  // GET /api/admin/revenue-analytics/split
  getSplit: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchWithAuth(`/admin/revenue-analytics/split${query}`);
  },

  // GET /api/admin/revenue-analytics/top-branches (Super Admin Only)
  getTopBranches: (startDate, endDate, limit = 5) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit);
    return fetchWithAuth(`/admin/revenue-analytics/top-branches?${params}`);
  },

  // GET /api/admin/revenue-analytics/refunds
  getRefunds: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchWithAuth(`/admin/revenue-analytics/refunds${query}`);
  },

  // GET /api/admin/revenue-analytics/average-per-customer
  getAvgPerCustomer: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchWithAuth(
      `/admin/revenue-analytics/average-per-customer${query}`
    );
  },

  // GET /api/admin/revenue-analytics/payment-methods
  getPaymentMethods: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchWithAuth(`/admin/revenue-analytics/payment-methods${query}`);
  },
};

// ============ STAFF APIs ============
export const staffApi = {
  // ========== ADMIN MANAGEMENT ==========
  // GET /api/admin/users/admin
  getAdmins: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.branch) params.append('branch', filters.branch);
    return fetchWithAuth(`/admin/users/admin?${params}`);
  },

  // GET /api/admin/users/admin/:id
  getAdminById: id => fetchWithAuth(`/admin/users/admin/${id}`),

  // POST /api/admin/users/admin (multipart/form-data)
  createAdmin: async formData => {
    const response = await fetch(`${BASE_URL}/admin/users/admin`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // FormData for file upload
    });
    return response.json();
  },

  // PUT /api/admin/users/admin/:id (multipart/form-data)
  updateAdmin: async (id, formData) => {
    const response = await fetch(`${BASE_URL}/admin/users/admin/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    return response.json();
  },

  // DELETE /api/admin/users/admin/:id
  deleteAdmin: id =>
    fetchWithAuth(`/admin/users/admin/${id}`, { method: 'DELETE' }),

  // GET /api/admin/users/admin/search?name=
  searchAdmins: searchParams => {
    const params = new URLSearchParams();
    if (searchParams.id) params.append('id', searchParams.id);
    if (searchParams.email) params.append('email', searchParams.email);
    if (searchParams.name) params.append('name', searchParams.name);
    return fetchWithAuth(`/admin/users/admin/search?${params}`);
  },

  // ========== SALESPERSON MANAGEMENT ==========
  // GET /api/admin/users/salesperson
  getSalespersons: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.branch) params.append('branch', filters.branch);
    return fetchWithAuth(`/admin/users/salesperson?${params}`);
  },

  // GET /api/admin/users/salesperson/:id
  getSalespersonById: id => fetchWithAuth(`/admin/users/salesperson/${id}`),

  // POST /api/admin/users/salesperson
  createSalesperson: data =>
    fetchWithAuth('/admin/users/salesperson', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /api/admin/users/salesperson/:id
  updateSalesperson: (id, data) =>
    fetchWithAuth(`/admin/users/salesperson/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // PATCH /api/admin/users/salesperson/:id/status
  changeSalespersonStatus: (id, status) =>
    fetchWithAuth(`/admin/users/salesperson/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // DELETE /api/admin/users/salesperson/:id
  deleteSalesperson: id =>
    fetchWithAuth(`/admin/users/salesperson/${id}`, { method: 'DELETE' }),

  // GET /api/admin/users/salesperson/search?fullName=
  searchSalespersons: searchParams => {
    const params = new URLSearchParams();
    if (searchParams.id) params.append('id', searchParams.id);
    if (searchParams.email) params.append('email', searchParams.email);
    if (searchParams.fullName) params.append('fullName', searchParams.fullName);
    return fetchWithAuth(`/admin/users/salesperson/search?${params}`);
  },

  // GET /api/admin/users/salesperson-tasks/performance
  getSalespersonTaskPerformance: (filters = {}) => {
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
    return fetchWithAuth(
      `/admin/users/salesperson-tasks/performance?${params}`
    );
  },

  // ========== DOCTOR APPLICATIONS ==========
  // GET /api/admin/doctors/applications
  getDoctorApplications: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status || 'pending');
    return fetchWithAuth(`/admin/doctors/applications?${params}`);
  },

  // GET /api/admin/doctors/applications/:id
  getDoctorApplicationById: id =>
    fetchWithAuth(`/admin/doctors/applications/${id}`),

  // PATCH /api/admin/doctors/applications/:id/approve
  approveDoctorApplication: (id, comment = '') =>
    fetchWithAuth(`/admin/doctors/applications/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment }),
    }),

  // PATCH /api/admin/doctors/applications/:id/reject
  rejectDoctorApplication: (id, reason) =>
    fetchWithAuth(`/admin/doctors/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};

// ============ ROLES & PERMISSIONS APIs ============
// Base: /api/admin/permissions (mounted under permissions in server.js)
export const rolesApi = {
  // GET /api/admin/permissions/roles
  getAllRoles: () => fetchWithAuth('/admin/permissions/roles'),

  // GET /api/admin/permissions/roles/:id
  getRoleById: id => fetchWithAuth(`/admin/permissions/roles/${id}`),

  // PUT /api/admin/permissions/roles/:id
  updateRolePermissions: (id, permissionIds) =>
    fetchWithAuth(`/admin/permissions/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    }),

  // POST /api/admin/permissions/roles/:id/permissions
  addPermissionToRole: (roleId, permissionId) =>
    fetchWithAuth(`/admin/permissions/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionId }),
    }),

  // DELETE /api/admin/permissions/roles/:id/permissions
  removePermissionFromRole: (roleId, permissionId) =>
    fetchWithAuth(`/admin/permissions/roles/${roleId}/permissions`, {
      method: 'DELETE',
      body: JSON.stringify({ permissionId }),
    }),

  // GET /api/admin/permissions/permissions
  getAllPermissions: () => fetchWithAuth('/admin/permissions/permissions'),

  // POST /api/admin/permissions/permissions
  createPermission: data =>
    fetchWithAuth('/admin/permissions/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /api/admin/permissions/users/assign-role
  assignRoleToUser: (userId, userType, roleId) =>
    fetchWithAuth('/admin/permissions/users/assign-role', {
      method: 'POST',
      body: JSON.stringify({ userId, userType, roleId }),
    }),

  // GET /api/admin/permissions/user-role
  getUserRole: (userId, userType) =>
    fetchWithAuth(
      `/admin/permissions/user-role?userId=${userId}&userType=${userType}`
    ),
};

// ============ ACTIVITY LOGS APIs ============
export const activityLogsApi = {
  // GET /api/admin/activity-logs-analytics/overview
  getOverview: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchWithAuth(`/admin/activity-logs-analytics/overview?${params}`);
  },

  // GET /api/admin/activity-logs-analytics/timeline
  getTimeline: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    return fetchWithAuth(`/admin/activity-logs-analytics/timeline?${params}`);
  },

  // GET /api/admin/activity-logs-analytics/frequent-actions
  getFrequentActions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.topN) params.append('topN', filters.topN);
    return fetchWithAuth(
      `/admin/activity-logs-analytics/frequent-actions?${params}`
    );
  },

  // GET /api/admin/activity-logs-analytics/login-attempts
  getLoginAttempts: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchWithAuth(
      `/admin/activity-logs-analytics/login-attempts?${params}`
    );
  },

  // GET /api/admin/activity-logs-analytics/suspicious-activities
  getSuspiciousActivities: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    return fetchWithAuth(
      `/admin/activity-logs-analytics/suspicious-activities?${params}`
    );
  },
};

// ============ USER ENGAGEMENT APIs ============
export const userEngagementApi = {
  // GET /api/admin/user-engagement-analytics/overview
  getOverview: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.limit) params.append('limit', filters.limit);
    return fetchWithAuth(`/admin/user-engagement-analytics/overview?${params}`);
  },

  // GET /api/admin/user-engagement-analytics/new-customers
  getNewCustomers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/new-customers?${params}`
    );
  },

  // GET /api/admin/user-engagement-analytics/customer-status
  getCustomerStatus: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/customer-status?${params}`
    );
  },

  // GET /api/admin/user-engagement-analytics/doctor-applications
  getDoctorApplications: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/doctor-applications?${params}`
    );
  },

  // GET /api/admin/user-engagement-analytics/doctor-activity
  getDoctorActivity: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/doctor-activity?${params}`
    );
  },

  // GET /api/admin/user-engagement-analytics/top-customers
  getTopCustomers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.metric) params.append('metric', filters.metric);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/top-customers?${params}`
    );
  },

  // GET /api/admin/user-engagement-analytics/retention-rate
  getRetentionRate: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/user-engagement-analytics/retention-rate?${params}`
    );
  },
};

// ============ ORDERS ANALYTICS APIs ============
// Base: /api/admin/orders-analytics
export const ordersAnalyticsApi = {
  // GET /api/admin/orders-analytics/overview
  getOverview: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/orders-analytics/overview?${params}`);
  },

  // GET /api/admin/orders-analytics/trends
  getTrends: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/orders-analytics/trends?${params}`);
  },

  // GET /api/admin/orders-analytics/status-breakdown
  getStatusBreakdown: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/orders-analytics/status-breakdown?${params}`);
  },

  // GET /api/admin/orders-analytics/top-medicines
  getTopMedicines: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/orders-analytics/top-medicines?${params}`);
  },

  // GET /api/admin/orders-analytics/stock-alerts
  getStockAlerts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.threshold) params.append('threshold', filters.threshold);
    return fetchWithAuth(`/admin/orders-analytics/stock-alerts?${params}`);
  },

  // GET /api/admin/orders-analytics/revenue-by-category
  getRevenueByCategory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/orders-analytics/revenue-by-category?${params}`
    );
  },

  // GET /api/admin/orders-analytics/refund-rate
  getRefundRate: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/orders-analytics/refund-rate?${params}`);
  },
};

// ============ SALESPERSON TASK MANAGEMENT APIs ============
// Base: /api/admin/salesperson-tasks
export const salespersonTaskApi = {
  // GET /api/admin/salesperson-tasks
  getTasks: (filters = {}) => {
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
    return fetchWithAuth(`/admin/salesperson-tasks?${params}`);
  },

  // GET /api/admin/salesperson-tasks/:id
  getTaskById: taskId => fetchWithAuth(`/admin/salesperson-tasks/${taskId}`),

  // POST /api/admin/salesperson-tasks
  createTask: taskData =>
    fetchWithAuth('/admin/salesperson-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  // PUT /api/admin/salesperson-tasks/:id
  updateTask: (taskId, taskData) =>
    fetchWithAuth(`/admin/salesperson-tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  // POST /api/admin/salesperson-tasks/:id/updates
  addTaskUpdate: (taskId, updateData) =>
    fetchWithAuth(`/admin/salesperson-tasks/${taskId}/updates`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    }),

  // DELETE /api/admin/salesperson-tasks/:id
  deleteTask: taskId =>
    fetchWithAuth(`/admin/salesperson-tasks/${taskId}`, {
      method: 'DELETE',
    }),

  // GET /api/admin/salesperson-tasks/statistics
  getStatistics: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branch_id) params.append('branch_id', filters.branch_id);
    if (filters.salesperson_id)
      params.append('salesperson_id', filters.salesperson_id);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return fetchWithAuth(`/admin/salesperson-tasks/statistics?${params}`);
  },
};

// ============ DOCTOR MANAGEMENT APIs ============
// Base: /api/admin/doctors
export const doctorApi = {
  // GET /api/admin/doctors - Get all doctors
  getAllDoctors: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.specialty) params.append('specialty', filters.specialty);
    return fetchWithAuth(`/admin/doctors?${params}`);
  },

  // GET /api/admin/doctors/:id - Get doctor by ID
  getDoctorById: id => fetchWithAuth(`/admin/doctors/${id}`),

  // PUT /api/admin/doctors/:id - Update doctor profile
  updateDoctorProfile: (id, data) =>
    fetchWithAuth(`/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // PATCH /api/admin/doctors/:id/status - Update doctor status (suspend/activate/block)
  updateDoctorStatus: (id, statusData) =>
    fetchWithAuth(`/admin/doctors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),

  // GET /api/admin/doctors/:id/metrics - Get doctor performance metrics
  getDoctorMetrics: id => fetchWithAuth(`/admin/doctors/${id}/metrics`),

  // ========== DOCTOR APPLICATIONS ==========
  // GET /api/admin/doctors/applications
  getApplications: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status || 'pending');
    return fetchWithAuth(`/admin/doctors/applications?${params}`);
  },

  // GET /api/admin/doctors/applications/:id
  getApplicationById: id => fetchWithAuth(`/admin/doctors/applications/${id}`),

  // PATCH /api/admin/doctors/applications/:id/approve
  approveApplication: (id, comment = '') =>
    fetchWithAuth(`/admin/doctors/applications/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment }),
    }),

  // PATCH /api/admin/doctors/applications/:id/reject
  rejectApplication: (id, reason) =>
    fetchWithAuth(`/admin/doctors/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};

// ============ CUSTOMER MANAGEMENT APIs ============
// Base: /api/super-admin/customers
export const customerApi = {
  // GET /api/super-admin/customers
  getCustomers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.account_status)
      params.append('account_status', filters.account_status);
    if (filters.is_Verified) params.append('is_Verified', filters.is_Verified);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/super-admin/customers?${params}`);
  },

  // GET /api/super-admin/customers/:id
  getCustomerById: customerId =>
    fetchWithAuth(`/super-admin/customers/${customerId}`),

  // PATCH /api/super-admin/customers/:id/status
  toggleCustomerStatus: (customerId, statusData) =>
    fetchWithAuth(`/super-admin/customers/${customerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),

  // GET /api/super-admin/customers/metrics/analytics
  getMetrics: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/super-admin/customers/metrics/analytics?${params}`);
  },
};

// ============ FEEDBACK & COMPLAINTS ANALYTICS APIs ============
// Base: /api/admin/feedback-complaints-analytics
export const feedbackComplaintsApi = {
  // GET /api/admin/feedback-complaints-analytics/summary
  getSummary: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/summary?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/sentiment-analysis
  getSentimentAnalysis: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/sentiment-analysis?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/resolution-time
  getResolutionTime: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/resolution-time?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/complaints-by-category
  getComplaintsByCategory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/complaints-by-category?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/feedback-by-category
  getFeedbackByCategory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/feedback-by-category?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/resolution-status
  getResolutionStatus: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/resolution-status?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/feedback-trends
  getFeedbackTrends: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/feedback-trends?${params}`
    );
  },

  // GET /api/admin/feedback-complaints-analytics/complaint-trends
  getComplaintTrends: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/feedback-complaints-analytics/complaint-trends?${params}`
    );
  },
};

// ============ APPOINTMENT ANALYTICS APIs ============
// Base: /api/admin/appointment-analytics
export const appointmentAnalyticsApi = {
  // GET /api/admin/appointment-analytics/overview
  getOverview: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/appointment-analytics/overview?${params}`);
  },

  // GET /api/admin/appointment-analytics/trends
  getTrends: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(`/admin/appointment-analytics/trends?${params}`);
  },

  // GET /api/admin/appointment-analytics/completion-rate
  getCompletionRate: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/appointment-analytics/completion-rate?${params}`
    );
  },

  // GET /api/admin/appointment-analytics/top-doctors/appointments
  getTopDoctorsByAppointments: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/appointment-analytics/top-doctors/appointments?${params}`
    );
  },

  // GET /api/admin/appointment-analytics/appointment-types
  getAppointmentTypes: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.branchId) params.append('branchId', filters.branchId);
    return fetchWithAuth(
      `/admin/appointment-analytics/appointment-types?${params}`
    );
  },
};

// ============ GLOBAL SEARCH HELPER ============
// Searches across all entities in parallel
export const globalSearchApi = {
  search: async (query, limit = 5) => {
    if (!query || query.length < 2) return [];

    const results = [];

    try {
      const [branches, admins, salespersons, customers, doctors] =
        await Promise.allSettled([
          branchApi.getAll(1, limit, { search: query }),
          staffApi.getAdmins(1, limit, { search: query }),
          staffApi.getSalespersons(1, limit, { search: query }),
          customerApi.getCustomers({ page: 1, limit, search: query }),
          doctorApi.getAllDoctors({ page: 1, limit, search: query }),
        ]);

      // Parse Branches
      if (branches.status === 'fulfilled' && branches.value?.data?.branches) {
        branches.value.data.branches.forEach(b => {
          results.push({
            id: b._id,
            type: 'branch',
            name: b.name || b.branch_name,
            description: b.address || b.city || 'Branch',
            path: `/admin/branches/${b._id}`,
          });
        });
      }

      // Parse Admins
      if (admins.status === 'fulfilled' && admins.value?.data?.admins) {
        admins.value.data.admins.forEach(a => {
          results.push({
            id: a._id,
            type: 'admin',
            name: a.name || a.fullName,
            description: a.email || 'Admin',
            path: `/admin/staff/admins/${a._id}`,
          });
        });
      }

      // Parse Salespersons
      if (
        salespersons.status === 'fulfilled' &&
        salespersons.value?.data?.salespersons
      ) {
        salespersons.value.data.salespersons.forEach(s => {
          results.push({
            id: s._id,
            type: 'salesperson',
            name: s.fullName || s.name,
            description: s.email || 'Salesperson',
            path: `/admin/staff/salespersons/${s._id}`,
          });
        });
      }

      // Parse Customers
      if (
        customers.status === 'fulfilled' &&
        customers.value?.data?.customers
      ) {
        customers.value.data.customers.forEach(c => {
          results.push({
            id: c._id,
            type: 'customer',
            name: c.fullName || c.name,
            description: c.email || c.phone_number || 'Customer',
            path: `/admin/customers/${c._id}`,
          });
        });
      }

      // Parse Doctors
      if (doctors.status === 'fulfilled' && doctors.value?.data?.doctors) {
        doctors.value.data.doctors.forEach(d => {
          results.push({
            id: d._id,
            type: 'doctor',
            name: d.fullName || d.name,
            description: d.specialty || d.email || 'Doctor',
            path: `/admin/doctors/${d._id}`,
          });
        });
      }
    } catch (err) {
      console.error('Global search error:', err);
    }

    return results;
  },
};

export default {
  auth: adminAuthApi,
  branches: branchApi,
  staff: staffApi,
  roles: rolesApi,
  activityLogs: activityLogsApi,
  userEngagement: userEngagementApi,
  revenue: revenueApi,
  ordersAnalytics: ordersAnalyticsApi,
  salespersonTasks: salespersonTaskApi,
  customers: customerApi,
  doctors: doctorApi,
  feedbackComplaints: feedbackComplaintsApi,
  appointmentAnalytics: appointmentAnalyticsApi,
  globalSearch: globalSearchApi,
};
