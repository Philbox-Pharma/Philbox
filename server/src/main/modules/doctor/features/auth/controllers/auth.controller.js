import sendResponse from '../../../../../utils/sendResponse.js';
import doctorAuthService from '../service/auth.service.js';
import passport from '../config/passport.config.js';

// ------------------------- REGISTER --------------------------
export const register = async (req, res) => {
  try {
    const result = await doctorAuthService.register(req.body, req);
    return sendResponse(
      res,
      201,
      'Registration successful. Please verify your email.',
      { nextStep: result.nextStep }
    );
  } catch (err) {
    console.error(err);
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
    const result = await doctorAuthService.verifyEmail(token, req);
    return sendResponse(
      res,
      200,
      'Email verified successfully. You can now login.',
      { nextStep: result.nextStep }
    );
  } catch (err) {
    console.error(err);
    if (err.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return sendResponse(res, 400, 'Invalid or expired verification token');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- FORGET PASSWORD --------------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await doctorAuthService.forgetPassword(email, req);
    return sendResponse(res, 200, 'Password reset email sent', {
      nextStep: result.nextStep,
    });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND')
      return sendResponse(res, 404, 'User not found');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- RESET PASSWORD --------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await doctorAuthService.resetPassword(
      token,
      newPassword,
      req
    );
    return sendResponse(res, 200, 'Password reset successfully', {
      nextStep: result.nextStep,
    });
  } catch (err) {
    if (err.message === 'INVALID_OR_EXPIRED_TOKEN')
      return sendResponse(res, 400, 'Invalid token');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- GET ME --------------------------
export const getMe = async (req, res) => {
  return sendResponse(res, 200, 'Current doctor fetched', req.doctor);
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const doctor = req.doctor;
    const result = await doctorAuthService.logout(doctor, req);

    req.session.destroy(err => {
      if (err) return sendResponse(res, 500, 'Could not log out');
      res.clearCookie('connect.sid');
      return sendResponse(res, 200, 'Logout successful', {
        nextStep: result.nextStep,
      });
    });
  } catch (err) {
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await doctorAuthService.login(email, password, req);

    // Create session
    req.session.doctorId = result.doctorId;
    req.session.role = 'doctor';
    req.session.status = result.accountStatus;

    return sendResponse(res, 200, 'Login successful', {
      doctor: result.doctor,
      accountStatus: result.accountStatus,
      nextStep: result.nextStep, // 'submit-application' or 'complete-profile' or 'dashboard'
    });
  } catch (err) {
    console.error(err);
    if (err.message === 'INVALID_CREDENTIALS')
      return sendResponse(res, 401, 'Invalid Credentials');
    if (err.message === 'EMAIL_NOT_VERIFIED')
      return sendResponse(res, 403, 'Please verify your email first');
    if (err.message === 'ACCOUNT_BLOCKED')
      return sendResponse(res, 403, 'Your account has been blocked');

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

export const googleAuth = passport.authenticate('doctor-google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = async (req, res) => {
  try {
    // Passport adds user to req after successful authentication
    const result = await doctorAuthService.oauthLogin(req.user, req);

    // Create session
    req.session.doctorId = result.doctorId;
    req.session.role = 'doctor';
    req.session.status = result.accountStatus;

    // Redirect to frontend with success
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/oauth/success?nextStep=${result.nextStep}&isNewUser=${result.isNewUser}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth Error:', err);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/oauth/error?message=${encodeURIComponent(err.message)}`;
    return res.redirect(errorUrl);
  }
};
