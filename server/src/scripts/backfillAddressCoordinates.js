import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Address from '../main/models/Address.js';
import { resolveCoordinatesForAddress } from '../main/utils/proximityCalculator.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const hasStoredCoordinates = address =>
  Number.isFinite(Number(address.latitude)) &&
  Number.isFinite(Number(address.longitude));

const backfillAddressCoordinates = async () => {
  await connectDB();

  try {
    const addresses = await Address.find({
      google_map_link: { $exists: true, $nin: [null, ''] },
    }).select('_id google_map_link latitude longitude');

    let scannedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let unresolvedCount = 0;

    for (const address of addresses) {
      scannedCount += 1;

      if (hasStoredCoordinates(address)) {
        skippedCount += 1;
        continue;
      }

      const coordinates = await resolveCoordinatesForAddress(address);
      if (!coordinates) {
        unresolvedCount += 1;
        continue;
      }

      address.latitude = coordinates.latitude;
      address.longitude = coordinates.longitude;
      await address.save();
      updatedCount += 1;
    }

    console.log(
      JSON.stringify(
        {
          scannedCount,
          updatedCount,
          skippedCount,
          unresolvedCount,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Address backfill failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

backfillAddressCoordinates();
