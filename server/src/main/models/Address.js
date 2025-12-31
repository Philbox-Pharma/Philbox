import mongoose from 'mongoose';

const Schema = {
  street: { type: String },
  town: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  zip_code: { type: String, optional: true },
  country: { type: String, required: true },
  google_map_link: {
    type: String,
  },
  // this can be a doctor_id or customer_id or admin_id or salesperson_id or branch_id
  address_of_persons_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
};

const TimeStamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const addressSchema = new mongoose.Schema(Schema, TimeStamp);

const Address = mongoose.model('Address', addressSchema);

export default Address;
