import mongoose from 'mongoose';

const prescriptionUploadedByCustomerSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
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
    review_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewed_by_salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
    },
    reviewed_at: {
      type: Date,
    },
    review_notes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    allow_payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
prescriptionUploadedByCustomerSchema.index({ branch_id: 1, created_at: -1 });
prescriptionUploadedByCustomerSchema.index({
  salesperson_id: 1,
  review_status: 1,
});

const PrescriptionUploadedByCustomer = mongoose.model(
  'PrescriptionUploadedByCustomer',
  prescriptionUploadedByCustomerSchema
);

export default PrescriptionUploadedByCustomer;
