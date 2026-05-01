import mongoose from 'mongoose';

const branchRefundAllocationSchema = new mongoose.Schema(
  {
    refund_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerRefundRequest',
      required: true,
      index: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    allocated_items: [
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
        refund_amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    total_allocation_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['allocated', 'accepted', 'processing', 'completed', 'rejected'],
      default: 'allocated',
    },
    branch_admin_notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    allocated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    allocated_at: {
      type: Date,
      default: Date.now,
    },
    accepted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    accepted_at: {
      type: Date,
    },
    completed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
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
    collection: 'branch_refund_allocations',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for query optimization
branchRefundAllocationSchema.index({
  branch_id: 1,
  status: 1,
  allocated_at: -1,
});
branchRefundAllocationSchema.index({
  customer_id: 1,
  created_at: -1,
});

export default mongoose.model(
  'BranchRefundAllocation',
  branchRefundAllocationSchema
);
