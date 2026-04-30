import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      index: true,
    },
    prescription_file_url: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    medicine_name: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for efficient order lookups
orderItemSchema.index({ order_id: 1 });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export default OrderItem;
