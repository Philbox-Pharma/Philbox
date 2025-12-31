import Customer from '../../../models/Customer.js';
import sendResponse from '../../../utils/sendResponse.js';

/**
 * Middleware to check if a Customer is logged in via Session
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Check if session exists and has a customerId
    if (!req.session || !req.session.customerId) {
      return sendResponse(res, 401, 'No session, authorization denied');
    }

    // 2. Fetch customer from database
    const customer = await Customer.findById(req.session.customerId).select(
      '-passwordHash'
    );

    if (!customer) {
      req.session.destroy();
      return sendResponse(res, 401, 'Customer account not found');
    }

    // 3. Security Check: Block if account is suspended or blocked
    if (
      customer.account_status === 'blocked/removed' ||
      customer.account_status === 'suspended/freezed'
    ) {
      req.session.destroy();
      return sendResponse(
        res,
        403,
        'Your account has been blocked or suspended.'
      );
    }

    // 4. Attach customer to req with roleId for RBAC
    req.customer = {
      _id: customer._id,
      id: customer._id,
      email: customer.email,
      fullName: customer.fullName,
      roleId: customer.roleId, // 🔐 RBAC - Include roleId for middleware
    };
    // Also set req.user for RBAC middleware compatibility
    req.user = req.customer;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return sendResponse(res, 401, 'Session is not valid');
  }
}
