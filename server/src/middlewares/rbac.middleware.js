import Role from '../models/Role.js';
import sendResponse from '../utils/sendResponse.js';

/**
 * Middleware to check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - permission name(s) required
 * @returns middleware function
 */
export const rbacMiddleware = requiredPermissions => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated (should be checked by auth middleware before)
      // Note: req.admin is set by admin auth middleware, req.user for other roles
      const user = req.admin || req.user;

      if (!user) {
        return sendResponse(res, 401, 'Unauthorized: No user found', null);
      }

      // Get user's role with permissions
      const userRole = await Role.findById(user.roleId).populate('permissions');

      if (!userRole) {
        return sendResponse(res, 403, 'Forbidden: User role not found', null);
      }

      // Normalize requiredPermissions to array
      const permissionsToCheck = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Get all permission names for this role
      const userPermissionNames = userRole.permissions.map(perm => perm.name);

      // Check if user has at least one of the required permissions
      const hasPermission = permissionsToCheck.some(perm =>
        userPermissionNames.includes(perm)
      );

      if (!hasPermission) {
        return sendResponse(
          res,
          403,
          `Forbidden: You do not have permission to access this resource. Required: ${permissionsToCheck.join(', ')}`,
          null
        );
      }

      next();
    } catch (error) {
      console.error('RBAC Middleware Error:', error);
      return sendResponse(res, 500, 'Internal server error', null);
    }
  };
};

/**
 * Middleware to check if user has specific role(s)
 * @param {string|string[]} allowedRoles - role name(s) allowed
 * @returns middleware function
 */
export const roleMiddleware = allowedRoles => {
  return async (req, res, next) => {
    try {
      // Note: req.admin is set by admin auth middleware, req.user for other roles
      const user = req.admin || req.user;

      if (!user) {
        return sendResponse(res, 401, 'Unauthorized: No user found', null);
      }

      // Get user's role
      const userRole = await Role.findById(user.roleId);

      if (!userRole) {
        return sendResponse(res, 403, 'Forbidden: User role not found', null);
      }

      // Normalize allowedRoles to array
      const rolesToCheck = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];

      // Check if user's role is in allowed roles
      if (!rolesToCheck.includes(userRole.name)) {
        return sendResponse(
          res,
          403,
          `Forbidden: Your role (${userRole.name}) does not have access to this resource`,
          null
        );
      }

      next();
    } catch (error) {
      console.error('Role Middleware Error:', error);
      return sendResponse(res, 500, 'Internal server error', null);
    }
  };
};

/**
 * Middleware to check multiple permission requirements
 * Can use AND or OR logic
 * @param {Object} config - { permissions: string[], logic: 'AND'|'OR' }
 * @returns middleware function
 */
export const permissionCheckMiddleware = config => {
  const { permissions, logic = 'OR' } = config;

  return async (req, res, next) => {
    try {
      // Note: req.admin is set by admin auth middleware, req.user for other roles
      const user = req.admin || req.user;

      if (!user) {
        return sendResponse(res, 401, 'Unauthorized: No user found', null);
      }

      const userRole = await Role.findById(user.roleId).populate('permissions');

      if (!userRole) {
        return sendResponse(res, 403, 'Forbidden: User role not found', null);
      }

      const userPermissionNames = userRole.permissions.map(perm => perm.name);

      let hasAccess = false;

      if (logic === 'AND') {
        // User must have ALL permissions
        hasAccess = permissions.every(perm =>
          userPermissionNames.includes(perm)
        );
      } else {
        // User must have AT LEAST ONE permission (OR)
        hasAccess = permissions.some(perm =>
          userPermissionNames.includes(perm)
        );
      }

      if (!hasAccess) {
        return sendResponse(
          res,
          403,
          `Forbidden: Insufficient permissions. Required: ${permissions.join(', ')}`,
          null
        );
      }

      next();
    } catch (error) {
      console.error('Permission Check Middleware Error:', error);
      return sendResponse(res, 500, 'Internal server error', null);
    }
  };
};
