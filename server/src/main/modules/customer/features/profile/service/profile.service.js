import Customer from '../../../../../models/Customer.js';
import Address from '../../../../../models/Address.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerProfileService {
  /**
   * Get customer profile with address details
   */
  async getProfile(customerId) {
    const customer = await Customer.findById(customerId)
      .populate('address_id')
      .populate('roleId')
      .select(
        '-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      );

    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      customer,
    };
  }

  /**
   * Update customer profile information
   * Handles: fullName, gender, dateOfBirth, contactNumber, address
   */
  async updateProfile(customerId, data, req) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
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
      if (customer.address_id) {
        // Update existing address
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
          customer.address_id,
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
          address_of_persons_id: customer._id,
        });
        customer.address_id = address._id;
      }
    }

    // Update Basic Info
    if (data.fullName !== undefined) customer.fullName = data.fullName;
    if (data.contactNumber !== undefined)
      customer.contactNumber = data.contactNumber;
    if (data.gender !== undefined) customer.gender = data.gender;
    if (data.dateOfBirth !== undefined) customer.dateOfBirth = data.dateOfBirth;

    await customer.save();

    // Fetch updated customer with populated data
    const updatedCustomer = await Customer.findById(customerId)
      .populate('address_id')
      .populate('roleId')
      .select(
        '-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      );

    // Log activity
    await logCustomerActivity(
      req,
      'update_profile',
      `Profile information updated`,
      'customers',
      customer._id
    );

    return {
      customer: updatedCustomer,
    };
  }

  /**
   * Upload or update profile picture
   */
  async uploadProfilePicture(customerId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file.path, 'customer_profiles');

    customer.profile_img_url = imageUrl;
    await customer.save();

    // Log activity
    await logCustomerActivity(
      req,
      'update_profile_picture',
      `Profile picture updated`,
      'customers',
      customer._id
    );

    return {
      profile_img_url: imageUrl,
    };
  }

  /**
   * Upload or update cover image
   */
  async uploadCoverImage(customerId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file.path, 'customer_covers');

    customer.cover_img_url = imageUrl;
    await customer.save();

    // Log activity
    await logCustomerActivity(
      req,
      'update_cover_image',
      `Cover image updated`,
      'customers',
      customer._id
    );

    return {
      cover_img_url: imageUrl,
    };
  }

  /**
   * Change password (requires current password verification)
   */
  async changePassword(customerId, currentPassword, newPassword, req) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    // Check if customer has a password (OAuth users might not)
    if (!customer.passwordHash) {
      throw new Error('NO_PASSWORD_SET');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      customer.passwordHash
    );
    if (!isMatch) {
      throw new Error('INCORRECT_CURRENT_PASSWORD');
    }

    // Check if new password is same as current
    const isSameAsOld = await bcrypt.compare(
      newPassword,
      customer.passwordHash
    );
    if (isSameAsOld) {
      throw new Error('NEW_PASSWORD_SAME_AS_OLD');
    }

    // Hash and save new password
    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    await customer.save();

    // Log activity
    await logCustomerActivity(
      req,
      'change_password',
      `Password changed successfully`,
      'customers',
      customer._id
    );

    return {
      message: 'Password changed successfully',
    };
  }
}

export default new CustomerProfileService();
