import cloudinary from '../config/cloudinary.config.js';
import fs from 'fs';

export const uploadToCloudinary = async (
  fileInput,
  folder,
  uploadOptions = {}
) => {
  try {
    let result;

    if (typeof fileInput === 'string') {
      result = await cloudinary.uploader.upload(fileInput, {
        folder,
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto',
        ...uploadOptions,
      });

      if (fs.existsSync(fileInput)) {
        fs.unlinkSync(fileInput);
      }
    } else if (fileInput?.buffer) {
      const buffer = Buffer.isBuffer(fileInput.buffer)
        ? fileInput.buffer
        : Buffer.from(fileInput.buffer);

      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            use_filename: true,
            unique_filename: false,
            resource_type: 'auto',
            public_id: fileInput.fileName,
            ...uploadOptions,
          },
          (error, uploadedResult) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(uploadedResult);
          }
        );

        uploadStream.end(buffer);
      });
    } else {
      throw new Error('Invalid file input for Cloudinary upload');
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);

    if (typeof fileInput === 'string' && fs.existsSync(fileInput)) {
      fs.unlinkSync(fileInput); // cleanup even on failure for local files
    }

    throw new Error('Failed to upload file to Cloudinary');
  }
};
