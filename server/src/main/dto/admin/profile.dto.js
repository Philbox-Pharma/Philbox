import Joi from 'joi';

/**
 * DTO for updating admin profile information
 */
export const updateProfileDTO = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s.-]+$/)
    .min(3)
    .max(50)
    .optional()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, dots, and hyphens',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 50 characters',
    }),
  phone_number: Joi.string()
    .pattern(/^(03\d{9}|\+923\d{9})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Pakistani number starting with 03 or +923 (e.g., 03XXXXXXXXX)',
    }),
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
