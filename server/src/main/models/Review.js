import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    target_type: {
      type: String,
      enum: ['doctor', 'meeting', 'order'],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
reviewSchema.index({ target_type: 1, target_id: 1 });
reviewSchema.index({ customer_id: 1 });
reviewSchema.index({ created_at: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
