import mongoose from 'mongoose';

const itemClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const ItemClass = mongoose.model('ItemClass', itemClassSchema);

export default ItemClass;
