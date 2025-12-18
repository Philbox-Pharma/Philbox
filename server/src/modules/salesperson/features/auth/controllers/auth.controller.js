import sendResponse from '../../../../../utils/sendResponse.js';
import salespersonAuthService from '../service/auth.service.js';

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await salespersonAuthService.login(email, password, req);

    // If 2FA is enabled, store pending salesperson ID in session
    if (result.isTwoFactorEnabled) {
      req.session.pendingSalespersonId = result.salespersonId;
      req.session.pendingEmail = result.email;
      req.session.role = 'salesperson';

      return sendResponse(res, 200, 'OTP sent to your email', {
        email: result.email,
        nextStep: result.nextStep,
        isTwoFactorEnabled: true,
      });
    } else {
      // Direct login without 2FA
      req.session.salespersonId = result.salespersonId;
      req.session.role = 'salesperson';
      req.session.status = result.status;

      return sendResponse(res, 200, 'Login successful', {
        salesperson: result.salesperson,
        nextStep: result.nextStep,
        isTwoFactorEnabled: false,
      });
    }
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

// ------------------------- VERIFY OTP --------------------------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pendingSalespersonId = req.session.pendingSalespersonId;

    if (!pendingSalespersonId) {
      return sendResponse(res, 400, 'No pending login. Please login first.');
    }

    const result = await salespersonAuthService.verifyOTP(
      email,
      otp,
      pendingSalespersonId,
      req
    );

    // Clear pending data and set actual session
    delete req.session.pendingSalespersonId;
    delete req.session.pendingEmail;
    req.session.salespersonId = result.salespersonId;
    req.session.role = 'salesperson';
    req.session.status = result.status;

    return sendResponse(res, 200, 'OTP verified successfully', {
      salesperson: result.salesperson,
      nextStep: result.nextStep,
    });
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_REQUEST') {
      return sendResponse(res, 400, 'Invalid request or OTP not found');
    }
    if (err.message === 'INVALID_SESSION') {
      return sendResponse(res, 401, 'Invalid session. Please login again.');
    }
    if (err.message === 'INVALID_OR_EXPIRED_OTP') {
      return sendResponse(res, 401, 'Invalid or expired OTP');
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

// ------------------------- UPDATE 2FA SETTINGS --------------------------
export const update2FASettings = async (req, res) => {
  try {
    const { isTwoFactorEnabled } = req.body;
    const salespersonId = req.session.salespersonId || req.salesperson?._id;

    if (!salespersonId) {
      return sendResponse(res, 401, 'Unauthorized. Please login.');
    }

    const result = await salespersonAuthService.update2FASettings(
      salespersonId,
      isTwoFactorEnabled,
      req
    );

    return sendResponse(res, 200, result.message, {
      isTwoFactorEnabled: result.isTwoFactorEnabled,
    });
  } catch (err) {
    console.error(err);

    if (err.message === 'SALESPERSON_NOT_FOUND') {
      return sendResponse(res, 404, 'Salesperson not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
