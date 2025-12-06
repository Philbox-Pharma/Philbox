import sendResponse from '../../../../../utils/sendResponse.js';
import salespersonAuthService from '../service/auth.service.js';

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await salespersonAuthService.login(email, password, req);

    // Create Session
    req.session.salespersonId = result.salespersonId;
    req.session.role = 'salesperson';
    req.session.status = result.status;

    return sendResponse(res, 200, 'Login successful', {
      salesperson: result.salesperson,
      nextStep: result.nextStep,
    });
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_CREDENTIALS') {
      return sendResponse(res, 401, 'Invalid Credentials');
    }
    if (err.message === 'ACCOUNT_SUSPENDED') {
      return sendResponse(
        res,
        403,
        'Your account is suspended. Contact Admin.'
      );
    }
    if (err.message === 'ACCOUNT_BLOCKED') {
      return sendResponse(res, 403, 'Your account is blocked.');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- FORGET PASSWORD --------------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await salespersonAuthService.forgetPassword(email, req);

    return sendResponse(res, 200, 'Password reset email sent successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, 'User not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- RESET PASSWORD --------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await salespersonAuthService.resetPassword(token, newPassword, req);

    return sendResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return sendResponse(res, 400, 'Invalid or expired token');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const salesperson = req.salesperson;

    const data = await salespersonAuthService.logout(salesperson, req);

    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
        return sendResponse(res, 500, 'Could not log out');
      }

      res.clearCookie('connect.sid');
      return sendResponse(res, 200, 'Logout successful', data);
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
