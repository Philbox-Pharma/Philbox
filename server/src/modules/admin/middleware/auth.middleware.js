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

    // Attach admin to request
    req.admin = {
      _id: admin._id,
      id: admin._id,
      category: admin.category,
      email: admin.email,
      name: admin.name,
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
