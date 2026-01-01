import mongoose from 'mongoose';

const Schema = {
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  start_time: {
    type: String, // Format: "HH:mm" (e.g., "09:00")
    required: true,
  },

  end_time: {
    type: String, // Format: "HH:mm" (e.g., "17:00")
    required: true,
  },

  slot_duration: {
    type: Number,
    enum: [15, 30, 60],
    required: true,
    default: 30,
  },

  status: {
    type: String,
    enum: ['available', 'booked', 'unavailable'],
    default: 'available',
  },

  // For recurring slots
  is_recurring: {
    type: Boolean,
    default: false,
  },

  recurring_pattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null,
    },
    days_of_week: {
      type: [Number], // 0-6 (Sunday-Saturday)
      default: [],
    },
    end_date: {
      type: Date,
      default: null,
    },
  },

  // If slot is booked
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },

  // Notes for the slot (optional)
  notes: {
    type: String,
    default: '',
  },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const doctorSlotSchema = new mongoose.Schema(Schema, Timestamp);

// Compound indexes for efficient queries
doctorSlotSchema.index({ doctor_id: 1, date: 1, start_time: 1 });
doctorSlotSchema.index({ doctor_id: 1, status: 1, date: 1 });

const DoctorSlot = mongoose.model('DoctorSlot', doctorSlotSchema);

export default DoctorSlot;
