import mongoose from 'mongoose';

const medicineCategorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

medicineCategorySchema.index({ name: 1 }, { unique: true });

const MedicineCategory =
  mongoose.models.MedicineCategory ||
  mongoose.model('MedicineCategory', medicineCategorySchema);

export default MedicineCategory;
