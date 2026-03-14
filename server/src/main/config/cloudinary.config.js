import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const cleanEnvValue = value => {
  if (!value) return value;

  // Handle common copy/paste issues like trailing quotes/commas.
  return value.trim().replace(/^['\"]+|['\"]+,?$|,+$/g, '');
};

cloudinary.config({
  cloud_name: cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: cleanEnvValue(process.env.CLOUDINARY_API_KEY),
  api_secret: cleanEnvValue(process.env.CLOUDINARY_API_SECRET),
});

export default cloudinary;
