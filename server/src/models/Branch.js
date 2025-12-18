import mongoose from 'mongoose';

const Schema = {
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  phone: { type: String, default: '' },
  under_administration_of: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  ],
  salespersons_assigned: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Salesperson' },
  ],
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  cover_img_url: {
    type: String,
    default: function () {
      return `https://placehold.co/1920x480/EAEAEA/000000?text=${this.name}`;
    },
  },
};
const TimeStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const branchSchema = new mongoose.Schema(Schema, TimeStamps);

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
