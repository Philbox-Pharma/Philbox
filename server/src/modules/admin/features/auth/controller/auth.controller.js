import sendResponse from '../../../../../utils/sendResponse.js';
import adminAuthService from '../services/auth.service.js';

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await adminAuthService.login(email, password, req);

    // If 2FA is enabled, store pending admin ID in session
    if (result.isTwoFactorEnabled) {
      req.session.pendingAdminId = result.adminId;
      req.session.pendingEmail = result.email;

      return sendResponse(res, 200, 'OTP sent to your email', {
        email: result.email,
        nextStep: result.nextStep,
        isTwoFactorEnabled: true,
      });
    } else {
      // Direct login without 2FA
      req.session.adminId = result.adminId;
      req.session.adminCategory = result.adminCategory;
      req.session.adminEmail = result.adminEmail;

      return sendResponse(res, 200, 'Login successful', {
        admin: result.admin,
        nextStep: result.nextStep,
        isTwoFactorEnabled: false,
      });
    }
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_EMAIL') {
      return sendResponse(res, 404, 'Invalid email');
    }

    if (err.message === 'INVALID_CREDENTIALS') {
      return sendResponse(res, 401, 'Invalid Credentials');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- VERIFY OTP --------------------------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pendingAdminId = req.session.pendingAdminId;

    const result = await adminAuthService.verifyOTP(
      email,
      otp,
      pendingAdminId,
      req
    );

    // Create actual session
    req.session.adminId = result.adminId;
    req.session.adminCategory = result.adminCategory;
    req.session.adminEmail = result.adminEmail;
    delete req.session.pendingAdminId;

    return sendResponse(res, 200, '2FA Verified', { admin: result.admin });
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_REQUEST') {
      return sendResponse(res, 400, 'Invalid Request');
    }

    if (err.message === 'INVALID_SESSION') {
      return sendResponse(res, 400, 'Invalid session');
    }

    if (err.message === 'INVALID_OR_EXPIRED_OTP') {
      return sendResponse(res, 400, 'Invalid or expired OTP');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const admin = req.admin;

    await adminAuthService.logout(admin, req);

    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
        return sendResponse(res, 500, 'Could not log out');
      }

      res.clearCookie('connect.sid');
      return sendResponse(res, 200, 'Logout successful');
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- FORGET PASSWORD --------------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await adminAuthService.forgetPassword(email, req);

    return sendResponse(res, 200, 'Password reset email sent successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- RESET PASSWORD --------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await adminAuthService.resetPassword(token, newPassword, req);

    return sendResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return sendResponse(res, 400, 'Invalid or expired token');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- UPDATE 2FA SETTINGS --------------------------
export const update2FASettings = async (req, res) => {
  try {
    const { isTwoFactorEnabled } = req.body;
    const adminId = req.session.adminId || req.admin?._id;

    if (!adminId) {
      return sendResponse(res, 401, 'Unauthorized. Please login.');
    }

    const result = await adminAuthService.update2FASettings(
      adminId,
      isTwoFactorEnabled,
      req
    );

    return sendResponse(res, 200, result.message, {
      isTwoFactorEnabled: result.isTwoFactorEnabled,
    });
  } catch (err) {
    console.error(err);

    if (err.message === 'ADMIN_NOT_FOUND') {
      return sendResponse(res, 404, 'Admin not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
