import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'on-the-way',
        'cancelled-by-customer',
        'completed',
        'refunded',
      ],
      default: 'pending',
    },
    refund_status: {
      type: String,
      enum: ['not-refunded', 'partially_refunded', 'refunded'],
      default: 'not-refunded',
    },
    cancellation_request_status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
    },
    cancellation_requested_reason: {
      type: String,
      trim: true,
      default: '',
    },
    cancellation_requested_at: {
      type: Date,
    },
    cancellation_requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    cancellation_review_reason: {
      type: String,
      trim: true,
      default: '',
    },
    cancellation_reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
    },
    cancellation_reviewed_at: {
      type: Date,
    },
    salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
    },
    order_items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    total_after_applying_coupon: {
      type: Number,
    },
    invoice_url: {
      type: String,
    },
    cancellation_reason: {
      type: String,
      trim: true,
      default: '',
    },
    cancelled_at: {
      type: Date,
    },
    refund_transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
orderSchema.index({ branch_id: 1, created_at: -1 });
orderSchema.index({ customer_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
