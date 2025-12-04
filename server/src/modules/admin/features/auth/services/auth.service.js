import Admin from '../../../../../models/Admin.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateOTPAndExpiryDate } from '../../../../../utils/generateOTP.js';
import { sendOTP, sendResetEmail } from '../../../../../utils/sendEmail.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class AdminAuthService {
  /**
   * Authenticate admin and send OTP
   */
  async login(email, password, req) {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new Error('INVALID_EMAIL');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate and send OTP
    const { otp, expiresIn } = generateOTPAndExpiryDate();
    admin.otpCode = otp;
    admin.otpExpiresAt = expiresIn;
    await admin.save();
    await sendOTP(admin.email, otp, 'Admin');

    // Return admin ID to store in session
    return {
      adminId: admin._id.toString(),
      email: admin.email,
    };
  }

  /**
   * Verify OTP and complete login
   */
  async verifyOTP(email, otp, pendingAdminId, req) {
    const admin = await Admin.findOne({ email }).select('-password');

    if (!admin || !admin.otpCode) {
      throw new Error('INVALID_REQUEST');
    }

    // Verify the admin matches the pending session
    if (!pendingAdminId || pendingAdminId !== admin._id.toString()) {
      throw new Error('INVALID_SESSION');
    }

    // Verify OTP
    if (admin.otpCode !== otp || admin.otpExpiresAt < Date.now()) {
      throw new Error('INVALID_OR_EXPIRED_OTP');
    }

    // Clear OTP after verification
    admin.otpCode = null;
    admin.otpExpiresAt = null;
    await admin.save();

    // ✅ FIX: Manually attach admin to req so logger can find it
    req.admin = admin;

    // Log activity
    await logAdminActivity(
      req,
      'verify_otp',
      `Admin (${admin.email}) verified OTP successfully`,
      'admins',
      admin._id
    );

    // Return session data
    const { password: _, ...safeAdmin } = admin.toObject();
    return {
      adminId: admin._id.toString(),
      adminCategory: admin.category,
      adminEmail: admin.email,
      admin: safeAdmin,
    };
  }

  /**
   * Logout admin
   */
  async logout(admin, req) {
    // ✅ Note: Ensure 'authenticate' middleware is used on the logout route
    // If middleware is used, req.admin is already set.
    // If passed explicitly as argument 'admin', we can ensure it's on req:
    if (!req.admin && admin) req.admin = admin;

    await logAdminActivity(
      req,
      'logout',
      `Admin (${admin.email}) logged out successfully`,
      'admins',
      admin._id
    );

    return true;
  }

  /**
   * Request password reset
   */
  async forgetPassword(email, req) {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new Error('ADMIN_NOT_FOUND');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    admin.resetPasswordToken = resetTokenHash;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetEmail(admin.email, resetLink, admin.name, 'Admin');

    // ✅ FIX: Manually attach admin to req
    req.admin = admin;

    // Log activity
    await logAdminActivity(
      req,
      'forget_password',
      `Password reset link sent to ${admin.email}`,
      'admins',
      admin._id
    );

    return {
      email: admin.email,
      name: admin.name,
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword, req) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    // ✅ FIX: Manually attach admin to req
    req.admin = admin;

    // Log activity
    await logAdminActivity(
      req,
      'reset_password',
      `Admin (${admin.email}) reset password successfully`,
      'admins',
      admin._id
    );

    return {
      email: admin.email,
      name: admin.name,
    };
  }
}

export default new AdminAuthService();
