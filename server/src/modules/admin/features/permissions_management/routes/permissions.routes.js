import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../../../middlewares/rbac.middleware.js';
import {
  getAllRoles,
  getAllPermissions,
  getRoleById,
  updateRolePermissions,
  assignRoleToUser,
  getUserRoleAndPermissions,
  createPermission,
  addPermissionToRole,
  removePermissionFromRole,
} from '../controller/permissions.controller.js';

const router = Router();

/**
 * All permission management endpoints require super_admin role
 */

// Get all roles (with permissions)
router.get('/roles', authenticate, roleMiddleware('super_admin'), getAllRoles);

// Get specific role
router.get(
  '/roles/:roleId',
  authenticate,
  roleMiddleware('super_admin'),
  getRoleById
);

// Get all available permissions
router.get(
  '/permissions',
  authenticate,
  roleMiddleware('super_admin'),
  getAllPermissions
);

// Get user's current role and permissions
router.get(
  '/user-role',
  authenticate,
  roleMiddleware('super_admin'),
  getUserRoleAndPermissions
);

// Create new permission
router.post(
  '/permissions',
  authenticate,
  roleMiddleware('super_admin'),
  createPermission
);

// Update role with multiple permissions at once
router.put(
  '/roles/:roleId',
  authenticate,
  roleMiddleware('super_admin'),
  updateRolePermissions
);

// Add single permission to role
router.post(
  '/roles/:roleId/permissions',
  authenticate,
  roleMiddleware('super_admin'),
  addPermissionToRole
);

// Remove permission from role
router.delete(
  '/roles/:roleId/permissions',
  authenticate,
  roleMiddleware('super_admin'),
  removePermissionFromRole
);

// Assign role to user
router.post(
  '/users/assign-role',
  authenticate,
  roleMiddleware('super_admin'),
  assignRoleToUser
);

export default router;
