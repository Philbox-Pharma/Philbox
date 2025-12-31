import mongoose from 'mongoose';

const Schema = {
  // Reference to the documents submitted for this application
  applications_documents_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorDocuments',
    required: true,
  },

  // Reference to the doctor who submitted the application
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },

  // Current status of the application
  status: {
    type: String,
    enum: ['pending', 'processing', 'rejected', 'approved'],
    default: 'pending',
  },

  // Admin who reviewed the application
  reviewed_by_admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },

  // Comments from admin (reason for rejection or approval notes)
  admin_comment: {
    type: String,
  },

  // Timestamp when the application was reviewed
  reviewed_at: {
    type: Date,
  },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const doctorApplicationSchema = new mongoose.Schema(Schema, Timestamp);

const DoctorApplication = mongoose.model(
  'DoctorApplication',
  doctorApplicationSchema
);

export default DoctorApplication;
