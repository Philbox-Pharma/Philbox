import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
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
    notification_type: {
      type: String,
      enum: [
        'appointment_reminder',
        'appointment_status_change',
        'new_message',
        'consultation_message',
        'order_status_change',
        'new_task',
        'low_stock_alert',
        'refill_reminder',
        'system_announcement',
        'other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
    channels_sent: [
      {
        type: String,
        enum: ['push', 'email', 'sms', 'in-app', 'socket'],
      },
    ],
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'sent',
    },
    error_message: {
      type: String,
    },
    fcm_response: {
      type: Object,
    },
    read_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for efficient queries
notificationLogSchema.index({ user_id: 1, created_at: -1 });
notificationLogSchema.index({ notification_type: 1, created_at: -1 });
notificationLogSchema.index({ status: 1, created_at: -1 });

const NotificationLog = mongoose.model(
  'NotificationLog',
  notificationLogSchema
);

export default NotificationLog;
