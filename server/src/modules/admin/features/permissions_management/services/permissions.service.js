import Role from '../../../../../models/Role.js';
import Permission from '../../../../../models/Permission.js';
import Admin from '../../../../../models/Admin.js';
import Customer from '../../../../../models/Customer.js';
import Doctor from '../../../../../models/Doctor.js';
import Salesperson from '../../../../../models/Salesperson.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

/**
 * Get all available roles with their permissions
 */
export const getAllRolesService = async req => {
  const roles = await Role.find().populate('permissions');

  if (req) {
    await logAdminActivity(
      req,
      'view_all_roles',
      'Viewed all roles with permissions',
      'roles',
      null
    );
  }

  return roles;
};

/**
 * Get all available permissions
 */
export const getAllPermissionsService = async req => {
  const permissions = await Permission.find().sort({
    resource: 1,
    action: 1,
  });

  if (req) {
    await logAdminActivity(
      req,
      'view_all_permissions',
      'Viewed all available permissions',
      'permissions',
      null
    );
  }

  return permissions;
};

/**
 * Get single role by ID with permissions
 */
export const getRoleByIdService = async (roleId, req) => {
  const role = await Role.findById(roleId).populate('permissions');

  if (!role) {
    throw new Error('Role not found');
  }

  if (req) {
    await logAdminActivity(
      req,
      'view_role',
      `Viewed role: ${role.name}`,
      'roles',
      role._id
    );
  }

  return role;
};

/**
 * Update role permissions
 */
export const updateRolePermissionsService = async (
  roleId,
  permissionIds,
  req
) => {
  if (!permissionIds || !Array.isArray(permissionIds)) {
    throw new Error('permissionIds must be an array');
  }

  // Verify role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  const oldPermissions = role.permissions.map(p => p.toString());

  // Verify all permissions exist
  const permissions = await Permission.find({ _id: { $in: permissionIds } });
  if (permissions.length !== permissionIds.length) {
    throw new Error('Some permissions do not exist');
  }

  // Update role with new permissions
  role.permissions = permissionIds;
  await role.save();

  if (req) {
    await logAdminActivity(
      req,
      'update_role_permissions',
      `Updated permissions for role: ${role.name}`,
      'roles',
      role._id,
      { old_permissions: oldPermissions, new_permissions: permissionIds }
    );
  }

  const updatedRole = await Role.findById(roleId).populate('permissions');
  return updatedRole;
};

/**
 * Assign role to user by type
 */
export const assignRoleToUserService = async (
  userId,
  userType,
  roleId,
  req
) => {
  if (!userId || !userType || !roleId) {
    throw new Error('userId, userType, and roleId are required');
  }

  // Verify role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  // Find user based on type
  let user;
  const normalizedUserType = userType.toLowerCase();

  switch (normalizedUserType) {
    case 'admin':
      user = await Admin.findByIdAndUpdate(userId, { roleId }, { new: true });
      break;
    case 'customer':
      user = await Customer.findByIdAndUpdate(
        userId,
        { roleId },
        { new: true }
      );
      break;
    case 'doctor':
      user = await Doctor.findByIdAndUpdate(userId, { roleId }, { new: true });
      break;
    case 'salesperson':
      user = await Salesperson.findByIdAndUpdate(
        userId,
        { roleId },
        { new: true }
      );
      break;
    default:
      throw new Error(
        'Invalid userType. Use: admin, customer, doctor, salesperson'
      );
  }

  if (!user) {
    throw new Error(`${userType} user not found`);
  }

  if (req) {
    await logAdminActivity(
      req,
      'assign_role_to_user',
      `Assigned role '${role.name}' to ${userType}: ${user.email || user.fullName || user.name}`,
      `${normalizedUserType}s`,
      userId,
      { role_id: roleId, role_name: role.name, user_type: normalizedUserType }
    );
  }

  return user;
};

/**
 * Get user's current role and permissions
 */
