import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender_role: {
      type: String,
      enum: ['customer', 'branch-admin', 'super-admin'],
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    customer_address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    branch_admin_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
    ],
    super_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
complaintSchema.index({ customer_id: 1, created_at: -1 });
complaintSchema.index({ branch_admin_id: 1, status: 1 });
complaintSchema.index({ status: 1, priority: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
