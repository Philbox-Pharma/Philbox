import mongoose from 'mongoose';

const customerRefundRequestSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    requested_items: [
      {
        order_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'OrderItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unit_price: {
          type: Number,
          required: true,
          min: 0,
        },
        requested_refund_amount: {
          type: Number,
          required: true,
          min: 0,
        },
        branch_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Branch',
          required: true,
          index: true,
        },
      },
    ],
    total_requested_refund_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'super_admin_review',
        'approved',
        'rejected',
        'partially_approved',
        'completed',
      ],
      default: 'submitted',
      index: true,
    },
    rejection_reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    super_admin_notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewed_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },
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
    collection: 'customer_refund_requests',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for query optimization
customerRefundRequestSchema.index({
  customer_id: 1,
  created_at: -1,
});
customerRefundRequestSchema.index({
  status: 1,
  created_at: -1,
});

export default mongoose.model(
  'CustomerRefundRequest',
  customerRefundRequestSchema
);
