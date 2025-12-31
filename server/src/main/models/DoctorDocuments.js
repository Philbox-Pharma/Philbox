import mongoose from 'mongoose';

const Schema = {
  // These fields store the URL or File Path of the uploaded documents
  CNIC: { type: String, required: true },
  medical_license: { type: String, required: true },
  specialist_license: { type: String }, // Optional, as not all may have a separate specialist license
  mbbs_md_degree: { type: String, required: true },
  experience_letters: { type: String },

  // Foreign Key linking to the Doctor
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
};

const Timestamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const doctorDocumentsSchema = new mongoose.Schema(Schema, Timestamp);

const DoctorDocuments = mongoose.model(
  'DoctorDocuments',
  doctorDocumentsSchema
);

export default DoctorDocuments;
