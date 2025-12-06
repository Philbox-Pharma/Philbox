import Salesperson from '../../../models/Salesperson.js';
import sendResponse from '../../../utils/sendResponse.js';

/**
 * Middleware to check if a Salesperson is logged in via Session
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Check if session exists and has a salespersonId
    // (Note: In the login controller we set req.session.salespersonId)
    if (!req.session || !req.session.salespersonId) {
      return sendResponse(res, 401, 'No session, authorization denied');
    }

    // 2. Fetch salesperson from database
    const salesperson = await Salesperson.findById(
      req.session.salespersonId
    ).select('-passwordHash');

    if (!salesperson) {
      req.session.destroy();
      return sendResponse(res, 401, 'Salesperson account not found');
    }

    // 3. Security Check: Block if account is suspended or blocked
    // (Based on your schema enums: 'active', 'suspended', 'blocked')
    if (
      salesperson.status === 'blocked' ||
      salesperson.status === 'suspended'
    ) {
      req.session.destroy();
      return sendResponse(
        res,
        403,
        'Your account has been blocked or suspended.'
      );
    }

    // 4. Attach salesperson to req
    req.salesperson = salesperson;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return sendResponse(res, 401, 'Session is not valid');
  }
}
