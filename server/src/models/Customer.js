import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    dateOfBirth: {
      type: Date,
    },
    contactNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        // ⚠️ Only require password if oauth_id is NOT present
        return !this.oauthId;
      },
      // Not required because OAuth users won't have a password initially
    },
    oauthId: {
      type: String,
    },
    refreshTokens: {
      type: [String],
    },

    // Reference to Address Model
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },

    profile_img_url: { type: String },
    cover_img_url: { type: String },

    account_status: {
      type: String,
      enum: ['active', 'suspended/freezed', 'blocked/removed'],
      default: 'active',
    },

    last_login: { type: Date },

    // Email Verification Flags
    is_Verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date },

    // Password Reset Flags
    resetPasswordToken: { type: String },
    resetPasswordExpiresAt: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
