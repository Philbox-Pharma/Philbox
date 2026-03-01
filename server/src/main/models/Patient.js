import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'customers',
      required: true,
    },
    blood_group: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    recent_medication_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'recent_medications',
    },
    status: {
      type: String,
      enum: ['active', 'suspended/freezed', 'blocked/removed'],
      default: 'active',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
