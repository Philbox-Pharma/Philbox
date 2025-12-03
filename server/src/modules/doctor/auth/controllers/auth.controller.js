import sendResponse from '../../../../utils/sendResponse.js';
import doctorAuthService from '../service/auth.service.js';

// ------------------------- REGISTER --------------------------
export const register = async (req, res) => {
  try {
    const result = await doctorAuthService.register(req.body, req);
    return sendResponse(
      res,
      201,
      'Registration successful. Please verify your email.'
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
    await doctorAuthService.verifyEmail(token, req);
    return sendResponse(
      res,
      200,
      'Email verified successfully. You can now login.'
    );
  } catch (err) {
    console.error(err);
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
    const result = await doctorAuthService.login(email, password, req);

    // Create session
    req.session.doctorId = result.doctorId;
    req.session.role = 'doctor';
    req.session.status = result.accountStatus;

    // Check if onboarding is required (Logic: if status is not active, they might need to upload docs)
    const requiresOnboarding = result.onboardingStatus === 'pending';

    return sendResponse(res, 200, 'Login successful', {
      doctor: result.doctor,
      requiresOnboarding,
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

// ------------------------- ONBOARDING (DOCS SUBMISSION) --------------------------
export const submitOnboarding = async (req, res) => {
  try {
    // req.files contains the uploaded file info (from multer)
    if (!req.files || Object.keys(req.files).length === 0) {
      return sendResponse(res, 400, 'No documents uploaded');
    }

    const doctorId = req.doctor._id; // Retrieved from authenticate middleware

    await doctorAuthService.submitOnboarding(doctorId, req.files, req);

    return sendResponse(
      res,
      200,
      'Documents submitted successfully. Waiting for Admin Approval.'
    );
  } catch (err) {
    console.error(err);
    if (err.message === 'ALREADY_SUBMITTED') {
      return sendResponse(res, 400, 'Application already under review');
    }
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const doctor = req.doctor;
    await doctorAuthService.logout(doctor, req);

    req.session.destroy(err => {
      if (err) return sendResponse(res, 500, 'Could not log out');
      res.clearCookie('connect.sid');
      return sendResponse(res, 200, 'Logout successful');
    });
  } catch (err) {
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- FORGET PASSWORD --------------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await doctorAuthService.forgetPassword(email, req);
    return sendResponse(res, 200, 'Password reset email sent');
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
    await doctorAuthService.resetPassword(token, newPassword, req);
    return sendResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    if (err.message === 'INVALID_OR_EXPIRED_TOKEN')
      return sendResponse(res, 400, 'Invalid token');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
