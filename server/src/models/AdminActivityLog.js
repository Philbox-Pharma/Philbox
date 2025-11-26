import mongoose from 'mongoose';

const Schema = {
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }, // super admin ID
  action_type: { type: String }, // e.g. "create_branch", "suspend_account", "update_discount"
  description: { type: String }, // human-readable detail of the action
  target_collection: { type: String }, // affected collection (e.g. "branches", "customers")
  target_id: { type: mongoose.Schema.Types.ObjectId }, // ID of affected record
  changes: { type: mongoose.Schema.Types.Mixed }, // store old/new values (for audits)
  ip_address: { type: String }, // optional
  device_info: { type: String }, // optional
  created_at: { type: Date, default: Date.now },
};

const Timestamp = {
  timestamps: false, // manually handling created_at
};

const AdminActivityLogSchema = new mongoose.Schema(Schema, Timestamp);

const AdminActivityLog = mongoose.model(
  'AdminActivityLog',
  AdminActivityLogSchema
);

export default AdminActivityLog;
