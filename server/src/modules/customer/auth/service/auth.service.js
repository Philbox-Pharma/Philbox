import Customer from '../../../../models/Customer.js';
import Address from '../../../../models/Address.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendVerificationEmail,
  sendResetEmail,
} from '../../../../utils/sendEmail.js';
import { logCustomerActivity } from '../../utils/logCustomerActivities.js';
import { uploadToCloudinary } from '../../../../utils/uploadToCloudinary.js';

class CustomerAuthService {
  /**
   * Helper function to determine next step for Customer
   * Logic: Verify Email -> Complete Profile (Add Address) -> Dashboard
   */
  async determineNextStep(customerId) {
    const customer = await Customer.findById(customerId);

    // 1. Check Verification
    if (!customer.is_Verified) {
      return 'verify-email';
    }

    // 2. Check Profile Completion (Specifically Address)
    // If address_id is missing, we nudge them to complete profile
    if (!customer.address_id) {
      return 'complete-profile';
    }

    // 3. Default
    return 'dashboard';
  }

  /**
   * Register new customer
   */
  async register(data, req) {
    const { fullName, email, password, gender, dateOfBirth, contactNumber } =
      data;

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });
    if (existingCustomer) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const newCustomer = new Customer({
      fullName,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      contactNumber,
      gender,
      dateOfBirth,
      verificationToken,
      verificationTokenExpiresAt,
      is_Verified: false,
      account_status: 'active',
    });

    await newCustomer.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    // Using the reusable email function with role 'Customer'
    await sendVerificationEmail(
      newCustomer.email,
      verifyLink,
      newCustomer.fullName,
      'Customer'
    );

    // Logging
    req.customer = { _id: newCustomer._id, email: newCustomer.email };
    await logCustomerActivity(
      req,
      'register',
      `Customer registered`,
      'customers',
      newCustomer._id
    );

    // Return safe object
    const safeCustomer = newCustomer.toObject();
    delete safeCustomer.passwordHash;

    return {
      customer: safeCustomer,
      nextStep: 'verify-email',
    };
  }

  /**
   * Verify Email
   */
  async verifyEmail(token, req) {
    const customer = await Customer.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!customer) throw new Error('INVALID_OR_EXPIRED_TOKEN');

    customer.is_Verified = true;
    customer.verificationToken = undefined;
    customer.verificationTokenExpiresAt = undefined;
    await customer.save();

    req.customer = { _id: customer._id };
    await logCustomerActivity(
      req,
      'verify_email',
      `Email verified`,
      'customers',
      customer._id
    );

    return {
      nextStep: 'login',
    };
  }

  /**
   * Login
   */
  async login(email, password, req) {
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error('INVALID_CREDENTIALS');

    // OAuth users might not have a password set initially
    if (!customer.passwordHash) throw new Error('INVALID_CREDENTIALS');

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) throw new Error('INVALID_CREDENTIALS');

    if (!customer.is_Verified) throw new Error('EMAIL_NOT_VERIFIED');

    if (
      customer.account_status === 'suspended/freezed' ||
      customer.account_status === 'blocked/removed'
    ) {
      throw new Error('ACCOUNT_BLOCKED');
    }

    customer.last_login = Date.now();
    await customer.save();

    req.customer = { _id: customer._id, email: customer.email };
    await logCustomerActivity(
      req,
      'login',
      `Customer logged in`,
      'customers',
      customer._id
    );

    // Determine next step
    const nextStep = await this.determineNextStep(customer._id);

    const safeCustomer = customer.toObject();
    delete safeCustomer.passwordHash;

    return {
      customerId: customer._id.toString(),
      accountStatus: customer.account_status,
      customer: safeCustomer,
      nextStep,
    };
  }

  /**
   * Update Profile (Handles Text Data + Address + Images)
   */
  async updateProfile(customerId, data, files, req) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error('USER_NOT_FOUND');

    // 1. Handle Images
    if (files && files['profile_img'] && files['profile_img'][0]) {
      customer.profile_img_url = await uploadToCloudinary(
        files['profile_img'][0].path,
        'customer_profiles'
      );
    }
    if (files && files['cover_img'] && files['cover_img'][0]) {
      customer.cover_img_url = await uploadToCloudinary(
        files['cover_img'][0].path,
        'customer_covers'
      );
    }

    // 2. Handle Address (if provided)
    if (data.street || data.city || data.province || data.zip_code) {
      let address;
      if (customer.address_id) {
        // Update existing address
        address = await Address.findByIdAndUpdate(
          customer.address_id,
          {
            street: data.street,
            city: data.city,
            province: data.province,
            zip_code: data.zip_code,
            country: data.country,
            google_map_link: data.google_map_link,
            updated_at: Date.now(),
          },
          { new: true }
        );
      } else {
        // Create new address
        address = await Address.create({
          street: data.street,
          city: data.city,
          province: data.province,
          zip_code: data.zip_code,
          country: data.country,
          google_map_link: data.google_map_link,
          customer_id: customer._id,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
        customer.address_id = address._id;
      }
    }

    // 3. Handle Basic Info
    if (data.fullName) customer.fullName = data.fullName;
    if (data.contactNumber) customer.contactNumber = data.contactNumber;
    if (data.gender) customer.gender = data.gender;
    if (data.dateOfBirth) customer.dateOfBirth = data.dateOfBirth;

    customer.updated_at = Date.now();
    await customer.save();

    // Fetch populated data to return
    const updatedCustomer = await Customer.findById(customerId)
      .populate('address_id')
      .select('-passwordHash');

    await logCustomerActivity(
      req,
      'update_profile',
      `Profile updated`,
      'customers',
      customer._id
    );

    return {
      customer: updatedCustomer,
      message: 'Profile updated successfully',
      nextStep: 'dashboard',
    };
  }

  /**
   * OAuth Login
   */
  async oauthLogin(oauthData, req) {
    const customer = await Customer.findById(oauthData._id);
    if (!customer) throw new Error('USER_NOT_FOUND');

    if (customer.account_status === 'blocked/removed')
      throw new Error('ACCOUNT_BLOCKED');

    customer.last_login = Date.now();
    await customer.save();

    req.customer = { _id: customer._id, email: customer.email };
    await logCustomerActivity(
      req,
      'oauth_login',
      `Logged in via Google`,
      'customers',
      customer._id
    );

    // Determine next step
    const nextStep = await this.determineNextStep(customer._id);

    return {
      customerId: customer._id.toString(),
      accountStatus: customer.account_status,
      isNewUser: customer.created_at > Date.now() - 60000,
      nextStep,
    };
  }

  /**
   * Forgot Password
   */
  async forgetPassword(email, req) {
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error('USER_NOT_FOUND');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    customer.resetPasswordToken = resetTokenHash;
    customer.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000;
    await customer.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // Using the reusable email function with role 'Customer'
    await sendResetEmail(
      customer.email,
      resetLink,
      customer.fullName,
      'Customer'
    );

    await logCustomerActivity(
      req,
      'forget_password',
      `Password reset requested`,
      'customers',
      customer._id
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
    const customer = await Customer.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!customer) throw new Error('INVALID_OR_EXPIRED_TOKEN');

    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpiresAt = undefined;
    await customer.save();

    await logCustomerActivity(
      req,
      'reset_password',
      `Password changed`,
      'customers',
      customer._id
    );

    return {
      nextStep: 'login',
    };
  }

  async logout(customer, req) {
    await logCustomerActivity(
      req,
      'logout',
      `Logged out`,
      'customers',
      customer._id
    );
    return {
      nextStep: 'login',
    };
  }
}

export default new CustomerAuthService();
