import Doctor from '../../../../../models/Doctor.js';
import DoctorDocuments from '../../../../../models/DoctorDocuments.js';
import DoctorApplication from '../../../../../models/DoctorApplication.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';

class DoctorOnboardingService {
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
   * Get Application Status
   */
  async getApplicationStatus(doctorId, req) {
    try {
      const doctor = await Doctor.findById(doctorId).select(
        'fullName email account_status onboarding_status is_Verified'
      );

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      // Check if they've submitted documents
      const hasDocuments = await DoctorDocuments.findOne({
        doctor_id: doctorId,
      });

      if (!hasDocuments) {
        return {
          status: 'not_submitted',
          message: 'No application submitted yet',
          nextStep: 'submit-application',
          doctor: {
            fullName: doctor.fullName,
            email: doctor.email,
            account_status: doctor.account_status,
            is_Verified: doctor.is_Verified,
          },
        };
      }

      // Get application details
      const application = await DoctorApplication.findOne({
        applications_documents_id: hasDocuments._id,
      })
        .populate({
          path: 'reviewed_by_admin_id',
          select: 'name email',
        })
        .populate({
          path: 'applications_documents_id',
          select: 'CNIC medical_license mbbs_md_degree created_at',
        });

      if (!application) {
        return {
          status: 'not_submitted',
          message: 'No application found',
          nextStep: 'submit-application',
          doctor: {
            fullName: doctor.fullName,
            email: doctor.email,
            account_status: doctor.account_status,
            is_Verified: doctor.is_Verified,
          },
        };
      }

      const nextStep = await this.determineNextStep(doctorId);

      await logDoctorActivity(
        req,
        'check_application_status',
        `Checked application status: ${application.status}`,
        'doctor_applications',
        application._id
      );

      return {
        status: application.status,
        message: this.getStatusMessage(application.status),
        nextStep,
        application: {
          status: application.status,
          admin_comment: application.admin_comment,
          reviewed_at: application.reviewed_at,
          reviewed_by: application.reviewed_by_admin_id,
          submitted_at: application.created_at,
        },
        doctor: {
          fullName: doctor.fullName,
          email: doctor.email,
          account_status: doctor.account_status,
          onboarding_status: doctor.onboarding_status,
          is_Verified: doctor.is_Verified,
        },
      };
    } catch (error) {
      console.error('Error in getApplicationStatus:', error);
      throw error;
    }
  }

  /**
   * Helper to get user-friendly status message
   */
  getStatusMessage(status) {
    const messages = {
      pending:
        'Your application is pending review. We will notify you once an admin reviews your documents.',
      processing:
        'Your application is being processed. Please wait while we verify your credentials.',
      approved:
        'Congratulations! Your application has been approved. You can now complete your profile.',
      rejected:
        'Your application has been rejected. Please review the admin comments and resubmit with correct documents.',
    };
    return messages[status] || 'Application status unknown';
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
          doctor_id: doctorId,
          status: 'pending',
        },
        { upsert: true, new: true }
      );

      // Update doctor status
      await Doctor.findByIdAndUpdate(doctorId, {
        account_status: 'under_consideration',
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
   * Resubmit Application (for rejected applications)
   */
  async resubmitApplication(doctorId, files, req) {
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

      // Check if there's an existing application
      const existingDocs = await DoctorDocuments.findOne({
        doctor_id: doctorId,
      });

      if (!existingDocs) {
        throw new Error('NO_APPLICATION_FOUND');
      }

      const existingApp = await DoctorApplication.findOne({
        applications_documents_id: existingDocs._id,
      });

      if (!existingApp) {
        throw new Error('NO_APPLICATION_FOUND');
      }

      // Check if application was actually rejected
      if (existingApp.status !== 'rejected') {
        throw new Error('APPLICATION_NOT_REJECTED');
      }

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

      // Upload new files to Cloudinary
      const docData = {};

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

      // Update existing documents
      Object.assign(existingDocs, docData);
      await existingDocs.save();

      // Reset application to pending
      existingApp.status = 'pending';
      existingApp.admin_comment = null;
      existingApp.reviewed_by_admin_id = null;
      existingApp.reviewed_at = null;
      existingApp.updated_at = new Date();
      await existingApp.save();

      // Update doctor status
      await Doctor.findByIdAndUpdate(doctorId, {
        account_status: 'under_consideration',
        onboarding_status: 'documents-submitted',
      });

      await logDoctorActivity(
        req,
        'application_resubmit',
        `Resubmitted application with updated documents`,
        'doctors_documents',
        existingDocs._id
      );

      return {
        success: true,
        message:
          'Application resubmitted successfully. Please wait for admin review.',
        documentId: existingDocs._id,
        nextStep: 'waiting-approval',
      };
    } catch (error) {
      console.error('Error in resubmitApplication:', error);
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
}

export default new DoctorOnboardingService();
