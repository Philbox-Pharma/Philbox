import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    category: {
      type: String,
      enum: ['delivery-service', 'order', 'doctors', 'system', 'other'],
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
feedbackSchema.index({ customer_id: 1, created_at: -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ created_at: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