export const getUserRoleAndPermissionsService = async (
  authenticatedUser,
  userId,
  userType,
  req
) => {
  // 🔐 Validate: Either both userId AND userType provided, or NEITHER (use authenticated user)
  const hasBothParams = userId && userType;
  const hasNeitherParams = !userId && !userType;

  if (!hasBothParams && !hasNeitherParams) {
    throw new Error(
      'Either provide both userId and userType, or provide neither to get your own role'
    );
  }

  let user;
  let currentUserType;

  if (hasNeitherParams) {
    // Get current authenticated user's role
    if (authenticatedUser.admin) {
      user = authenticatedUser.admin;
      currentUserType = 'admin';
    } else if (authenticatedUser.customer) {
      user = authenticatedUser.customer;
      currentUserType = 'customer';
    } else if (authenticatedUser.doctor) {
      user = authenticatedUser.doctor;
      currentUserType = 'doctor';
    } else if (authenticatedUser.salesperson) {
      user = authenticatedUser.salesperson;
      currentUserType = 'salesperson';
    } else {
      throw new Error('Not authenticated');
    }

    // Fetch full user with populated role and permissions
    switch (currentUserType) {
      case 'admin':
        user = await Admin.findById(user._id).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        break;
      case 'customer':
        user = await Customer.findById(user._id).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        break;
      case 'doctor':
        user = await Doctor.findById(user._id).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        break;
      case 'salesperson':
        user = await Salesperson.findById(user._id).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        break;
    }
  } else {
    // Find user based on provided userId and userType (both required)
    const normalizedUserType = userType.toLowerCase();

    switch (normalizedUserType) {
      case 'admin':
        user = await Admin.findById(userId).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        currentUserType = 'admin';
        break;
      case 'customer':
        user = await Customer.findById(userId).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        currentUserType = 'customer';
        break;
      case 'doctor':
        user = await Doctor.findById(userId).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        currentUserType = 'doctor';
        break;
      case 'salesperson':
        user = await Salesperson.findById(userId).populate({
          path: 'roleId',
          populate: 'permissions',
        });
        currentUserType = 'salesperson';
        break;
      default:
        throw new Error(
          'Invalid userType. Use: admin, customer, doctor, salesperson'
        );
    }
  }

  if (!user || !user.roleId) {
    throw new Error('User or user role not found');
  }

  if (req) {
    await logAdminActivity(
      req,
      'view_user_role_permissions',
      `Viewed role and permissions for ${currentUserType}: ${user.email || user.fullName || user.name}`,
      `${currentUserType}s`,
      user._id
    );
  }

  return {
    userId: user._id,
    userType: currentUserType,
    role: user.roleId.name,
    roleId: user.roleId._id,
    permissions: user.roleId.permissions,
  };
};

/**
 * Create new permission
 */
export const createPermissionService = async (
  resource,
  action,
  description,
  req
) => {
  if (!resource || !action) {
    throw new Error('resource and action are required');
  }

  const validActions = ['create', 'read', 'update', 'delete'];
  const normalizedAction = action.toLowerCase();

  if (!validActions.includes(normalizedAction)) {
    throw new Error(`action must be one of: ${validActions.join(', ')}`);
  }

  // Check if permission already exists
  const existingPermission = await Permission.findOne({
    resource: resource.toLowerCase(),
    action: normalizedAction,
  });

  if (existingPermission) {
    throw new Error('This permission already exists');
  }

  const permission = new Permission({
    name: `${normalizedAction}_${resource.toLowerCase()}`,
    resource: resource.toLowerCase(),
    action: normalizedAction,
    description: description || `${action} ${resource}`,
  });

  await permission.save();

  if (req) {
    await logAdminActivity(
      req,
      'create_permission',
      `Created new permission: ${permission.name}`,
      'permissions',
      permission._id,
      { permission_data: { resource, action, description } }
    );
  }

  return permission;
};

/**
 * Add permission to role
 */
export const addPermissionToRoleService = async (roleId, permissionId, req) => {
  if (!roleId || !permissionId) {
    throw new Error('roleId and permissionId are required');
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  const permission = await Permission.findById(permissionId);
  if (!permission) {
    throw new Error('Permission not found');
  }

  // Check if permission already exists in role
  if (role.permissions.includes(permissionId)) {
    throw new Error('This permission is already assigned to the role');
  }

  role.permissions.push(permissionId);
  await role.save();

  if (req) {
    await logAdminActivity(
      req,
      'add_permission_to_role',
      `Added permission '${permission.name}' to role '${role.name}'`,
      'roles',
      role._id,
      { permission_id: permissionId, permission_name: permission.name }
    );
  }

  const updatedRole = await Role.findById(roleId).populate('permissions');
  return updatedRole;
};

/**
 * Remove permission from role
 */
export const removePermissionFromRoleService = async (
  roleId,
  permissionId,
  req
) => {
  if (!roleId || !permissionId) {
    throw new Error('roleId and permissionId are required');
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  const permission = await Permission.findById(permissionId);
  const permissionName = permission ? permission.name : permissionId;

  // Remove permission
  role.permissions = role.permissions.filter(
    perm => perm.toString() !== permissionId.toString()
  );
  await role.save();

  if (req) {
    await logAdminActivity(
      req,
      'remove_permission_from_role',
      `Removed permission '${permissionName}' from role '${role.name}'`,
      'roles',
      role._id,
      { permission_id: permissionId, permission_name: permissionName }
    );
  }

  const updatedRole = await Role.findById(roleId).populate('permissions');
  return updatedRole;
};
