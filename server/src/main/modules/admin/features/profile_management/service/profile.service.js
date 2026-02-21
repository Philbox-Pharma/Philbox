import Admin from '../../../../../models/Admin.js';
import Address from '../../../../../models/Address.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class AdminProfileService {
  /**
   * Get admin profile with address details
   */
  async getProfile(adminId) {
    const admin = await Admin.findById(adminId)
      .populate('addresses')
      .populate('branches_managed')
      .populate('roleId')
      .select(
        '-password -resetPasswordToken -resetPasswordExpires -otpCode -otpExpiresAt'
      );

    if (!admin) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      admin,
    };
  }

  /**
   * Update admin profile information
   * Handles: name, phone_number, address
   */
  async updateProfile(adminId, data, req) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('USER_NOT_FOUND');
    }

    // Handle Address (if provided)
    if (
      data.street ||
      data.town ||
      data.city ||
      data.province ||
      data.zip_code ||
      data.country
    ) {
      let address;
      if (admin.addresses && admin.addresses.length > 0) {
        // Update existing primary address (first address)
        const updateFields = {};
        if (data.street !== undefined) updateFields.street = data.street;
        if (data.town !== undefined) updateFields.town = data.town;
        if (data.city !== undefined) updateFields.city = data.city;
        if (data.province !== undefined) updateFields.province = data.province;
        if (data.zip_code !== undefined) updateFields.zip_code = data.zip_code;
        if (data.country !== undefined) updateFields.country = data.country;
        if (data.google_map_link !== undefined)
          updateFields.google_map_link = data.google_map_link;

        address = await Address.findByIdAndUpdate(
          admin.addresses[0],
          updateFields,
          { new: true, runValidators: true }
        );
      } else {
        // Create new address
        address = await Address.create({
          street: data.street,
          town: data.town,
          city: data.city,
          province: data.province,
          zip_code: data.zip_code,
          country: data.country,
          google_map_link: data.google_map_link,
          address_of_persons_id: admin._id,
        });
        admin.addresses.push(address._id);
      }
    }

    // Update Basic Info
    if (data.name !== undefined) admin.name = data.name;
    if (data.phone_number !== undefined) admin.phone_number = data.phone_number;

    await admin.save();

    // Fetch updated admin with populated data
    const updatedAdmin = await Admin.findById(adminId)
      .populate('addresses')
      .populate('branches_managed')
      .populate('roleId')
      .select(
        '-password -resetPasswordToken -resetPasswordExpires -otpCode -otpExpiresAt'
      );

    // Log activity
    await logAdminActivity(
      req,
      'update_profile',
      `Profile information updated`,
      'admins',
      admin._id
    );

    return {
      admin: updatedAdmin,
    };
  }

  /**
   * Upload or update profile picture
   */
  async uploadProfilePicture(adminId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('USER_NOT_FOUND');
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file.path, 'admin_profiles');

    admin.profile_img_url = imageUrl;
    await admin.save();

    // Log activity
    await logAdminActivity(
      req,
      'update_profile_picture',
      `Profile picture updated`,
      'admins',
      admin._id
    );

    return {
      profile_img_url: imageUrl,
    };
  }

  /**
   * Upload or update cover image
   */
  async uploadCoverImage(adminId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('USER_NOT_FOUND');
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file.path, 'admin_covers');

    admin.cover_img_url = imageUrl;
    await admin.save();

    // Log activity
    await logAdminActivity(
      req,
      'update_cover_image',
      `Cover image updated`,
      'admins',
      admin._id
    );

    return {
      cover_img_url: imageUrl,
    };
  }

  /**
   * Change password (requires current password verification)
   */
  async changePassword(adminId, currentPassword, newPassword, req) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('USER_NOT_FOUND');
    }

    // Check if admin has a password
    if (!admin.password) {
      throw new Error('NO_PASSWORD_SET');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new Error('INCORRECT_CURRENT_PASSWORD');
    }

    // Check if new password is same as current
    const isSameAsOld = await bcrypt.compare(newPassword, admin.password);
    if (isSameAsOld) {
      throw new Error('NEW_PASSWORD_SAME_AS_OLD');
    }

    // Hash and save new password
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    // Log activity
    await logAdminActivity(
      req,
      'change_password',
      `Password changed successfully`,
      'admins',
      admin._id
    );

    return {
      message: 'Password changed successfully',
    };
  }
}

export default new AdminProfileService();
