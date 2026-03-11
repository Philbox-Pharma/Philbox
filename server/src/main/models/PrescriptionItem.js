import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItem',
      required: true,
    },
    form: {
      type: String,
      enum: ['tablet', 'syrup', 'injection', 'inhaler', 'ointment'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['once a day', 'twice a day', 'thrice a day', 'every 8 hours'],
      required: true,
    },
    duration_days: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity_prescribed: {
      type: Number,
      required: true,
      min: 1,
    },
    dosage: {
      type: String,
      required: true,
    },
    prescription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrescriptionGeneratedByDoctor',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
prescriptionItemSchema.index({ prescription_id: 1 });
prescriptionItemSchema.index({ medicine_id: 1 });

const PrescriptionItem = mongoose.model(
  'PrescriptionItem',
  prescriptionItemSchema
);

export default PrescriptionItem;
