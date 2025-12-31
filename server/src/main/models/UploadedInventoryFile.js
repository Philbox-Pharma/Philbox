import mongoose from 'mongoose';

const uploadedInventoryFilesSchema = new mongoose.Schema(
  {
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
      required: true,
    },
    file_type: {
      type: String,
      enum: ['batch_wise_file', 'stock_in_hand'],
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
    logs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryFilesLog',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'synced', 'failed', 'processing'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
uploadedInventoryFilesSchema.index({ branch_id: 1 });
uploadedInventoryFilesSchema.index({ salesperson_id: 1 });
uploadedInventoryFilesSchema.index({ status: 1 });
uploadedInventoryFilesSchema.index({ uploaded_at: -1 });

const UploadedInventoryFile = mongoose.model(
  'UploadedInventoryFile',
  uploadedInventoryFilesSchema
);

export default UploadedInventoryFile;
