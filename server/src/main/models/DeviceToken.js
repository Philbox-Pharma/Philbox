import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    user_type: {
      type: String,
      enum: ['customer', 'doctor', 'salesperson'],
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    device_type: {
      type: String,
      enum: ['web', 'ios', 'android'],
      default: 'web',
    },
    device_name: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_used_at: {
      type: Date,
      default: Date.now,
    },
    user_agent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for efficient cleanup of old tokens
deviceTokenSchema.index({ user_id: 1, is_active: 1 });
deviceTokenSchema.index({ created_at: 1 }, { expireAfterSeconds: 34560000 }); // 400 days

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);

export default DeviceToken;
