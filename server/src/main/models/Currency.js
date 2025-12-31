import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      enum: ['PKR', 'USD'],
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;
