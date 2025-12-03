import Doctor from '../../../../models/Doctor.js';
import DoctorDocuments from '../../../../models/DoctorDocuments.js';
import DoctorApplication from '../../../../models/DoctorApplication.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendVerificationEmail,
  sendDoctorResetEmail,
} from '../../../../utils/sendEmail.js';
import { logDoctorActivity } from '../../utils/logDoctorActivities.js';

class DoctorAuthService {
  /**
   * Register a new Doctor
   */
  // In auth.service.js

  async register(data, req) {
    const { fullName, email, password, gender, dateOfBirth, contactNumber } =
      data;

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

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
      'account-_status': 'suspended/freezed',
      onboarding_status: 'pending',
    });

    await newDoctor.save();

    // Send Verification Email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(
      newDoctor.email,
      verifyLink,
      newDoctor.fullName
    );

    // 👇 FIX: Manually assign the new doctor to req.doctor so the logger can read it
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

    return newDoctor;
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

    await logDoctorActivity(
      req,
      'verify_email',
      `Email verified for ${doctor.email}`,
      'doctors',
      doctor._id
    );
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

    // Check account status (Note: schema has "account-_status")
    if (doctor['account-_status'] === 'blocked/removed') {
      throw new Error('ACCOUNT_BLOCKED');
    }

    doctor.last_login = Date.now();
    await doctor.save();

    await logDoctorActivity(
      req,
      'login',
      `Doctor logged in`,
      'doctors',
      doctor._id
    );

    // Check application status to see if they completed onboarding
    const application = await DoctorApplication.findOne({
      // We need to find the application linked to this doctor via documents
      // This requires an aggregation or a two-step lookup in a real scenario
      // For now, we assume frontend checks if "account-_status" is active
    });

    const safeDoctor = doctor.toObject();
    delete safeDoctor.passwordHash;

    return {
      doctorId: doctor._id.toString(),
      accountStatus: doctor['account-_status'],
      doctor: safeDoctor,
    };
  }

  /**
   * Onboarding: Submit Documents
   */
  async submitOnboarding(doctorId, files, req) {
    // 1. Check if documents already exist/application pending
    const existingDocs = await DoctorDocuments.findOne({ doctor_id: doctorId });
    if (existingDocs) {
      // Logic: If rejected, allow update. If pending, throw error.
      const existingApp = await DoctorApplication.findOne({
        applications_documents_id: existingDocs._id,
      });
      if (existingApp && existingApp.status === 'pending') {
        throw new Error('ALREADY_SUBMITTED');
      }
    }

    // 2. Prepare file URLs (Assuming file upload middleware returns file location/path)
    // Adjust 'files.cnic[0].path' based on your cloud storage response (e.g., S3 URL)
    const docData = {
      doctor_id: doctorId,
      CNIC: files['cnic'] ? files['cnic'][0].path : null,
      medical_license: files['medical_license']
        ? files['medical_license'][0].path
        : null,
      specialist_license: files['specialist_license']
        ? files['specialist_license'][0].path
        : null,
      mbbs_md_degree: files['mbbs_md_degree']
        ? files['mbbs_md_degree'][0].path
        : null,
      experience_letters: files['experience_letters']
        ? files['experience_letters'][0].path
        : null,
    };

    // 3. Save Documents
    let docs;
    if (existingDocs) {
      // Update existing if re-submitting
      Object.assign(existingDocs, docData);
      docs = await existingDocs.save();
    } else {
      docs = await DoctorDocuments.create(docData);
    }

    // 4. Create/Update Application
    const applicationData = {
      applications_documents_id: docs._id,
      status: 'pending', // Send for admin approval
    };

    // Update existing application to pending or create new
    await DoctorApplication.findOneAndUpdate(
      { applications_documents_id: docs._id },
      applicationData,
      { upsert: true, new: true }
    );

    // 5. Update Doctor Status
    // We keep them suspended/freezed until Admin approves
    await Doctor.findByIdAndUpdate(doctorId, {
      'account-_status': 'suspended/freezed',
    });

    await logDoctorActivity(
      req,
      'onboarding_submit',
      `Documents submitted`,
      'doctors_documents',
      docs._id
    );

    return true;
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

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendDoctorResetEmail(doctor.email, resetLink, doctor.fullName);

    await logDoctorActivity(
      req,
      'forget_password',
      `Reset link requested`,
      'doctors',
      doctor._id
    );
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

    await logDoctorActivity(
      req,
      'reset_password',
      `Password reset successful`,
      'doctors',
      doctor._id
    );
  }

  async logout(doctor, req) {
    await logDoctorActivity(
      req,
      'logout',
      `Doctor logged out`,
      'doctors',
      doctor._id
    );
  }
}

export default new DoctorAuthService();
