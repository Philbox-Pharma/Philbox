import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    cupon_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    expiry_time: {
      type: Date,
      required: true,
    },
    percent_off: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    for: {
      type: String,
      enum: ['appointments', 'medicine'],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    max_use_limit: {
      type: Number,
      default: null,
      min: 1,
    },
    times_used: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Partial unique index: code is unique only when coupon is active
couponSchema.index(
  { cupon_code: 1 },
  { unique: true, partialFilterExpression: { is_active: true } }
);

// Index for faster lookups by expiry
couponSchema.index({ expiry_time: 1 });

// Pre-validate hook to check expiry
couponSchema.pre('save', function (next) {
  if (this.expiry_time < new Date()) {
    return next(new Error('Expiry date must be in the future'));
  }
  next();
});

// Pre-validate hook for updates
couponSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.expiry_time && update.expiry_time < new Date()) {
    return next(new Error('Expiry date must be in the future'));
  }
  // Prevent times_used from being set to a negative value
  if (update.times_used !== undefined && update.times_used < 0) {
    return next(new Error('Times used cannot be negative'));
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
