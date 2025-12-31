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
    delivery_charges: {
      type: Number,
      default: 0,
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
    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
    },
    total_after_applying_coupon: {
      type: Number,
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
