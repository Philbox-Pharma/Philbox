import mongoose from 'mongoose';

const medicineSalesAnalyticsSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
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
    quantity: {
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
medicineSalesAnalyticsSchema.index({ medicine_id: 1, date: -1 });
medicineSalesAnalyticsSchema.index(
  { order_id: 1, medicine_id: 1 },
  { unique: true }
);

const MedicineSalesAnalytics = mongoose.model(
  'MedicineSalesAnalytics',
  medicineSalesAnalyticsSchema
);

export default MedicineSalesAnalytics;
