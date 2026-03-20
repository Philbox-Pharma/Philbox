import mongoose from 'mongoose';

const prescriptionGeneratedByDoctorSchema = new mongoose.Schema(
  {
    prescription_items_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrescriptionItem',
      },
    ],
    special_instructions: {
      type: String,
      maxlength: 1000,
    },
    diagnosis_reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    digital_verification_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    file_url: {
      type: String, // Location of generated PDF
    },
    valid_till: {
      type: Date,
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
prescriptionGeneratedByDoctorSchema.index({ doctor_id: 1, created_at: -1 });
prescriptionGeneratedByDoctorSchema.index({ patient_id: 1, created_at: -1 });
prescriptionGeneratedByDoctorSchema.index({ appointment_id: 1 });
prescriptionGeneratedByDoctorSchema.index({ digital_verification_id: 1 });

const PrescriptionGeneratedByDoctor = mongoose.model(
  'PrescriptionGeneratedByDoctor',
  prescriptionGeneratedByDoctorSchema
);

export default PrescriptionGeneratedByDoctor;
