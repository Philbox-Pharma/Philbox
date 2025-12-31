import mongoose from 'mongoose';

const customerActivityLogSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    action_type: {
      type: String,
      required: true,
    }, // e.g. "login", "register", "update_profile"
    description: {
      type: String,
    },
    target_collection: {
      type: String,
    }, // e.g. "customers", "addresses"
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    }, // Stores JSON of what changed
    ip_address: { type: String },
    device_info: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }, // Logs usually don't have update times
  }
);

const CustomerActivityLog = mongoose.model(
  'CustomerActivityLog',
  customerActivityLogSchema
);
export default CustomerActivityLog;
