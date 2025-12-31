import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    searched_at: {
      type: Date,
      default: Date.now,
    },
    filters: {
      category: {
        type: String,
        trim: true,
      },
      brand: {
        type: String,
        trim: true,
      },
      dosageForm: {
        type: String,
        trim: true,
      },
      prescriptionRequired: {
        type: Boolean,
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
searchHistorySchema.index({ customer_id: 1, searched_at: -1 });
searchHistorySchema.index({ customer_id: 1, created_at: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
