import mongoose from 'mongoose';

const branchPerformanceSummarySchema = new mongoose.Schema(
  {
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Orders/Sales Metrics
    total_orders: {
      type: Number,
      default: 0,
    },
    completed_orders: {
      type: Number,
      default: 0,
    },
    cancelled_orders: {
      type: Number,
      default: 0,
    },
    revenue_from_orders: {
      type: Number,
      default: 0,
    },
    refunded_orders: {
      type: Number,
      default: 0,
    },
    refund_amount: {
      type: Number,
      default: 0,
    },

    // Complaints Metrics
    new_complaints: {
      type: Number,
      default: 0,
    },
    resolved_complaints: {
      type: Number,
      default: 0,
    },
    pending_complaints: {
      type: Number,
      default: 0,
    },

    // Customer Engagement
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    feedback_count: {
      type: Number,
      default: 0,
    },
    new_customers: {
      type: Number,
      default: 0,
    },

    // Staff Performance
    active_admins: {
      type: Number,
      default: 0,
    },
    active_salespersons: {
      type: Number,
      default: 0,
    },

    // Financial Summary
    total_revenue: {
      type: Number,
      default: 0,
    },
    net_revenue: {
      type: Number,
      default: 0,
    },

    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for efficient queries by branch and date
branchPerformanceSummarySchema.index({ branch_id: 1, date: -1 });

// Virtual for order completion rate
branchPerformanceSummarySchema
  .virtual('order_completion_rate')
  .get(function () {
    if (this.total_orders === 0) return 0;
    return ((this.completed_orders / this.total_orders) * 100).toFixed(2);
  });

// Virtual for complaint resolution rate
branchPerformanceSummarySchema
  .virtual('complaint_resolution_rate')
  .get(function () {
    const totalComplaints = this.new_complaints + this.pending_complaints;
    if (totalComplaints === 0) return 0;
    return ((this.resolved_complaints / totalComplaints) * 100).toFixed(2);
  });

const BranchPerformanceSummary = mongoose.model(
  'BranchPerformanceSummary',
  branchPerformanceSummarySchema
);

export default BranchPerformanceSummary;
