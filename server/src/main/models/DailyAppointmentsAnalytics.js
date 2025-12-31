import mongoose from 'mongoose';

const dailyAppointmentsAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    // Volume & Status - store actual appointment IDs
    todays_appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    completed_appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    missed_appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    upcoming_appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    // Performance Indicators
    completion_rate: {
      type: Number,
      default: 0,
    },
    no_show_rate: {
      type: Number,
      default: 0,
    },
    // Doctor Highlights
    top_doctor_by_appointments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    top_doctor_by_revenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    // Financial Overview
    total_revenue_today: {
      type: Number,
      default: 0,
    },
    average_charge_per_appointment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for quick date-based lookups
dailyAppointmentsAnalyticsSchema.index({ date: -1 });

const DailyAppointmentsAnalytics = mongoose.model(
  'DailyAppointmentsAnalytics',
  dailyAppointmentsAnalyticsSchema
);

export default DailyAppointmentsAnalytics;
