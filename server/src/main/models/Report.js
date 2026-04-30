import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // Report metadata
    title: {
      type: String,
      required: true,
    }, // e.g., "Sales Report - April 2026"
    report_type: {
      type: String,
      enum: [
        'sales',
        'inventory',
        'appointments',
        'doctor_performance',
        'customer_activity',
      ],
      required: true,
    },

    // Filters & Parameters
    date_from: {
      type: Date,
      required: true,
    },
    date_to: {
      type: Date,
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    }, // Optional filter
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly',
    }, // For scheduled reports

    // Generated report data
    summary: {
      type: mongoose.Schema.Types.Mixed,
    }, // Key metrics
    data: {
      type: mongoose.Schema.Types.Mixed,
    }, // Detailed report data
    total_records: {
      type: Number,
      default: 0,
    },

    // Export info
    pdf_file_url: {
      type: String,
    },
    excel_file_url: {
      type: String,
    },

    // Admin who generated/scheduled it
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ['generated', 'processing', 'failed'],
      default: 'generated',
    },
    error_message: {
      type: String,
    },

    // Scheduling
    is_scheduled: {
      type: Boolean,
      default: false,
    },
    schedule_next_date: {
      type: Date,
    }, // Next scheduled generation date
    is_active_schedule: {
      type: Boolean,
      default: true,
    },

    // Timestamps
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for efficient querying
reportSchema.index({ admin_id: 1, created_at: -1 });
reportSchema.index({ branch_id: 1, created_at: -1 });
reportSchema.index({ report_type: 1, created_at: -1 });
reportSchema.index({ is_scheduled: 1, is_active_schedule: 1 });
reportSchema.index({ schedule_next_date: 1, is_active_schedule: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
