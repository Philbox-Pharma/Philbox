import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    required: true,
  },
  // Store as Date with same reference date (e.g., 1970-01-01)
  // Only time portion is relevant
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available',
  },
});

const doctorSlotSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      unique: true,
    },
    slots: [slotSchema],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Index for efficient queries
doctorSlotSchema.index({ doctor_id: 1 });
doctorSlotSchema.index({ 'slots.day': 1 });
doctorSlotSchema.index({ 'slots.status': 1 });

const DoctorSlot = mongoose.model('DoctorSlot', doctorSlotSchema);

export default DoctorSlot;
