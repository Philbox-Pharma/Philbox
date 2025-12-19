import mongoose from 'mongoose';

const appointmentMessageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      enum: ['doctor', 'patient'],
      required: true,
    },
    to: {
      type: String,
      enum: ['doctor', 'patient'],
      required: true,
    },
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    media_url: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for performance
appointmentMessageSchema.index({ appointment_id: 1, created_at: -1 });

const AppointmentMessage = mongoose.model(
  'AppointmentMessage',
  appointmentMessageSchema
);

export default AppointmentMessage;
