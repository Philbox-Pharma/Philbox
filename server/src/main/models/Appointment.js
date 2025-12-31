import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
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
    slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorSlot',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed', 'in-progress'],
      default: 'pending',
    },
    missed_by: {
      type: String,
      enum: ['doctor', 'patient'],
    },
    recording_url: {
      type: String,
    },
    appointment_request: {
      type: String,
      enum: ['processing', 'accepted', 'cancelled'],
      default: 'processing',
    },
    appointment_type: {
      type: String,
      enum: ['in-person', 'online'],
      required: true,
    },
    prescription_generated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrescriptionGeneratedByDoctor',
    },
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    prescription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
appointmentSchema.index({ doctor_id: 1, created_at: -1 });
appointmentSchema.index({ patient_id: 1, created_at: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointment_request: 1 });
appointmentSchema.index({ doctor_id: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
