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
import { uploadToCloudinary } from '../../../../utils/uploadToCloudinary.js';
import { ROUTES } from '../../../../constants/global.routes.constants.js';

class DoctorAuthService {
  /**
   * Helper function to determine next step for doctor
   */
  async determineNextStep(doctorId) {
    const doctor = await Doctor.findById(doctorId);

    // Check if they've submitted documents
    const hasDocuments = await DoctorDocuments.findOne({ doctor_id: doctorId });

    if (!hasDocuments) {
      return 'submit-application'; // Need to submit documents first
    }

    // Check if documents are approved
    const application = await DoctorApplication.findOne({
      applications_documents_id: hasDocuments._id,
    });

    if (!application) {
      return 'submit-application';
    }

    if (application.status === 'pending') {
      return 'waiting-approval'; // Documents submitted, waiting for admin
    }

    if (application.status === 'rejected') {
      return 'resubmit-application'; // Documents rejected, need to resubmit
    }

    if (application.status === 'approved') {
      // Check if profile is complete
      if (
        !doctor.educational_details ||
        doctor.educational_details.length === 0
      ) {
        return 'complete-profile'; // Documents approved, now complete profile
      }
      return 'dashboard'; // Everything done
    }

    return 'submit-application'; // Default
  }

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
    });

    await newDoctor.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(
      newDoctor.email,
      verifyLink,
      newDoctor.fullName
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
    const nextStep = await this.determineNextStep(doctor._id);

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
   * Submit Application (Document Upload)
   */
  async submitApplication(doctorId, files, req) {
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      // Validate required files
      const requiredFiles = ['medical_license', 'mbbs_md_degree', 'cnic'];
      const missingFiles = [];

      for (const fileKey of requiredFiles) {
        if (!files[fileKey] || !files[fileKey][0]) {
          missingFiles.push(fileKey.replace(/_/g, ' ').toUpperCase());
        }
      }

      if (missingFiles.length > 0) {
        const error = new Error(
          `MISSING_REQUIRED_FILES: ${missingFiles.join(', ')}`
        );
        error.statusCode = 400;
        error.missingFiles = missingFiles;
        throw error;
      }

      // Check if application already pending
      const existingDocs = await DoctorDocuments.findOne({
        doctor_id: doctorId,
      });
      if (existingDocs) {
        const existingApp = await DoctorApplication.findOne({
          applications_documents_id: existingDocs._id,
        });
        if (existingApp && existingApp.status === 'pending') {
          const error = new Error('ALREADY_SUBMITTED');
          error.statusCode = 400;
          throw error;
        }
      }

      // Upload files to Cloudinary
      const docData = { doctor_id: doctorId };

      if (files['cnic'] && files['cnic'][0]) {
        docData.CNIC = await uploadToCloudinary(
          files['cnic'][0].path,
          'doctor_documents/cnic'
        );
      }

      if (files['medical_license'] && files['medical_license'][0]) {
        docData.medical_license = await uploadToCloudinary(
          files['medical_license'][0].path,
          'doctor_documents/medical_license'
        );
      }

      if (files['specialist_license'] && files['specialist_license'][0]) {
        docData.specialist_license = await uploadToCloudinary(
          files['specialist_license'][0].path,
          'doctor_documents/specialist_license'
        );
      }

      if (files['mbbs_md_degree'] && files['mbbs_md_degree'][0]) {
        docData.mbbs_md_degree = await uploadToCloudinary(
          files['mbbs_md_degree'][0].path,
          'doctor_documents/degrees'
        );
      }

      if (files['experience_letters'] && files['experience_letters'][0]) {
        docData.experience_letters = await uploadToCloudinary(
          files['experience_letters'][0].path,
          'doctor_documents/experience'
        );
      }

      // Save or update documents
      let docs;
      if (existingDocs) {
        Object.assign(existingDocs, docData);
        docs = await existingDocs.save();
      } else {
        docs = await DoctorDocuments.create(docData);
      }

      // Create/Update application
      await DoctorApplication.findOneAndUpdate(
        { applications_documents_id: docs._id },
        {
          applications_documents_id: docs._id,
          status: 'pending',
        },
        { upsert: true, new: true }
      );

      // Update doctor status
      await Doctor.findByIdAndUpdate(doctorId, {
        account_status: 'suspended/freezed',
        onboarding_status: 'documents-submitted',
      });

      await logDoctorActivity(
        req,
        'application_submit',
        `Documents submitted for verification`,
        'doctors_documents',
        docs._id
      );

      return {
        success: true,
        message:
          'Application submitted successfully. Please wait for admin approval.',
        documentId: docs._id,
        nextStep: 'waiting-approval',
      };
    } catch (error) {
      console.error('Error in submitApplication:', error);
      throw error;
    }
  }

  /**
   * Complete Profile (Education, Experience, Specialization)
   */
  async completeProfile(doctorId, profileData, files, req) {
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      // Check if application is approved
      const docRecords = await DoctorDocuments.findOne({ doctor_id: doctorId });
      if (!docRecords) {
        throw new Error('APPLICATION_NOT_APPROVED');
      }

      const application = await DoctorApplication.findOne({
        applications_documents_id: docRecords._id,
      });

      if (!application || application.status !== 'approved') {
        throw new Error('APPLICATION_NOT_APPROVED');
      }

      // Upload profile and cover images
      if (files['profile_img'] && files['profile_img'][0]) {
        profileData.profile_img_url = await uploadToCloudinary(
          files['profile_img'][0].path,
          'doctor_profiles'
        );
      }

      if (files['cover_img'] && files['cover_img'][0]) {
        profileData.cover_img_url = await uploadToCloudinary(
          files['cover_img'][0].path,
          'doctor_covers'
        );
      }

      if (files['digital_signature'] && files['digital_signature'][0]) {
        profileData.digital_signature = await uploadToCloudinary(
          files['digital_signature'][0].path,
          'doctor_signatures'
        );
      }

      // Upload education files
      if (files['education_files'] && files['education_files'].length > 0) {
        for (let i = 0; i < files['education_files'].length; i++) {
          if (profileData.educational_details[i]) {
            profileData.educational_details[i].fileUrl =
              await uploadToCloudinary(
                files['education_files'][i].path,
                'doctor_education'
              );
          }
        }
      }

      // Upload experience institution images
      if (files['experience_files'] && files['experience_files'].length > 0) {
        for (let i = 0; i < files['experience_files'].length; i++) {
          if (profileData.experience_details[i]) {
            profileData.experience_details[i].institution_img_url =
              await uploadToCloudinary(
                files['experience_files'][i].path,
                'doctor_experience'
              );
          }
        }
      }

      // Update doctor with profile data
      await Doctor.findByIdAndUpdate(doctorId, {
        ...profileData,
        account_status: 'active',
        onboarding_status: 'completed',
      });

      await logDoctorActivity(
        req,
        'profile_complete',
        `Doctor completed profile setup`,
        'doctors',
        doctorId
      );

      return {
        success: true,
        message: 'Profile completed successfully. Welcome to PhilBox!',
        nextStep: 'dashboard',
      };
    } catch (error) {
      console.error('Error in completeProfile:', error);
      throw error;
    }
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
    await sendDoctorResetEmail(doctor.email, resetLink, doctor.fullName);

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
    const nextStep = await this.determineNextStep(doctor._id);

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
