/**
 * Example Controller with RBAC Permission Checking
 *
 * This demonstrates how to use permission helper functions
 * in your controller logic for more granular access control.
 */

import {
  hasPermission,
  hasAnyPermission,
  getUserPermissions,
} from '../../../../../utils/permissionHelpers.js';
import { sendResponse } from '../../../../../utils/sendResponse.js';

/**
 * Example: List branches with different data based on user permissions
 */
export const listBranches = async (req, res) => {
  try {
    // req.user should be populated by auth middleware
    if (!req.user) {
      return sendResponse(res, 401, 'User not authenticated', null);
    }

    // Optional: Check if user has additional specific permission
    const canViewFullDetails = await hasPermission(
      req.user,
      'read_full_branch_details'
    );

    // Determine view level based on permissions
    const viewLevel = canViewFullDetails ? 'full' : 'limited';
    console.log(`User viewing branches with ${viewLevel} access level`);

    // Get branches from database
    const branches = [
      // Mock data
      { id: 1, name: 'Branch A', address: 'Address A', phone: '123' },
      { id: 2, name: 'Branch B', address: 'Address B', phone: '456' },
    ];

    return sendResponse(res, 200, 'Branches fetched successfully', branches);
  } catch (error) {
    console.error('Error listing branches:', error);
    return sendResponse(res, 500, 'Internal server error', null);
  }
};

/**
 * Example: Create branch with audit logging based on user role
 */
export const createBranch = async (req, res) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, 'User not authenticated', null);
    }

    const { name, address, phone } = req.body;

    // Validate request
    if (!name || !address) {
      return sendResponse(res, 400, 'Missing required fields', null);
    }

    // Get user's permissions for logging/auditing
    const userPermissions = await getUserPermissions(req.user);
    const permissionNames = userPermissions.map(p => p.name);

    console.log(
      `User ${req.user.id} with permissions [${permissionNames.join(', ')}] creating branch`
    );

    // Create branch in database
    const newBranch = {
      id: 3,
      name,
      address,
      phone,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    // Log action for audit trail
    // await logAdminActivities(req.user.id, 'CREATE', 'branch', newBranch.id);

    return sendResponse(res, 201, 'Branch created successfully', newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    return sendResponse(res, 500, 'Internal server error', null);
  }
};

/**
 * Example: Update branch with permission-based validation
 */
export const updateBranch = async (req, res) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, 'User not authenticated', null);
    }

    const { id } = req.params;
    const { name, address, phone } = req.body;

    // Optional: Check for super-admin-only restrictions
    const canDeleteAnyBranch = await hasPermission(req.user, 'delete_branches');

    if (canDeleteAnyBranch) {
      console.log('Super admin updating branch - all fields allowed');
    } else {
      console.log('Regular admin updating branch - limited fields');
      // Restrict certain fields for non-super-admins
      // e.g., cannot change branch manager
    }

    // Update branch
    const updatedBranch = {
      id,
      name: name || 'Branch A',
      address: address || 'Address A',
      phone: phone || '123',
      updatedBy: req.user.id,
      updatedAt: new Date(),
    };

    return sendResponse(res, 200, 'Branch updated successfully', updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    return sendResponse(res, 500, 'Internal server error', null);
  }
};

/**
 * Example: Delete branch with double permission check
 */
export const deleteBranch = async (req, res) => {
  try {
    if (!req.user) {
      return sendResponse(res, 401, 'User not authenticated', null);
    }

    const { id } = req.params;

    // Additional permission check in controller (in case middleware allows partial access)
    const hasDeletePermission = await hasAnyPermission(req.user, [
      'delete_branches',
      'super_admin_access',
    ]);

    if (!hasDeletePermission) {
      return sendResponse(
        res,
        403,
        'You do not have permission to delete branches',
        null
      );
    }

    // Perform deletion
    console.log(`Branch ${id} deleted by user ${req.user.id}`);

    return sendResponse(res, 200, 'Branch deleted successfully', { id });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return sendResponse(res, 500, 'Internal server error', null);
  }
};

export { listBranches as listBranchesController };
