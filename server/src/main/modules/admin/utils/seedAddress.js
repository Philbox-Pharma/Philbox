import Address from '../../../models/Address.js';
import { resolveCoordinatesForAddress } from '../../../utils/proximityCalculator.js';

export const seedAddress = async address => {
  const newAddress = {
    street: `${address.street ? address.street : ''}`,
    town: `${address.town ? address.town : ''}`,
    city: address.city,
    province: address.province,
    province: `${address.province ? address.province : ''}`,
    zip_code: address.zip_code,
    country: address.country,
    google_map_link: address.google_map_link,
    address_of_persons_id: address.id,
  };

  const resolvedCoordinates = await resolveCoordinatesForAddress(newAddress);
  if (resolvedCoordinates) {
    newAddress.latitude = resolvedCoordinates.latitude;
    newAddress.longitude = resolvedCoordinates.longitude;
  }

  const addressDoc = new Address(newAddress);
  await addressDoc.save();
  return addressDoc._id;
};
