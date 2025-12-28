import Doctor from '../../../../../models/Doctor.js';
import DoctorApplication from '../../../../../models/DoctorApplication.js';
import Appointment from '../../../../../models/Appointment.js';
import Review from '../../../../../models/Review.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import { paginate } from '../../../../../utils/paginate.js';
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendDoctorStatusUpdateEmail,
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
          select: 'name email profile_img_url',
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

  /**
   * Get All Active Doctors (for management)
   */
  async getAllDoctors(query, req) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        specialization,
        account_status,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = query;

      // Build query filter
      const filter = {};

      // Filter by account status
      if (account_status) {
        filter.account_status = account_status;
      }

      // Filter by specialization
      if (specialization) {
        filter.specialization = { $in: [specialization] };
      }

      // Apply search on name, email, or license number
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { license_number: { $regex: search, $options: 'i' } },
        ];
      }

      // Sorting configuration
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const result = await paginate(
        Doctor,
        filter,
        page,
        limit,
        null, // no populate needed for list view
        sort,
        '-passwordHash -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      );

      // Log admin activity
      await logAdminActivity(
        req,
        'view_doctors_list',
        `Viewed doctors list (page: ${page}, status: ${account_status || 'all'})`,
        'doctors',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getAllDoctors:', error);
      throw error;
    }
  }

  /**
   * Get Single Doctor by ID (with detailed information)
   */
  async getDoctorById(doctorId, req) {
    try {
      const doctor = await Doctor.findById(doctorId)
        .select(
          '-passwordHash -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
        )
        .populate('roleId', 'name');

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Get doctor's performance metrics
      const metrics = await this.getDoctorPerformanceMetrics(doctorId);

      // Log admin activity
      await logAdminActivity(
        req,
        'view_doctor_profile',
        `Viewed doctor profile for ${doctor.email}`,
        'doctors',
        doctor._id
      );

      return {
        doctor,
        metrics,
      };
    } catch (error) {
      console.error('Error in getDoctorById:', error);
      throw error;
    }
  }

  /**
   * Update Doctor Profile
   */
  async updateDoctorProfile(doctorId, updateData, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Update allowed fields
      const allowedUpdates = [
        'specialization',
        'consultation_fee',
        'consultation_type',
        'affiliated_hospital',
        'contactNumber',
      ];

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          doctor[field] = updateData[field];
        }
      });

      await doctor.save();

      // Remove sensitive fields from response
      const updatedDoctor = doctor.toObject();
      delete updatedDoctor.passwordHash;
      delete updatedDoctor.resetPasswordToken;
      delete updatedDoctor.resetPasswordExpiresAt;

      // Log admin activity
      await logAdminActivity(
        req,
        'update_doctor_profile',
        `Updated doctor profile for ${doctor.email}`,
        'doctors',
        doctor._id,
        updateData
      );

      return updatedDoctor;
    } catch (error) {
      console.error('Error in updateDoctorProfile:', error);
      throw error;
    }
  }

  /**
   * Update Doctor Account Status (Suspend/Activate)
   */
  async updateDoctorStatus(doctorId, statusData, adminId, req) {
    try {
      const { status, reason, sendNotification = true } = statusData;

      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      const previousStatus = doctor.account_status;
      doctor.account_status = status;
      await doctor.save();

      // Send notification email if required
      if (sendNotification) {
        const statusMessage =
          status === 'active'
            ? 'Your account has been activated. You can now login and access all features.'
            : `Your account has been ${status === 'suspended/freezed' ? 'suspended' : 'blocked'}. ${reason || ''}`;

        await sendDoctorStatusUpdateEmail(
          doctor.email,
          doctor.fullName,
          status,
          statusMessage
        );
      }

      // Log admin activity
      await logAdminActivity(
        req,
        'update_doctor_status',
        `Changed doctor status from ${previousStatus} to ${status} for ${doctor.email}. Reason: ${reason || 'N/A'}`,
        'doctors',
        doctor._id,
        { previousStatus, newStatus: status, reason }
      );

      return {
        doctor: {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          account_status: doctor.account_status,
        },
        message: `Doctor account ${status === 'active' ? 'activated' : status === 'suspended/freezed' ? 'suspended' : 'blocked'} successfully`,
      };
    } catch (error) {
      console.error('Error in updateDoctorStatus:', error);
      throw error;
    }
  }

  /**
   * Get Doctor Performance Metrics
   */
  async getDoctorPerformanceMetrics(doctorId) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Get reviews count and average rating for doctor
      const doctorReviews = await Review.find({
        target_type: 'doctor',
        target_id: doctorId,
      });

      const totalReviews = doctorReviews.length;
      const averageRating =
        totalReviews > 0
          ? (
              doctorReviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            ).toFixed(2)
          : 0;

      // Get meeting/consultation reviews count (consultations are tracked as 'meeting' in reviews)
      const meetingReviews = await Review.find({
        target_type: 'meeting',
        target_id: doctorId,
      });
      const totalConsultations = meetingReviews.length;

      // Get total appointments from Appointment model
      const totalAppointments = await Appointment.countDocuments({
        doctor_id: doctorId,
        status: { $in: ['completed', 'in-progress'] },
      });

      // Get completed appointments
      const completedAppointments = await Appointment.countDocuments({
        doctor_id: doctorId,
        status: 'completed',
      });

      // Get missed appointments
      const missedAppointments = await Appointment.countDocuments({
        doctor_id: doctorId,
        status: 'missed',
      });

      // Calculate response rate based on appointment requests
      // Response rate = (accepted or cancelled requests / total requests) * 100
      const totalRequests = await Appointment.countDocuments({
        doctor_id: doctorId,
        appointment_request: { $in: ['processing', 'accepted', 'cancelled'] },
      });

      const respondedRequests = await Appointment.countDocuments({
        doctor_id: doctorId,
        appointment_request: { $in: ['accepted', 'cancelled'] },
      });

      const responseRate =
        totalRequests > 0
          ? Math.round((respondedRequests / totalRequests) * 100)
          : 100; // 100% if no requests yet

      // Calculate availability rate based on appointments in last 30 days
      // Availability rate = (days with appointments / 30) * 100
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAppointments = await Appointment.find({
        doctor_id: doctorId,
        created_at: { $gte: thirtyDaysAgo },
      }).select('created_at');

      // Get unique active days
      const activeDays = new Set(
        recentAppointments.map(
          appointment =>
            new Date(appointment.created_at).toISOString().split('T')[0]
        )
      );

      const availabilityRate = Math.round((activeDays.size / 30) * 100);

      // Calculate completion rate
      const completionRate =
        totalAppointments > 0
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0;

      // Calculate no-show rate
      const noShowRate =
        totalAppointments > 0
          ? Math.round((missedAppointments / totalAppointments) * 100)
          : 0;

      return {
        totalReviews,
        averageRating: parseFloat(averageRating),
        totalAppointments,
        completedAppointments,
        missedAppointments,
        totalConsultations,
        responseRate,
        availabilityRate,
        completionRate,
        noShowRate,
        accountCreatedAt: doctor.created_at,
        lastLogin: doctor.last_login,
        currentStatus: doctor.account_status,
      };
    } catch (error) {
      console.error('Error in getDoctorPerformanceMetrics:', error);
      throw error;
    }
  }
}

export default new DoctorManagementService();
