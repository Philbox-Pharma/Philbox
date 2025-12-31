import mongoose from 'mongoose';

const refillReminderSchema = new mongoose.Schema(
  {
    medicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicineItem',
        required: true,
      },
    ],
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    timeOfDay: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // 24-hour format e.g. "08:00" or "18:30"
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastNotificationSent: {
      type: Date,
    },
    nextNotificationDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient queries
refillReminderSchema.index({ patient_id: 1, isActive: 1 });
refillReminderSchema.index({ nextNotificationDate: 1, isActive: 1 });

const RefillReminder = mongoose.model('RefillReminder', refillReminderSchema);

export default RefillReminder;
