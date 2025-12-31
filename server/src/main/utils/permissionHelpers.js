import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

/**
 * Check if user has a specific permission
 * @param {Object} user - user object with roleId
 * @param {string} permissionName - name of permission to check
 * @returns {Promise<boolean>}
 */
export const hasPermission = async (user, permissionName) => {
  try {
    if (!user || !user.roleId) {
      return false;
    }

    const role = await Role.findById(user.roleId).populate('permissions');
    if (!role) {
      return false;
    }

    return role.permissions.some(perm => perm.name === permissionName);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - user object with roleId
 * @param {string[]} permissionNames - array of permission names
 * @returns {Promise<boolean>}
 */
export const hasAnyPermission = async (user, permissionNames) => {
  try {
    if (!user || !user.roleId) {
      return false;
    }

    const role = await Role.findById(user.roleId).populate('permissions');
    if (!role) {
      return false;
    }

    const userPermissions = role.permissions.map(perm => perm.name);
    return permissionNames.some(perm => userPermissions.includes(perm));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Check if user has all specified permissions
 * @param {Object} user - user object with roleId
 * @param {string[]} permissionNames - array of permission names
 * @returns {Promise<boolean>}
 */
export const hasAllPermissions = async (user, permissionNames) => {
  try {
    if (!user || !user.roleId) {
      return false;
    }

    const role = await Role.findById(user.roleId).populate('permissions');
    if (!role) {
      return false;
    }

    const userPermissions = role.permissions.map(perm => perm.name);
    return permissionNames.every(perm => userPermissions.includes(perm));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Get all permissions for a user's role
 * @param {Object} user - user object with roleId
 * @returns {Promise<Array>}
 */
export const getUserPermissions = async user => {
  try {
    if (!user || !user.roleId) {
      return [];
    }

    const role = await Role.findById(user.roleId).populate('permissions');
    if (!role) {
      return [];
    }

    return role.permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
};

/**
 * Create or get a permission by resource and action
 * @param {string} resource - resource name (e.g., 'users', 'branches')
 * @param {string} action - action type ('create', 'read', 'update', 'delete')
 * @returns {Promise<Object>} - permission object
 */
export const createOrGetPermission = async (resource, action) => {
  try {
    const permissionName = `${action}_${resource}`;

    let permission = await Permission.findOne({ resource, action });

    if (!permission) {
      permission = new Permission({
        name: permissionName,
        resource,
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
      });

      await permission.save();
    }

    return permission;
  } catch (error) {
    console.error('Error creating/getting permission:', error);
    throw error;
  }
};

/**
 * Assign permissions to a role
 * @param {string} roleId - role ID
 * @param {string[]} permissionIds - array of permission IDs
 * @returns {Promise<Object>} - updated role
 */
export const assignPermissionsToRole = async (roleId, permissionIds) => {
  try {
    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions: permissionIds },
      { new: true }
    ).populate('permissions');

    return role;
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    throw error;
  }
};

/**
 * Get all roles with their permissions
 * @returns {Promise<Array>}
 */
export const getAllRolesWithPermissions = async () => {
  try {
    return await Role.find().populate('permissions');
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

/**
 * Check if user has a specific role
 * @param {Object} user - user object with roleId
 * @param {string} roleName - name of role to check
 * @returns {Promise<boolean>}
 */
export const hasRole = async (user, roleName) => {
  try {
    if (!user || !user.roleId) {
      return false;
    }

    const role = await Role.findById(user.roleId);
    return role && role.name === roleName;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - user object with roleId
 * @param {string[]} roleNames - array of role names
 * @returns {Promise<boolean>}
 */
export const hasAnyRole = async (user, roleNames) => {
  try {
    if (!user || !user.roleId) {
      return false;
    }

    const role = await Role.findById(user.roleId);
    return role && roleNames.includes(role.name);
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
};

/**
 * Get user's role name
 * @param {Object} user - user object with roleId
 * @returns {Promise<string|null>}
 */
export const getUserRole = async user => {
  try {
    if (!user || !user.roleId) {
      return null;
    }

    const role = await Role.findById(user.roleId);
    return role ? role.name : null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};
