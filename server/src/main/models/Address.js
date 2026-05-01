import mongoose from 'mongoose';
import { resolveCoordinatesForAddress } from '../utils/proximityCalculator.js';

const Schema = {
  street: { type: String },
  town: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  zip_code: { type: String, optional: true },
  country: { type: String, required: true },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  google_map_link: {
    type: String,
  },
  // this can be a doctor_id or customer_id or admin_id or salesperson_id or branch_id
  address_of_persons_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
};

const TimeStamp = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const addressSchema = new mongoose.Schema(Schema, TimeStamp);

const shouldResolveCoordinates = address =>
  Boolean(address?.google_map_link) &&
  (!Number.isFinite(Number(address?.latitude)) ||
    !Number.isFinite(Number(address?.longitude)));

addressSchema.pre('validate', async function (next) {
  try {
    if (shouldResolveCoordinates(this)) {
      const coordinates = await resolveCoordinatesForAddress(this);
      if (coordinates) {
        this.latitude = coordinates.latitude;
        this.longitude = coordinates.longitude;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

addressSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() || {};
    const payload = update.$set || update;
    const googleMapLink = payload.google_map_link;

    if (googleMapLink) {
      const currentUpdate = {
        ...payload,
        google_map_link: googleMapLink,
      };

      const coordinates = await resolveCoordinatesForAddress(currentUpdate);
      if (coordinates) {
        payload.latitude = coordinates.latitude;
        payload.longitude = coordinates.longitude;
      }
    }

    if (update.$set) {
      update.$set = payload;
      this.setUpdate(update);
    } else {
      this.setUpdate(payload);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
