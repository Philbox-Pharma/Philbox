import cloudinary from '../config/cloudinary.config.js';
import fs from 'fs';

export const uploadToCloudinary = async (
  localFilePath,
  folder,
  uploadOptions = {}
) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      use_filename: true,
      unique_filename: false,
      resource_type: 'auto',
      ...uploadOptions,
    });

    // Delete local file after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // cleanup even on failure
    }
    throw new Error('Failed to upload file to Cloudinary');
  }
};
