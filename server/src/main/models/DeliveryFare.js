import mongoose from 'mongoose';

const deliveryFareSchema = new mongoose.Schema(
  {
    min_distance_km: {
      type: Number,
      required: true,
      min: 0,
    },
    max_distance_km: {
      type: Number,
      default: null,
      min: 0,
    },
    fare_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

deliveryFareSchema.pre('validate', function (next) {
  if (
    this.max_distance_km !== null &&
    this.max_distance_km !== undefined &&
    this.max_distance_km <= this.min_distance_km
  ) {
    return next(
      new Error('max_distance_km must be greater than min_distance_km')
    );
  }

  next();
});

deliveryFareSchema.index({
  min_distance_km: 1,
  max_distance_km: 1,
  is_active: 1,
});

const DeliveryFare = mongoose.model('DeliveryFare', deliveryFareSchema);

export default DeliveryFare;
