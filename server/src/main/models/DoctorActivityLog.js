import mongoose from 'mongoose';

const Schema = {
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  action_type: {
    type: String,
    required: true,
  },
  description: { type: String },
  target_collection: { type: String }, // e.g., "appointments", "prescriptions"
  target_id: { type: mongoose.Schema.Types.ObjectId }, // The ID of the specific item changed
  changes: { type: mongoose.Schema.Types.Mixed }, // Store old/new values
  ip_address: { type: String },
  device_info: { type: String },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false, // Activity logs usually don't need an update timestamp
  },
};

const doctorActivityLogSchema = new mongoose.Schema(Schema, Timestamp);

const DoctorActivityLog = mongoose.model(
  'DoctorActivityLog',
  doctorActivityLogSchema
);

export default DoctorActivityLog;
