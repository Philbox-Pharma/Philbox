import Admin from '../../../models/Admin.js';
import sendResponse from '../../../utils/sendResponse.js';

export async function authenticate(req, res, next) {
  try {
    // Check if session exists
    if (!req.session || !req.session.adminId) {
      return sendResponse(res, 401, 'No session, authorization denied');
    }

    // Fetch admin from database
    const admin = await Admin.findById(req.session.adminId).select('-password');

    if (!admin) {
      return sendResponse(res, 401, 'Admin not found');
    }

    // Security Check: Block if account is suspended or blocked
    // (Super-admins don't have status field, so only check for branch-admins)
    if (
      admin.status &&
      (admin.status === 'blocked' || admin.status === 'suspended')
    ) {
      req.session.destroy();
      return sendResponse(
        res,
        403,
        'Your account has been blocked or suspended.'
      );
    }

    // Attach admin to request with roleId for RBAC
    req.admin = {
      _id: admin._id,
      id: admin._id,
      category: admin.category,
      email: admin.email,
      name: admin.name,
      roleId: admin.roleId, // 🔐 RBAC - Include roleId for middleware
    };

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return sendResponse(res, 401, 'Session is not valid');
  }
}

export async function isSuperAdmin(req, res, next) {
  if (!req.admin) {
    return sendResponse(res, 401, 'Not Authenticated');
  }

  if (req.admin.category !== 'super-admin') {
    return sendResponse(res, 403, 'Access denied: Super-admin only');
  }

  next();
}
