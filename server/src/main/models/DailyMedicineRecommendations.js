import mongoose from 'mongoose';

const dailyMedicineRecommendationsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    count: {
      type: Number,
      default: 0,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
    generated_source: {
      type: String,
      enum: ['system'],
      default: 'system',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

dailyMedicineRecommendationsSchema.index(
  { date: -1, customer_id: 1 },
  { unique: true }
);
dailyMedicineRecommendationsSchema.index({ customer_id: 1, date: -1 });

const DailyMedicineRecommendations = mongoose.model(
  'DailyMedicineRecommendations',
  dailyMedicineRecommendationsSchema
);

export default DailyMedicineRecommendations;
