// src/core/api/admin/adminApi.js

const BASE_URL = 'http://localhost:5000/api';

// Generic fetch wrapper with credentials
const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

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

  // GET /api/admin/auth/me (Session Check) <-- ADD THIS
  verifySession: () => fetchWithAuth('/admin/auth/me'),

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

  // GET /api/admin/users/admin/search?q=
  searchAdmins: query =>
    fetchWithAuth(`/admin/users/admin/search?q=${encodeURIComponent(query)}`),

  // ========== SALESPERSON MANAGEMENT ==========
  // GET /api/admin/users/salesperson
  getSalespersons: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
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

  // GET /api/admin/users/salesperson/search?q=
  searchSalespersons: query =>
    fetchWithAuth(
      `/admin/users/salesperson/search?q=${encodeURIComponent(query)}`
    ),

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
export default {
  auth: adminAuthApi,
  branches: branchApi,
  staff: staffApi,
  roles: rolesApi,
  activityLogs: activityLogsApi,
  userEngagement: userEngagementApi,
  revenue: revenueApi,
};
