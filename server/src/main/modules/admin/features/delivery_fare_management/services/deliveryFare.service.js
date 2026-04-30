import DeliveryFare from '../../../../../models/DeliveryFare.js';

const hasOverlap = (aMin, aMax, bMin, bMax) => {
  const aUpper = aMax ?? Number.POSITIVE_INFINITY;
  const bUpper = bMax ?? Number.POSITIVE_INFINITY;
  return aMin < bUpper && bMin < aUpper;
};

class DeliveryFareService {
  async _assertNoRangeOverlap(payload, excludeId = null) {
    const minDistance = Number(payload.min_distance_km);
    const maxDistance =
      payload.max_distance_km === null || payload.max_distance_km === undefined
        ? null
        : Number(payload.max_distance_km);

    const fares = await DeliveryFare.find(
      excludeId
        ? { _id: { $ne: excludeId }, is_active: true }
        : { is_active: true }
    )
      .select('min_distance_km max_distance_km')
      .lean();

    for (const fare of fares) {
      if (
        hasOverlap(
          minDistance,
          maxDistance,
          Number(fare.min_distance_km),
          fare.max_distance_km == null ? null : Number(fare.max_distance_km)
        )
      ) {
        throw new Error('DELIVERY_FARE_RANGE_OVERLAP');
      }
    }
  }

  async createFare(payload) {
    await this._assertNoRangeOverlap(payload);
    return DeliveryFare.create(payload);
  }

  async listFares() {
    return DeliveryFare.find({}).sort({ min_distance_km: 1, created_at: 1 });
  }

  async updateFare(id, payload) {
    const existing = await DeliveryFare.findById(id);
    if (!existing) {
      throw new Error('DELIVERY_FARE_NOT_FOUND');
    }

    const nextPayload = {
      min_distance_km: payload.min_distance_km ?? existing.min_distance_km,
      max_distance_km:
        payload.max_distance_km !== undefined
          ? payload.max_distance_km
          : existing.max_distance_km,
    };

    if (payload.is_active !== false) {
      await this._assertNoRangeOverlap(nextPayload, id);
    }

    return DeliveryFare.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async deleteFare(id) {
    const deleted = await DeliveryFare.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error('DELIVERY_FARE_NOT_FOUND');
    }
    return deleted;
  }
}

export default new DeliveryFareService();
