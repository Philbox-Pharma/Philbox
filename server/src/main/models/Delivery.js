import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    google_address_link: {
      type: String,
      required: true,
      trim: true,
    },
    calculated_fare: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

deliverySchema.index({ order_id: 1 }, { unique: true });
deliverySchema.index({ customer_id: 1, created_at: -1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
