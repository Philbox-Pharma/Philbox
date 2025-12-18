import Doctor from '../../../../../models/Doctor.js';
import DoctorApplication from '../../../../../models/DoctorApplication.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import { paginate } from '../../../../../utils/paginate.js';
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from '../../../../../utils/sendEmail.js';

class DoctorManagementService {
  /**
   * Get All Doctor Applications
   */
  async getDoctorApplications(query, req) {
    try {
      const { page = 1, limit = 10, search, status = 'pending' } = query;

      // Build query filter
      const filter = {};
      if (status) {
        filter.status = status;
      }

      // Apply search if provided
      if (search) {
        const doctors = await Doctor.find({
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');

        const doctorIds = doctors.map(d => d._id);
        filter.doctor_id = { $in: doctorIds };
      }

      const populate = [
        {
          path: 'doctor_id',
          select:
            'fullName email contactNumber profile_img_url account_status created_at',
        },
        {
          path: 'applications_documents_id',
          select:
            'CNIC medical_license specialist_license mbbs_md_degree experience_letters',
        },
        {
          path: 'reviewed_by_admin_id',
          select: 'name email',
        },
      ];

      const result = await paginate(
        DoctorApplication,
        filter,
        page,
        limit,
        populate,
        { created_at: -1 }
      );

      // Log admin activity
      await logAdminActivity(
        req,
        'view_doctor_applications',
        `Viewed doctor applications list (status: ${status}, page: ${page})`,
        'doctor_applications',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getDoctorApplications:', error);
      throw error;
    }
  }

  /**
   * Get Single Doctor Application by ID
   */
  async getDoctorApplicationById(applicationId, req) {
    try {
      const application = await DoctorApplication.findById(applicationId)
        .populate({
          path: 'doctor_id',
          select:
            'fullName email contactNumber gender dateOfBirth profile_img_url account_status license_number created_at',
        })
        .populate({
          path: 'applications_documents_id',
          select:
            'CNIC medical_license specialist_license mbbs_md_degree experience_letters created_at',
        })
        .populate({
          path: 'reviewed_by_admin_id',
          select: 'name email profile_img',
        });

      if (!application) {
        throw new Error('APPLICATION_NOT_FOUND');
      }

      // Log admin activity
      await logAdminActivity(
        req,
        'view_doctor_application',
        `Viewed doctor application for ${application.doctor_id?.email || 'unknown'}`,
        'doctor_applications',
        application._id
      );

      return application;
    } catch (error) {
      console.error('Error in getDoctorApplicationById:', error);
      throw error;
    }
  }

  /**
   * Approve Doctor Application
   */
  async approveDoctorApplication(applicationId, adminComment, adminId, req) {
    try {
      const application =
        await DoctorApplication.findById(applicationId).populate('doctor_id');

      if (!application) {
        throw new Error('APPLICATION_NOT_FOUND');
      }

      if (application.status === 'approved') {
        throw new Error('ALREADY_APPROVED');
      }

      // Update application status
      application.status = 'approved';
      application.admin_comment = adminComment || 'Application approved';
      application.reviewed_by_admin_id = adminId;
      application.reviewed_at = new Date();
      await application.save();

      // Update doctor account status to active
      const doctor = await Doctor.findByIdAndUpdate(
        application.doctor_id._id,
        {
          account_status: 'active',
          onboarding_status: 'approved',
        },
        { new: true }
      ).select('-passwordHash');

      // Send approval email
      const loginLink = `${process.env.FRONTEND_URL}/doctor/auth/login`;
      await sendApplicationApprovedEmail(
        doctor.email,
        doctor.fullName,
        application.admin_comment,
        loginLink
      );

      // Log admin activity
      await logAdminActivity(
        req,
        'approve_doctor_application',
        `Approved doctor application for ${doctor.email}`,
        'doctor_applications',
        application._id
      );

      return {
        application,
        doctor,
        message: 'Application approved successfully',
      };
    } catch (error) {
      console.error('Error in approveDoctorApplication:', error);
      throw error;
    }
  }

  /**
   * Reject Doctor Application
   */
  async rejectDoctorApplication(applicationId, reason, adminId, req) {
    try {
      const application =
        await DoctorApplication.findById(applicationId).populate('doctor_id');

      if (!application) {
        throw new Error('APPLICATION_NOT_FOUND');
      }

      if (application.status === 'approved') {
        throw new Error('CANNOT_REJECT_APPROVED');
      }

      // Update application status
      application.status = 'rejected';
      application.admin_comment = reason || 'Application rejected';
      application.reviewed_by_admin_id = adminId;
      application.reviewed_at = new Date();
      await application.save();

      // Update doctor account status
      const doctor = await Doctor.findByIdAndUpdate(
        application.doctor_id._id,
        {
          account_status: 'suspended/freezed',
          onboarding_status: 'rejected',
        },
        { new: true }
      ).select('-passwordHash');

      // Send rejection email
      const supportLink = `${process.env.FRONTEND_URL}/contact-support`;
      await sendApplicationRejectedEmail(
        doctor.email,
        doctor.fullName,
        application.admin_comment,
        supportLink
      );

      // Log admin activity
      await logAdminActivity(
        req,
        'reject_doctor_application',
        `Rejected doctor application for ${doctor.email}`,
        'doctor_applications',
        application._id
      );

      return {
        application,
        doctor,
        message: 'Application rejected',
      };
    } catch (error) {
      console.error('Error in rejectDoctorApplication:', error);
      throw error;
    }
  }
}

export default new DoctorManagementService();
