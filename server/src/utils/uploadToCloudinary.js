import cloudinary from "../config/cloudinary.config.js";
import fs from "fs";

export const uploadToCloudinary = async (localFilePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      use_filename: true,
      unique_filename: false,
    });

    // Delete local file after upload
    fs.unlinkSync(localFilePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    fs.unlinkSync(localFilePath); // cleanup even on failure
    throw new Error("Failed to upload image to Cloudinary");
  }
};
