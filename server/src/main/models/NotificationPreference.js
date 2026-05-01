import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
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
    // Appointment notifications
    appointment_reminders: {
      enabled: { type: Boolean, default: true },
      minutes_before: { type: Number, default: 30 }, // 30 minutes before
    },
    appointment_status_changes: {
      enabled: { type: Boolean, default: true },
    },
    // Message notifications
    new_messages: {
      enabled: { type: Boolean, default: true },
    },
    consultation_messages: {
      enabled: { type: Boolean, default: true },
    },
    // Order notifications (customer)
    order_status_changes: {
      enabled: { type: Boolean, default: true },
    },
    // Task notifications (salesperson)
    new_tasks: {
      enabled: { type: Boolean, default: true },
    },
    low_stock_alerts: {
      enabled: { type: Boolean, default: true },
    },
    // General announcements
    system_announcements: {
      enabled: { type: Boolean, default: true },
    },
    // Notification channels
    notification_channels: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
    },
    // Quiet hours (optional)
    quiet_hours_enabled: {
      type: Boolean,
      default: false,
    },
    quiet_hours_start: {
      type: String, // Format: "HH:mm"
      default: '22:00',
    },
    quiet_hours_end: {
      type: String, // Format: "HH:mm"
      default: '08:00',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Ensure unique preference per user+type
notificationPreferenceSchema.index(
  { user_id: 1, user_type: 1 },
  { unique: true }
);

const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
);

export default NotificationPreference;
