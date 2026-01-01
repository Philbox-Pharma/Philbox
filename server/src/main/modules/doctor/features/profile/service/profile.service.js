import Doctor from '../../../../../models/Doctor.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import bcrypt from 'bcryptjs';

class DoctorProfileService {
  /**
   * Get doctor's complete profile
   */
  async getDoctorProfile(doctorId) {
    try {
      const doctor = await Doctor.findById(doctorId)
        .select('-passwordHash -verificationToken -resetPasswordToken')
        .populate('roleId', 'name');

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      return doctor;
    } catch (error) {
      console.error('Error in getDoctorProfile:', error);
      throw error;
    }
  }

  /**
   * Update doctor profile details
   */
  async updateDoctorProfile(doctorId, updateData, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Only allow updating specific fields
      const allowedFields = [
        'fullName',
        'contactNumber',
        'specialization',
        'affiliated_hospital',
        'educational_details',
        'experience_details',
        'onlineProfileURL',
      ];

      const updates = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      // Validate specialization is an array if provided
      if (updates.specialization && !Array.isArray(updates.specialization)) {
        throw new Error('INVALID_DATA');
      }

      // Update doctor
      Object.assign(doctor, updates);
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'profile_update',
        'Updated profile details',
        'doctors',
        doctor._id
      );

      // Return without sensitive data
      const updatedDoctor = await Doctor.findById(doctorId).select(
        '-passwordHash -verificationToken -resetPasswordToken'
      );

      return updatedDoctor;
    } catch (error) {
      console.error('Error in updateDoctorProfile:', error);
      throw error;
    }
  }

  /**
   * Update profile image
   */
  async updateProfileImage(doctorId, file, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(
        file.path,
        'doctor_profiles/profile_images'
      );

      if (!imageUrl) {
        throw new Error('FILE_UPLOAD_FAILED');
      }

      doctor.profile_img_url = imageUrl;
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'profile_image_update',
        'Updated profile image',
        'doctors',
        doctor._id
      );

      return doctor;
    } catch (error) {
      console.error('Error in updateProfileImage:', error);
      throw error;
    }
  }

  /**
   * Update cover image
   */
  async updateCoverImage(doctorId, file, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(
        file.path,
        'doctor_profiles/cover_images'
      );

      if (!imageUrl) {
        throw new Error('FILE_UPLOAD_FAILED');
      }

      doctor.cover_img_url = imageUrl;
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'cover_image_update',
        'Updated cover image',
        'doctors',
        doctor._id
      );

      return doctor;
    } catch (error) {
      console.error('Error in updateCoverImage:', error);
      throw error;
    }
  }

  /**
   * Update consultation type
   */
  async updateConsultationType(doctorId, consultationType, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      doctor.consultation_type = consultationType;
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'consultation_type_update',
        `Updated consultation type to ${consultationType}`,
        'doctors',
        doctor._id
      );

      return doctor;
    } catch (error) {
      console.error('Error in updateConsultationType:', error);
      throw error;
    }
  }

  /**
   * Update consultation fee
   */
  async updateConsultationFee(doctorId, fee, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      doctor.consultation_fee = fee;
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'consultation_fee_update',
        `Updated consultation fee to ${fee}`,
        'doctors',
        doctor._id
      );

      return doctor;
    } catch (error) {
      console.error('Error in updateConsultationFee:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(doctorId, currentPassword, newPassword, req) {
    try {
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      // Check if OAuth account
      if (doctor.oauth_provider && doctor.oauth_provider !== 'local') {
        throw new Error('OAUTH_ACCOUNT');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        doctor.passwordHash
      );

      if (!isMatch) {
        throw new Error('INCORRECT_PASSWORD');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      doctor.passwordHash = hashedPassword;
      await doctor.save();

      // Log activity
      req.doctor = {
        _id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
      };

      await logDoctorActivity(
        req,
        'password_change',
        'Changed password',
        'doctors',
        doctor._id
      );

      return { success: true };
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }
}

export default new DoctorProfileService();
