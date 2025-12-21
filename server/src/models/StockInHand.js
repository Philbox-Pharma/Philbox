import mongoose from 'mongoose';

const stockInHandSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItem',
      required: true,
      unique: true,
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

// Index for better query performance
stockInHandSchema.index({ medicine_id: 1 });

const StockInHand = mongoose.model('StockInHand', stockInHandSchema);

export default StockInHand;
