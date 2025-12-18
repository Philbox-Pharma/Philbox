/* eslint-disable no-unused-vars */
import Salesperson from '../../../../../models/Salesperson.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateOTPAndExpiryDate } from '../../../../../utils/generateOTP.js';
import { sendOTP, sendResetEmail } from '../../../../../utils/sendEmail.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import { ROUTES } from '../../../../../constants/global.routes.constants.js';

class SalespersonAuthService {
  /**
   * Login Salesperson
   * Conditional 2FA: If isTwoFactorEnabled is true, send OTP
   * Next Step: verify-otp or dashboard
   */
  async login(email, password, req) {
    const salesperson = await Salesperson.findOne({
      email: email.toLowerCase(),
    });

    if (!salesperson) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check Status
    if (salesperson.status === 'suspended')
      throw new Error('ACCOUNT_SUSPENDED');
    if (salesperson.status === 'blocked') throw new Error('ACCOUNT_BLOCKED');

    const isMatch = await bcrypt.compare(password, salesperson.passwordHash);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check if 2FA is enabled for this salesperson
    if (salesperson.isTwoFactorEnabled) {
      // Generate and send OTP
      const { otp, expiresIn } = generateOTPAndExpiryDate();
      salesperson.otpCode = otp;
      salesperson.otpExpiresAt = expiresIn;
      await salesperson.save();

      await sendOTP(
        salesperson.email,
        otp,
        salesperson.fullName,
        'Salesperson'
      );

      // Return salesperson ID to store in session for OTP verification
      return {
        salespersonId: salesperson._id.toString(),
        email: salesperson.email,
        isTwoFactorEnabled: true,
        nextStep: 'verify-otp',
      };
    } else {
      // Direct login without OTP
      req.salesperson = salesperson;

      await logSalespersonActivity(
        req,
        'login',
        `Salesperson logged in without 2FA`,
        'salespersons',
        salesperson._id
      );

      const { passwordHash, ...safeSalesperson } = salesperson.toObject();

      return {
        salespersonId: salesperson._id.toString(),
        status: salesperson.status,
        salesperson: safeSalesperson,
        isTwoFactorEnabled: false,
        nextStep: 'dashboard',
      };
    }
  }

  /**
   * Request password reset
   * Next Step: check-email
   */
  async forgetPassword(email, req) {
    const salesperson = await Salesperson.findOne({
      email: email.toLowerCase(),
    });

    if (!salesperson) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    salesperson.resetPasswordToken = resetTokenHash;
    salesperson.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await salesperson.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/${ROUTES.SALESPERSON_AUTH}/reset-password/${resetToken}`;
    await sendResetEmail(
      salesperson.email,
      resetLink,
      salesperson.fullName,
      'Salesperson'
    );

    // ✅ Log Fix
    req.salesperson = salesperson;

    await logSalespersonActivity(
      req,
      'forget_password',
      `Password reset requested`,
      'salespersons',
      salesperson._id
    );

    return {
      nextStep: 'check-email',
    };
  }

  /**
   * Reset password with token
   * Next Step: login
   */
  async resetPassword(token, newPassword, req) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const salesperson = await Salesperson.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!salesperson) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    salesperson.passwordHash = hashedPassword;
    salesperson.resetPasswordToken = undefined;
    salesperson.resetPasswordExpires = undefined;
    await salesperson.save();

    // ✅ Log Fix
    req.salesperson = salesperson;

    await logSalespersonActivity(
      req,
      'reset_password',
      `Password reset successful`,
      'salespersons',
      salesperson._id
    );

    return {
      nextStep: 'login',
    };
  }

  /**
   * Logout
   * Next Step: login
   */
  async logout(salesperson, req) {
    // ✅ Log Fix
    if (!req.salesperson && salesperson) req.salesperson = salesperson;

    await logSalespersonActivity(
      req,
      'logout',
      `Salesperson logged out`,
      'salespersons',
      salesperson._id
    );

    return {
      nextStep: 'login',
    };
  }

  /**
   * Verify OTP and complete login
   * Next Step: dashboard
   */
  async verifyOTP(email, otp, pendingSalespersonId, req) {
    const salesperson = await Salesperson.findOne({ email }).select(
      '-passwordHash'
    );

    if (!salesperson || !salesperson.otpCode) {
      throw new Error('INVALID_REQUEST');
    }

    // Verify the salesperson matches the pending session
    if (
      !pendingSalespersonId ||
      pendingSalespersonId !== salesperson._id.toString()
    ) {
      throw new Error('INVALID_SESSION');
    }

    // Verify OTP
    if (salesperson.otpCode !== otp || salesperson.otpExpiresAt < Date.now()) {
      throw new Error('INVALID_OR_EXPIRED_OTP');
    }

    // Clear OTP after verification
    salesperson.otpCode = null;
    salesperson.otpExpiresAt = null;
    await salesperson.save();

    // Attach salesperson to req
    req.salesperson = salesperson;

    // Log activity
    await logSalespersonActivity(
      req,
      'verify_otp',
      `Salesperson (${salesperson.email}) verified OTP successfully`,
      'salespersons',
      salesperson._id
    );

    // Return session data
    const { passwordHash, ...safeSalesperson } = salesperson.toObject();

    return {
      salespersonId: salesperson._id.toString(),
      status: salesperson.status,
      salesperson: safeSalesperson,
      nextStep: 'dashboard',
    };
  }

  /**
   * Update Two-Factor Authentication Setting
   */
  async update2FASettings(salespersonId, isTwoFactorEnabled, req) {
    const salesperson = await Salesperson.findById(salespersonId);

    if (!salesperson) {
      throw new Error('SALESPERSON_NOT_FOUND');
    }

    salesperson.isTwoFactorEnabled = isTwoFactorEnabled;
    await salesperson.save();

    // Log activity
    await logSalespersonActivity(
      req,
      'update_2fa_settings',
      `Salesperson (${salesperson.email}) ${isTwoFactorEnabled ? 'enabled' : 'disabled'} two-factor authentication`,
      'salespersons',
      salesperson._id
    );

    return {
      isTwoFactorEnabled: salesperson.isTwoFactorEnabled,
      message: `Two-factor authentication ${isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`,
    };
  }
}

export default new SalespersonAuthService();
