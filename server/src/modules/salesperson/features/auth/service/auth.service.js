import Salesperson from '../../../../../models/Salesperson.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendResetEmail } from '../../../../../utils/sendEmail.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import { ROUTES } from '../../../../../constants/global.routes.constants.js';

class SalespersonAuthService {
  /**
   * Login Salesperson
   * Note: Salespersons do not have OTP in the schema provided,
   * so this goes directly to dashboard.
   * Next Step: dashboard
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

    // ✅ Log Fix: Manually attach salesperson to req for logger
    req.salesperson = salesperson;

    await logSalespersonActivity(
      req,
      'login',
      `Salesperson logged in`,
      'salespersons',
      salesperson._id
    );

    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...safeSalesperson } = salesperson.toObject();

    return {
      salespersonId: salesperson._id.toString(),
      status: salesperson.status,
      salesperson: safeSalesperson,
      nextStep: 'dashboard', // <--- Direct to dashboard
    };
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
}

export default new SalespersonAuthService();
