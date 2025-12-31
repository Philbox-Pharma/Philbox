import mongoose from 'mongoose';

const appointmentsAnalyticsHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    // Volume & Status - store references and counts
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
    total_appointments_count: {
      type: Number,
      default: 0,
    },
    completed_appointments_count: {
      type: Number,
      default: 0,
    },
    missed_appointments_count: {
      type: Number,
      default: 0,
    },
    upcoming_appointments_count: {
      type: Number,
      default: 0,
    },
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
    // Optional analytics for richer graphs
    appointments_per_doctor: [
      {
        doctor_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        total_appointments: {
          type: Number,
          default: 0,
        },
      },
    ],
    revenue_per_doctor: [
      {
        doctor_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        revenue: {
          type: Number,
          default: 0,
        },
      },
    ],
    snapshot_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
appointmentsAnalyticsHistorySchema.index({ date: -1 });
appointmentsAnalyticsHistorySchema.index({ snapshot_at: -1 });

const AppointmentsAnalyticsHistory = mongoose.model(
  'AppointmentsAnalyticsHistory',
  appointmentsAnalyticsHistorySchema
);

export default AppointmentsAnalyticsHistory;
