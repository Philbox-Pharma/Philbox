import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

manufacturerSchema.index({ name: 1 }, { unique: true });

const Manufacturer =
  mongoose.models.Manufacturer ||
  mongoose.model('Manufacturer', manufacturerSchema);

export default Manufacturer;
