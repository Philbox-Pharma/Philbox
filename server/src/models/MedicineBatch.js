import mongoose from 'mongoose';

const medicineBatchSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItem',
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
medicineBatchSchema.index({ medicine_id: 1 });
medicineBatchSchema.index({ expiry: 1 });

const MedicineBatch = mongoose.model('MedicineBatch', medicineBatchSchema);

export default MedicineBatch;
