import mongoose from 'mongoose';

const prescriptionUploadedByCustomerSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    prescription_url: {
      type: String,
      required: true,
    },
    prescription_type: {
      type: String,
      enum: ['general', 'for-order'],
      default: 'general',
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
prescriptionUploadedByCustomerSchema.index({ patient_id: 1, created_at: -1 });
prescriptionUploadedByCustomerSchema.index({ order_id: 1 });

const PrescriptionUploadedByCustomer = mongoose.model(
  'PrescriptionUploadedByCustomer',
  prescriptionUploadedByCustomerSchema
);

export default PrescriptionUploadedByCustomer;
