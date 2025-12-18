import sendResponse from '../../../../../utils/sendResponse.js';
import {
  getAllRolesService,
  getAllPermissionsService,
  getRoleByIdService,
  updateRolePermissionsService,
  assignRoleToUserService,
  getUserRoleAndPermissionsService,
  createPermissionService,
  addPermissionToRoleService,
  removePermissionFromRoleService,
} from '../services/permissions.service.js';

/**
 * Get all available roles with their permissions
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await getAllRolesService(req);
    return sendResponse(res, 200, 'Roles fetched successfully', roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await getAllPermissionsService(req);
    return sendResponse(
      res,
      200,
      'Permissions fetched successfully',
      permissions
    );
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Get single role with permissions
 */
export const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await getRoleByIdService(roleId, req);
    return sendResponse(res, 200, 'Role fetched successfully', role);
  } catch (error) {
    if (error.message === 'Role not found') {
      return sendResponse(res, 404, 'Role not found', null);
    }
    console.error('Error fetching role:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Update role permissions - Super Admin only
 */
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    const updatedRole = await updateRolePermissionsService(
      roleId,
      permissionIds,
      req
    );
    return sendResponse(
      res,
      200,
      'Role permissions updated successfully',
      updatedRole
    );
  } catch (error) {
    if (error.message.includes('must be an array')) {
      return sendResponse(res, 400, 'permissionIds must be an array', null);
    }
    if (error.message === 'Role not found') {
      return sendResponse(res, 404, 'Role not found', null);
    }
    if (error.message === 'Some permissions do not exist') {
      return sendResponse(res, 400, 'Some permissions do not exist', null);
    }
    console.error('Error updating role permissions:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Assign role to user - Super Admin only
 */
export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, userType, roleId } = req.body;

    const user = await assignRoleToUserService(userId, userType, roleId, req);
    return sendResponse(
      res,
      200,
      `Role assigned to ${userType} successfully`,
      user
    );
  } catch (error) {
    if (error.message.includes('required')) {
      return sendResponse(
        res,
        400,
        'userId, userType, and roleId are required',
        null
      );
    }
    if (error.message === 'Role not found') {
      return sendResponse(res, 404, 'Role not found', null);
    }
    if (error.message.includes('Invalid userType')) {
      return sendResponse(
        res,
        400,
        'Invalid userType. Use: admin, customer, doctor, salesperson',
        null
      );
    }
    if (error.message.includes('not found')) {
      return sendResponse(res, 404, error.message, null);
    }
    console.error('Error assigning role:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Get user's current role and permissions
 */
export const getUserRoleAndPermissions = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    const result = await getUserRoleAndPermissionsService(
      req,
      userId,
      userType,
      req
    );

    return sendResponse(
      res,
      200,
      'User role and permissions fetched successfully',
      result
    );
  } catch (error) {
    if (error.message.includes('Either provide both')) {
      return sendResponse(
        res,
        400,
        'Either provide both userId and userType, or provide neither to get your own role',
        null
      );
    }
    if (error.message === 'Not authenticated') {
      return sendResponse(res, 401, 'Not authenticated', null);
    }
    if (error.message.includes('Invalid userType')) {
      return sendResponse(
        res,
        400,
        'Invalid userType. Use: admin, customer, doctor, salesperson',
        null
      );
    }
    if (error.message.includes('not found')) {
      return sendResponse(res, 404, error.message, null);
    }
    console.error('Error fetching user role:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Create new permission - Super Admin only
 */
export const createPermission = async (req, res) => {
  try {
    const { resource, action, description } = req.body;

    const permission = await createPermissionService(
      resource,
      action,
      description,
      req
    );
    return sendResponse(
      res,
      201,
      'Permission created successfully',
      permission
    );
  } catch (error) {
    if (error.message.includes('required')) {
      return sendResponse(res, 400, 'resource and action are required', null);
    }
    if (error.message.includes('must be one of')) {
      return sendResponse(res, 400, error.message, null);
    }
    if (error.message.includes('already exists')) {
      return sendResponse(res, 400, 'This permission already exists', null);
    }
    console.error('Error creating permission:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Add permission to role - Super Admin only
 */
export const addPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const updatedRole = await addPermissionToRoleService(
      roleId,
      permissionId,
      req
    );
    return sendResponse(
      res,
      200,
      'Permission added to role successfully',
      updatedRole
    );
  } catch (error) {
    if (error.message.includes('required')) {
      return sendResponse(
        res,
        400,
        'roleId and permissionId are required',
        null
      );
    }
    if (error.message === 'Role not found') {
      return sendResponse(res, 404, 'Role not found', null);
    }
    if (error.message === 'Permission not found') {
      return sendResponse(res, 404, 'Permission not found', null);
    }
    if (error.message.includes('already assigned')) {
      return sendResponse(
        res,
        400,
        'This permission is already assigned to the role',
        null
      );
    }
    console.error('Error adding permission to role:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};

/**
 * Remove permission from role - Super Admin only
 */
export const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const updatedRole = await removePermissionFromRoleService(
      roleId,
      permissionId,
      req
    );
    return sendResponse(
      res,
      200,
      'Permission removed from role successfully',
      updatedRole
    );
  } catch (error) {
    if (error.message.includes('required')) {
      return sendResponse(
        res,
        400,
        'roleId and permissionId are required',
        null
      );
    }
    if (error.message === 'Role not found') {
      return sendResponse(res, 404, 'Role not found', null);
    }
    console.error('Error removing permission from role:', error);
    return sendResponse(res, 500, 'Server error', null, error);
  }
};
