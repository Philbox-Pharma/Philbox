import sendResponse from '../../../../../utils/sendResponse.js';
import customerAuthService from '../service/auth.service.js';
import passport from '../config/passport.config.js';

// ------------------------- REGISTER --------------------------
export const register = async (req, res) => {
  try {
    const result = await customerAuthService.register(req.body, req);
    return sendResponse(
      res,
      201,
      'Registration successful. Please verify your email.',
      result
    );
  } catch (err) {
    if (err.message === 'EMAIL_ALREADY_EXISTS') {
      return sendResponse(res, 409, 'Email already exists');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- VERIFY EMAIL --------------------------
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    await customerAuthService.verifyEmail(token, req);
    return sendResponse(res, 200, 'Email verified successfully. Please login.');
  } catch (err) {
    if (err.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return sendResponse(res, 400, 'Invalid or expired verification token');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await customerAuthService.login(email, password, req);

    // Create session
    req.session.customerId = result.customerId;
    req.session.role = 'customer';
    req.session.status = result.accountStatus;

    return sendResponse(res, 200, 'Login successful', {
      customer: result.customer,
      accountStatus: result.accountStatus,
    });
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS')
      return sendResponse(res, 401, 'Invalid Credentials');
    if (err.message === 'EMAIL_NOT_VERIFIED')
      return sendResponse(res, 403, 'Please verify your email first');
    if (err.message === 'ACCOUNT_BLOCKED')
      return sendResponse(
        res,
        403,
        'Your account has been blocked or suspended'
      );
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- GOOGLE OAUTH --------------------------
export const googleAuth = passport.authenticate('customer-google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = async (req, res) => {
  try {
    const result = await customerAuthService.oauthLogin(req.user, req);

    req.session.customerId = result.customerId;
    req.session.role = 'customer';
    req.session.status = result.accountStatus;

    // Redirect to frontend
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/oauth/success?role=customer&isNewUser=${result.isNewUser}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/oauth/error?message=${encodeURIComponent(err.message)}`;
    return res.redirect(errorUrl);
  }
};

// ------------------------- PASSWORD MANAGEMENT --------------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await customerAuthService.forgetPassword(email, req);
    return sendResponse(res, 200, 'Password reset email sent');
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND')
      return sendResponse(res, 404, 'User not found');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await customerAuthService.resetPassword(token, newPassword, req);
    return sendResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    if (err.message === 'INVALID_OR_EXPIRED_TOKEN')
      return sendResponse(res, 400, 'Invalid token');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- CURRENT USER --------------------------
export const getMe = async (req, res) => {
  return sendResponse(res, 200, 'Current user fetched', req.customer);
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const customer = req.customer;
    await customerAuthService.logout(customer, req);

    req.session.destroy(err => {
      if (err) return sendResponse(res, 500, 'Could not log out');
      res.clearCookie('connect.sid');
      return sendResponse(res, 200, 'Logout successful');
    });
  } catch (err) {
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
