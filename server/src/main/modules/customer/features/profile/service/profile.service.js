import Customer from '../../../../../models/Customer.js';
import Address from '../../../../../models/Address.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { sendVerificationEmail } from '../../../../../utils/sendEmail.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import { resolveCoordinatesForAddress } from '../../../../../utils/proximityCalculator.js';

class CustomerProfileService {
  async getProfile(customerId, req) {
    const customer = await Customer.findById(customerId)
      .populate(
        'address_id',
        'street town city province zip_code country google_map_link address_of_persons_id'
      )
      .populate('roleId', 'name description createdAt updatedAt')
      .select(
        '-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      );

    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    await logCustomerActivity(
      req,
      'view_profile',
      'Viewed customer profile',
      'customers',
      customer._id
    );

    return { customer };
  }

  async updateProfile(customerId, data, req) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    const emailChanged =
      data.email !== undefined &&
      String(data.email).trim().toLowerCase() !==
        String(customer.email).toLowerCase();

    if (emailChanged) {
      const normalizedEmail = String(data.email).trim().toLowerCase();
      const existingCustomer = await Customer.findOne({
        email: normalizedEmail,
        _id: { $ne: customer._id },
      }).lean();

      if (existingCustomer) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      customer.email = normalizedEmail;
      customer.is_Verified = false;
      customer.verificationToken = crypto.randomBytes(32).toString('hex');
      customer.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    }

    const hasAddressPayload =
      data.street !== undefined ||
      data.town !== undefined ||
      data.city !== undefined ||
      data.province !== undefined ||
      data.zip_code !== undefined ||
      data.country !== undefined ||
      data.google_map_link !== undefined;

    if (hasAddressPayload) {
      let address;

      if (customer.address_id) {
        const updateFields = {};
        if (data.street !== undefined) updateFields.street = data.street;
        if (data.town !== undefined) updateFields.town = data.town;
        if (data.city !== undefined) updateFields.city = data.city;
        if (data.province !== undefined) updateFields.province = data.province;
        if (data.zip_code !== undefined) updateFields.zip_code = data.zip_code;
        if (data.country !== undefined) updateFields.country = data.country;
        if (data.google_map_link !== undefined) {
          updateFields.google_map_link = data.google_map_link;
        }

        const resolvedCoordinates = await resolveCoordinatesForAddress({
          ...updateFields,
          google_map_link:
            updateFields.google_map_link ??
            (
              await Address.findById(customer.address_id)
                .select('google_map_link')
                .lean()
            )?.google_map_link,
        });

        if (resolvedCoordinates) {
          updateFields.latitude = resolvedCoordinates.latitude;
          updateFields.longitude = resolvedCoordinates.longitude;
        }

        address = await Address.findByIdAndUpdate(
          customer.address_id,
          updateFields,
          { new: true, runValidators: true }
        );
      } else {
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

        const resolvedCoordinates = await resolveCoordinatesForAddress(address);
        if (resolvedCoordinates) {
          address.latitude = resolvedCoordinates.latitude;
          address.longitude = resolvedCoordinates.longitude;
          await address.save();
        }

        customer.address_id = address._id;
      }
    }

    if (data.fullName !== undefined) customer.fullName = data.fullName;
    if (data.contactNumber !== undefined)
      customer.contactNumber = data.contactNumber;
    if (data.gender !== undefined) customer.gender = data.gender;
    if (data.dateOfBirth !== undefined) customer.dateOfBirth = data.dateOfBirth;

    await customer.save();

    let verificationEmailSent = false;
    if (emailChanged) {
      const verificationLink = `${process.env.FRONTEND_URL}/customer/auth/verify-email/${customer.verificationToken}`;
      await sendVerificationEmail(
        customer.email,
        verificationLink,
        customer.fullName,
        'Customer'
      );
      verificationEmailSent = true;
    }

    const updatedCustomer = await Customer.findById(customerId)
      .populate(
        'address_id',
        'street town city province zip_code country google_map_link address_of_persons_id'
      )
      .populate('roleId', 'name description createdAt updatedAt')
      .select(
        '-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      );

    await logCustomerActivity(
      req,
      'update_profile',
      'Profile information updated',
      'customers',
      customer._id
    );

    return {
      customer: updatedCustomer,
      emailVerificationRequired: emailChanged,
      verificationEmailSent,
    };
  }

  async uploadProfilePicture(customerId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    const imageUrl = await uploadToCloudinary(file.path, 'customer_profiles');

    customer.profile_img_url = imageUrl;
    await customer.save();

    await logCustomerActivity(
      req,
      'update_profile_picture',
      'Profile picture updated',
      'customers',
      customer._id
    );

    return { profile_img_url: imageUrl };
  }

  async uploadCoverImage(customerId, file, req) {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    const imageUrl = await uploadToCloudinary(file.path, 'customer_covers');

    customer.cover_img_url = imageUrl;
    await customer.save();

    await logCustomerActivity(
      req,
      'update_cover_image',
      'Cover image updated',
      'customers',
      customer._id
    );

    return { cover_img_url: imageUrl };
  }

  async changePassword(customerId, currentPassword, newPassword, req) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!customer.passwordHash) {
      throw new Error('NO_PASSWORD_SET');
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      customer.passwordHash
    );
    if (!isMatch) {
      throw new Error('INCORRECT_CURRENT_PASSWORD');
    }

    const isSameAsOld = await bcrypt.compare(
      newPassword,
      customer.passwordHash
    );
    if (isSameAsOld) {
      throw new Error('NEW_PASSWORD_SAME_AS_OLD');
    }

    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    await customer.save();

    await logCustomerActivity(
      req,
      'change_password',
      'Password changed successfully',
      'customers',
      customer._id
    );

    return { message: 'Password changed successfully' };
  }
}

export default new CustomerProfileService();
