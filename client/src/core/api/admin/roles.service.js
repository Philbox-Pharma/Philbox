import apiClient from '../client';

const BASE_URL = '/admin/permissions';

export const rolesService = {
  // GET /api/admin/permissions/roles
  getAllRoles: async () => {
    const response = await apiClient.get(`${BASE_URL}/roles`);
    return response.data;
  },

  // GET /api/admin/permissions/roles/:id
  getRoleById: async id => {
    const response = await apiClient.get(`${BASE_URL}/roles/${id}`);
    return response.data;
  },

  // PUT /api/admin/permissions/roles/:id
  updateRolePermissions: async (id, permissionIds) => {
    const response = await apiClient.put(`${BASE_URL}/roles/${id}`, {
      permissionIds,
    });
    return response.data;
  },

  // POST /api/admin/permissions/roles/:id/permissions
  addPermissionToRole: async (roleId, permissionId) => {
    const response = await apiClient.post(
      `${BASE_URL}/roles/${roleId}/permissions`,
      { permissionId }
    );
    return response.data;
  },

  // DELETE /api/admin/permissions/roles/:id/permissions
  removePermissionFromRole: async (roleId, permissionId) => {
    const response = await apiClient.delete(
      `${BASE_URL}/roles/${roleId}/permissions`,
      { data: { permissionId } }
    );
    return response.data;
  },

  // GET /api/admin/permissions/permissions
  getAllPermissions: async () => {
    const response = await apiClient.get(`${BASE_URL}/permissions`);
    return response.data;
  },

  // POST /api/admin/permissions/permissions
  createPermission: async data => {
    const response = await apiClient.post(`${BASE_URL}/permissions`, data);
    return response.data;
  },

  // POST /api/admin/permissions/users/assign-role
  assignRoleToUser: async (userId, userType, roleId) => {
    const response = await apiClient.post(`${BASE_URL}/users/assign-role`, {
      userId,
      userType,
      roleId,
    });
    return response.data;
  },

  // GET /api/admin/permissions/user-role
  getUserRole: async (userId, userType) => {
    const response = await apiClient.get(
      `${BASE_URL}/user-role?userId=${userId}&userType=${userType}`
    );
    return response.data;
  },
};
