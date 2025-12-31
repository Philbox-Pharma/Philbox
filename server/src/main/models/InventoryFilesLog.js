import mongoose from 'mongoose';

const inventoryFilesLogSchema = new mongoose.Schema(
  {
    uploaded_inventory_file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UploadedInventoryFile',
      required: true,
    },
    status: {
      type: String,
      enum: ['resolved', 'unresolved'],
      default: 'unresolved',
    },
    target_medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItem',
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockInHand',
    },
    issue: {
      type: String,
    },
    action: {
      type: String,
      enum: ['retry', 'skip'],
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    last_attempt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
inventoryFilesLogSchema.index({ uploaded_inventory_file: 1 });
inventoryFilesLogSchema.index({ status: 1 });

const InventoryFilesLog = mongoose.model(
  'InventoryFilesLog',
  inventoryFilesLogSchema
);

export default InventoryFilesLog;
