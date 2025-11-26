import Admin from '../../../../../models/Admin.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendResponse from '../../../../../utils/sendResponse.js';
import dotenv from 'dotenv';
import { generateOTPAndExpiryDate } from '../../../../../utils/generateOTP.js';
import { sendOTP, sendResetEmail } from '../../../../../utils/sendEmail.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

dotenv.config();

// ------------------------- LOGIN --------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return sendResponse(res, 404, 'Invalid email');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return sendResponse(res, 401, 'Invalid Credentials');

    // ✅ Always send OTP for super admin (no check for isTwoFactorEnabled)
    const { otp, expiresIn } = generateOTPAndExpiryDate();
    admin.otpCode = otp;
    admin.otpExpiresAt = expiresIn;
    await admin.save();
    await sendOTP(admin.email, otp);

    // Store pending admin info in session for OTP verification
    req.session.pendingAdminId = admin._id.toString();

    return sendResponse(res, 200, 'OTP sent to email');
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- VERIFY OTP --------------------------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email }).select('-password');
    if (!admin || !admin.otpCode)
      return sendResponse(res, 400, 'Invalid Request');

    // Verify the admin matches the pending session
    if (
      !req.session.pendingAdminId ||
      req.session.pendingAdminId !== admin._id.toString()
    ) {
      return sendResponse(res, 400, 'Invalid session');
    }

    if (admin.otpCode !== otp || admin.otpExpiresAt < Date.now()) {
      return sendResponse(res, 400, 'Invalid or expired OTP');
    }

    // ✅ Clear OTP after verification
    admin.otpCode = null;
    admin.otpExpiresAt = null;
    await admin.save();

    // Create actual session
    req.session.adminId = admin._id.toString();
    req.session.adminCategory = admin.category;
    req.session.adminEmail = admin.email;
    delete req.session.pendingAdminId;

    await logAdminActivity(
      { user: admin, ip: req.ip, headers: req.headers },
      'verify_otp',
      `Admin (${admin.email}) verified OTP successfully`,
      'admins',
      admin._id
    );

    const { password: _, ...safe } = admin.toObject();
    return sendResponse(res, 200, '2FA Verified', { admin: safe });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- LOGOUT --------------------------
export const logout = async (req, res) => {
  try {
    const admin = req.admin;

    await logAdminActivity(
      { user: admin, ip: req.ip, headers: req.headers },
      'logout',
      `Admin (${admin.email}) logged out successfully`,
      'admins',
      admin._id
    );

    // ✅ Just destroy session - no need to modify admin document
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
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return sendResponse(res, 404, 'Admin not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    admin.resetPasswordToken = resetTokenHash;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetEmail(admin.email, resetLink, admin.name);

    await logAdminActivity(
      { user: admin, ip: req.ip, headers: req.headers },
      'forget_password',
      `Password reset link sent to ${admin.email}`,
      'admins',
      admin._id
    );

    return sendResponse(res, 200, 'Password reset email sent successfully');
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ------------------------- RESET PASSWORD --------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) return sendResponse(res, 400, 'Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    await logAdminActivity(
      { user: admin, ip: req.ip, headers: req.headers },
      'reset_password',
      `Admin (${admin.email}) reset password successfully`,
      'admins',
      admin._id
    );

    return sendResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
