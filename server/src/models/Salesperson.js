import mongoose from 'mongoose';

const Schema = {
  fullName: { type: String, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  dateOfBirth: { type: Date },
  contactNumber: {
    type: String,
    required: true,
    match: [
      /^\+92\d{10}$/,
      'Contact number must be in the format +92xxxxxxxxxx',
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },

  branches_to_be_managed: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  ],

  status: {
    type: String,
    enum: ['active', 'suspended', 'blocked'],
    default: 'active',
  },

  address_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],

  profile_img_url: {
    type: String,
    default: function () {
      return `https://avatar.iran.liara.run/username?username=${this.fullName}`;
    },
  },
  cover_img_url: {
    type: String,
    default: function () {
      return `https://placehold.co/1920x480/EAEAEA/000000?text=${this.fullName}`;
    },
  },

  // 🔐 Optional 2FA fields
  isTwoFactorEnabled: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const salespersonSchema = new mongoose.Schema(Schema, Timestamp);

const Salesperson = mongoose.model('Salesperson', salespersonSchema);

export default Salesperson;
