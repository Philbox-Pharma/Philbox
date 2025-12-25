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
                data: null
            };
        }

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Something went wrong',
                data: data
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
            data: null
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
    verifySession: () =>
        fetchWithAuth('/admin/auth/me'),

    // POST /api/admin/auth/logout
    logout: () =>
        fetchWithAuth('/admin/auth/logout', { method: 'POST' }),

    // POST /api/admin/auth/forget-password
    forgotPassword: (email) =>
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
    update2FASettings: (isTwoFactorEnabled) =>
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
    getById: (id) =>
        fetchWithAuth(`/admin/branches/${id}`),

    // POST /api/admin/branches
    create: (branchData) =>
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
    delete: (id) =>
        fetchWithAuth(`/admin/branches/${id}`, { method: 'DELETE' }),

    // PATCH /api/admin/branches/:id/toggle-status
    toggleStatus: (id) =>
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
    getStatistics: () =>
        fetchWithAuth('/admin/branches/statistics/all'),

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

// ============ STAFF APIs ============
// Note: These endpoints may not exist yet in backend
// Using mock data for now, update when backend ready
export const staffApi = {
    // Mock - Replace with actual endpoints when ready
    getAdmins: async (page = 1, limit = 10, filters = {}) => {
        // Return mock data until backend ready
        return {
            success: true,
            data: {
                admins: [],
                pagination: { total: 0, page, limit, totalPages: 0 }
            }
        };
    },

    getSalespersons: async (page = 1, limit = 10, filters = {}) => {
        // Return mock data until backend ready
        return {
            success: true,
            data: {
                salespersons: [],
                pagination: { total: 0, page, limit, totalPages: 0 }
            }
        };
    },

    createSalesperson: async (data) => {
        // TODO: Implement when backend ready
        console.warn('createSalesperson API not implemented yet');
        return { success: false, message: 'Not implemented' };
    },

    updateSalesperson: async (id, data) => {
        // TODO: Implement when backend ready
        console.warn('updateSalesperson API not implemented yet');
        return { success: false, message: 'Not implemented' };
    },

    deleteSalesperson: async (id) => {
        // TODO: Implement when backend ready
        console.warn('deleteSalesperson API not implemented yet');
        return { success: false, message: 'Not implemented' };
    },
};

export default {
    auth: adminAuthApi,
    branches: branchApi,
    staff: staffApi,
};
