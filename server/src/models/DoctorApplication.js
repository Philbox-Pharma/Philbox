import mongoose from 'mongoose';

const Schema = {
  // Reference to the documents submitted for this application
  applications_documents_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorDocuments',
    required: true,
  },

  // Current status of the application
  status: {
    type: String,
    enum: ['pending', 'processing', 'rejected', 'approved'],
    default: 'pending',
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
