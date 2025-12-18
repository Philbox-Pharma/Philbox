import mongoose from 'mongoose';

const salespersonSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
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
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    dateOfBirth: {
      type: Date,
    },
    // Array of Branch IDs this salesperson manages/visits
    branches_to_be_managed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'suspended', 'blocked'],
      default: 'active',
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    profile_img_url: {
      type: String,
      default: function () {
        return `https://avatar.iran.liara.run/username?username=${this.name}`;
      },
    },
    cover_img_url: {
      type: String,
      default: function () {
        return `https://placehold.co/1920x480/EAEAEA/000000?text=${this.name}`;
      },
    },
    // Fields for Password Reset Flow
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    // 🔐 Two-Factor Authentication Fields
    isTwoFactorEnabled: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },

    // 🔐 RBAC - Role-Based Access Control
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Optional: Index for faster searches
salespersonSchema.index({ branches_to_be_managed: 1 });

const Salesperson = mongoose.model('Salesperson', salespersonSchema);

export default Salesperson;
