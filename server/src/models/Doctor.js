import mongoose from 'mongoose';

const Schema = {
  fullName: { type: String, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  dateOfBirth: { type: Date },
  contactNumber: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },

  // Array of Objects for Education
  educational_details: [
    {
      degree: { type: String },
      institution: { type: String },
      yearOfCompletion: { type: Number },
      specialization: { type: String },
      fileUrl: { type: String },
    },
  ],

  // Array of Strings
  specialization: [{ type: String }],

  // Array of Objects for Experience
  experience_details: [
    {
      institution: { type: String },
      starting_date: { type: Date },
      ending_date: { type: Date },
      institution_img_url: { type: String },
      is_going_on: { type: Boolean, default: false },
    },
  ],

  license_number: { type: String },
  affiliated_hospital: { type: String },

  consultation_type: {
    type: String,
    enum: ['in-person', 'online', 'both'],
  },

  consultation_fee: { type: Number }, // Float is stored as Number in Mongo
  onlineProfileURL: { type: String },
  digital_signature: { type: String },

  passwordHash: {
    type: String,
    required: function () {
      // ⚠️ Only require password if oauth_id is NOT present
      return !this.oauth_id;
    },
  },

  // Status with hyphen requires quotes in key
  account_status: {
    type: String,
    enum: ['active', 'suspended/freezed', 'blocked/removed'],
    default: 'suspended/freezed', // Default to suspended until approved
  },

  // Note: Providing both based on your JSON, though they seem redundant
  isVerified: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no',
  },

  averageRating: { type: Number, default: 0 },

  profile_img_url: {
    type: String,
    default: function () {
      // Using fullName for the avatar generation
      return `https://avatar.iran.liara.run/username?username=${this.fullName}`;
    },
  },
  cover_img_url: {
    type: String,
    default: function () {
      return `https://placehold.co/1920x480/EAEAEA/000000?text=${this.fullName}`;
    },
  },

  last_login: { type: Date },

  // 📧 Email Verification Flags
  is_Verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: { type: String },
  verificationTokenExpiresAt: { type: Date },

  // 🔑 Password Reset Fields
  resetPasswordToken: { type: String },
  resetPasswordExpiresAt: { type: Date },
  oauth_provider: {
    type: String,
    enum: ['google', 'local'],
    default: 'local',
  },
  oauth_id: { type: String },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const doctorSchema = new mongoose.Schema(Schema, Timestamp);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
