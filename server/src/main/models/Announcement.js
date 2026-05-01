import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    target_audience: {
      type: String,
      enum: ['all', 'customers', 'doctors', 'salespersons'],
      required: true,
    },
    delivery_methods: {
      type: [String],
      enum: ['email', 'sms', 'push', 'in-app'],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one delivery method must be selected',
      },
    },
    scheduled_at: {
      type: Date,
      required: true,
    },
    sent_at: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed', 'cancelled'],
      default: 'draft',
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    delivery_status: {
      total_recipients: {
        type: Number,
        default: 0,
      },
      sent: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      by_method: {
        email: {
          type: {
            sent: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
          },
          default: { sent: 0, failed: 0, pending: 0 },
        },
        sms: {
          type: {
            sent: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
          },
          default: { sent: 0, failed: 0, pending: 0 },
        },
        push: {
          type: {
            sent: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
          },
          default: { sent: 0, failed: 0, pending: 0 },
        },
        'in-app': {
          type: {
            sent: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
          },
          default: { sent: 0, failed: 0, pending: 0 },
        },
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

announcementSchema.index({ created_by: 1, created_at: -1 });
announcementSchema.index({ status: 1, scheduled_at: 1 });
announcementSchema.index({ target_audience: 1, status: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
