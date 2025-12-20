import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    target_class: {
      type: String,
      enum: ['order', 'appointment'],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'target_class',
    },
    total_bill: {
      type: Number,
      default: 0,
    },
    refund_amount: {
      type: Number,
      default: 0,
    },
    transaction_type: {
      type: String,
      enum: ['pay', 'refund'],
      required: true,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      required: true,
      default: 'pending',
    },
    ipAddress: {
      type: String,
    },
    device_details: {
      type: String,
    },
    payment_method: {
      type: String,
      enum: ['Stripe-Card', 'JazzCash-Wallet', 'EasyPaisa-Wallet'],
      required: true,
    },
    wallet_number: {
      type: String,
    },
    country: {
      type: String,
    },
    transaction_at: {
      type: Date,
      default: Date.now,
    },
    invoice_url: {
      type: String,
    },
    // Refund-specific fields
    refunded_item_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
    // Stripe-specific
    stripe_payment_intent_id: {
      type: String,
    },
    // JazzCash and EasyPaisa specific
    gateway_transaction_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
transactionSchema.index({ transaction_at: -1 });
transactionSchema.index({ target_class: 1, target_id: 1 });
transactionSchema.index({ payment_status: 1 });
transactionSchema.index({ transaction_type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
