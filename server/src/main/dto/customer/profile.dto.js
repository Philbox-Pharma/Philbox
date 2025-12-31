import Joi from 'joi';

/**
 * DTO for updating customer profile information
 */
export const updateProfileDTO = Joi.object({
  fullName: Joi.string().min(3).max(50).optional(),
  contactNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional(),
  gender: Joi.string().valid('Male', 'Female').optional(),
  dateOfBirth: Joi.date().optional(),
  // Address fields (to create/update Address document)
  street: Joi.string().optional(),
  town: Joi.string().optional(),
  city: Joi.string().optional(),
  province: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  country: Joi.string().optional(),
  google_map_link: Joi.string().uri().optional(),
});

/**
 * DTO for changing password
 */
export const changePasswordDTO = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
    'string.empty': 'Current password cannot be empty',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'any.required': 'New password is required',
    'string.min': 'New password must be at least 6 characters long',
    'string.empty': 'New password cannot be empty',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
});

/**
 * DTO for uploading profile picture
 */
export const uploadProfilePictureDTO = Joi.object({
  // Multer will handle file validation
  // This DTO validates any additional body fields if needed
});

/**
 * DTO for uploading cover image
 */
export const uploadCoverImageDTO = Joi.object({
  // Multer will handle file validation
  // This DTO validates any additional body fields if needed
});
