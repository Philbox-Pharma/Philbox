import sendResponse from '../../../../utils/sendResponse.js';

/**
 * Generic authentication middleware that works for all user roles
 * Checks if the user is authenticated through any role (customer, doctor, salesperson, admin)
 */
export async function authenticateAnyRole(req, res, next) {
  try {
    // Attach user object if already authenticated through role-specific middleware
    if (req.customer || req.doctor || req.salesperson || req.admin) {
      return next();
    }

    // If no authenticated user found, check for fallback methods
    if (
      !req.session ||
      (!req.session.customerId &&
        !req.session.doctorId &&
        !req.session.salespersonId &&
        !req.session.adminId)
    ) {
      return sendResponse(res, 401, 'Unauthorized - Please login first');
    }

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return sendResponse(res, 401, 'Authentication failed');
  }
}
