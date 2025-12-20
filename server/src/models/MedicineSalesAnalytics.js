import mongoose from 'mongoose';

const medicineSalesAnalyticsSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    total_sold: {
      type: Number,
      default: 0,
    },
    revenue_generated: {
      type: Number,
      default: 0,
    },
    refunds_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
medicineSalesAnalyticsSchema.index({ date: -1 });
medicineSalesAnalyticsSchema.index({ branch_id: 1, date: -1 });
medicineSalesAnalyticsSchema.index({ medicine_id: 1 });

const MedicineSalesAnalytics = mongoose.model(
  'MedicineSalesAnalytics',
  medicineSalesAnalyticsSchema
);

export default MedicineSalesAnalytics;
