import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true,
      index: true,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem',
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

cartSchema.index({ updated_at: -1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
