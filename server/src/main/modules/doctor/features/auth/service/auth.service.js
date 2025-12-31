import Doctor from '../../../../../models/Doctor.js';
import Role from '../../../../../models/Role.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendVerificationEmail,
  sendResetEmail,
} from '../../../../../utils/sendEmail.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import { ROUTES } from '../../../../../constants/global.routes.constants.js';
import doctorOnboardingService from '../../onboarding/service/onboarding.service.js';

class DoctorAuthService {
  /**
   * Register a new Doctor
   */
  async register(data, req) {
    const { fullName, email, password, gender, dateOfBirth, contactNumber } =
      data;

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    // 🔐 RBAC - Fetch doctor role and assign to new user
    const doctorRole = await Role.findOne({ name: 'doctor' });
    if (!doctorRole) {
      throw new Error('DOCTOR_ROLE_NOT_FOUND');
    }

    const newDoctor = new Doctor({
      fullName,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      contactNumber,
      gender,
      dateOfBirth,
      verificationToken,
      verificationTokenExpiresAt,
      is_Verified: false,
      account_status: 'suspended/freezed',
      onboarding_status: 'pending',
      roleId: doctorRole._id, // 🔐 RBAC - Assign doctor role
    });

    await newDoctor.save();

    const verifyLink = `${process.env.FRONTEND_URL}/doctor/auth/verify-email/${verificationToken}`;
    await sendVerificationEmail(
      newDoctor.email,
      verifyLink,
      newDoctor.fullName,
      'Doctor'
    );

    req.doctor = {
      _id: newDoctor._id,
      email: newDoctor.email,
      fullName: newDoctor.fullName,
    };

    await logDoctorActivity(
      req,
      'register',
      `Doctor registered: ${email}`,
      'doctors',
      newDoctor._id
    );

    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...safeDoctor } = newDoctor.toObject();
    return {
      doctor: safeDoctor,
      nextStep: 'verify-email',
    };
  }

  /**
   * Verify Email Address
   */
  async verifyEmail(token, req) {
    const doctor = await Doctor.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!doctor) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    doctor.is_Verified = true;
    doctor.verificationToken = undefined;
    doctor.verificationTokenExpiresAt = undefined;
    await doctor.save();

    req.doctor = {
      _id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
    };

    await logDoctorActivity(
      req,
      'verify_email',
      `Email verified for ${doctor.email}`,
      'doctors',
      doctor._id
    );

    return {
      nextStep: 'login',
    };
  }

  /**
   * Login Doctor
   */
  async login(email, password, req) {
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    if (!doctor) throw new Error('INVALID_CREDENTIALS');

    const isMatch = await bcrypt.compare(password, doctor.passwordHash);
    if (!isMatch) throw new Error('INVALID_CREDENTIALS');

    if (!doctor.is_Verified) throw new Error('EMAIL_NOT_VERIFIED');

    if (doctor.account_status === 'blocked/removed') {
      throw new Error('ACCOUNT_BLOCKED');
    }

    doctor.last_login = Date.now();
    await doctor.save();

    req.doctor = {
      _id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
    };

    await logDoctorActivity(
      req,
      'login',
      `Doctor logged in`,
      'doctors',
      doctor._id
    );

    // Determine next step
    const nextStep = await doctorOnboardingService.determineNextStep(
      doctor._id
    );

    const safeDoctor = doctor.toObject();
    delete safeDoctor.passwordHash;

    return {
      doctorId: doctor._id.toString(),
      accountStatus: doctor.account_status,
      doctor: safeDoctor,
      nextStep,
    };
  }

  /**
   * Forget Password
   */
  async forgetPassword(email, req) {
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (!doctor) throw new Error('USER_NOT_FOUND');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    doctor.resetPasswordToken = resetTokenHash;
    doctor.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000;
    await doctor.save();

    const resetLink = `${process.env.FRONTEND_URL}/${ROUTES.DOCTOR_AUTH}/reset-password/${resetToken}`;
    await sendResetEmail(doctor.email, resetLink, doctor.fullName, 'Doctor');

    req.doctor = {
      _id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
    };

    await logDoctorActivity(
      req,
      'forget_password',
      `Reset link requested`,
      'doctors',
      doctor._id
    );

    return {
      nextStep: 'check-email',
    };
  }

  /**
   * Reset Password
   */
  async resetPassword(token, newPassword, req) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const doctor = await Doctor.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!doctor) throw new Error('INVALID_OR_EXPIRED_TOKEN');

    doctor.passwordHash = await bcrypt.hash(newPassword, 10);
    doctor.resetPasswordToken = undefined;
    doctor.resetPasswordExpiresAt = undefined;
    await doctor.save();

    req.doctor = {
      _id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
    };

    await logDoctorActivity(
      req,
      'reset_password',
      `Password reset successful`,
      'doctors',
      doctor._id
    );

    return {
      nextStep: 'login',
    };
  }

  async logout(doctor, req) {
    await logDoctorActivity(
      req,
      'logout',
      `Doctor logged out`,
      'doctors',
      doctor._id
    );

    return {
      nextStep: 'login',
    };
  }

  async oauthLogin(doctorData, req) {
    const doctor = await Doctor.findById(doctorData._id);

    if (!doctor) throw new Error('DOCTOR_NOT_FOUND');

    // Check account status
    if (doctor.account_status === 'blocked/removed') {
      throw new Error('ACCOUNT_BLOCKED');
    }

    doctor.last_login = Date.now();
    await doctor.save();

    req.doctor = {
      _id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
    };

    await logDoctorActivity(
      req,
      'oauth_login',
      `Doctor logged in via ${doctor.oauth_provider}`,
      'doctors',
      doctor._id
    );

    // Determine next step
    const nextStep = await doctorOnboardingService.determineNextStep(
      doctor._id
    );

    const safeDoctor = doctor.toObject();
    delete safeDoctor.passwordHash;

    return {
      doctorId: doctor._id.toString(),
      accountStatus: doctor.account_status,
      doctor: safeDoctor,
      nextStep,
      isNewUser: doctor.created_at > Date.now() - 60000, // Created in last minute
    };
  }
}

export default new DoctorAuthService();
