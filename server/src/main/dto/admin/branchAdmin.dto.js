import Joi from 'joi';

// Address validation schema (reusable)
const addressSchema = Joi.object({
  street: Joi.string().trim().optional().allow(''),
  town: Joi.string().trim().optional().allow(''),
  city: Joi.string().trim().required().messages({
    'string.empty': 'City is required',
    'any.required': 'City is required',
  }),
  province: Joi.string().trim().required().messages({
    'string.empty': 'Province is required',
    'any.required': 'Province is required',
  }),
  zip_code: Joi.string().trim().optional().allow(''),
  country: Joi.string().trim().required().messages({
    'string.empty': 'Country is required',
    'any.required': 'Country is required',
  }),
  google_map_link: Joi.string().uri().trim().optional().allow(''),
});

export const createBranchAdminSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Valid email is required',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
  phone_number: Joi.string().trim().optional().allow(''),
  category: Joi.string()
    .valid('super-admin', 'branch-admin')
    .optional()
    .default('branch-admin'),
  status: Joi.string().valid('active', 'suspended', 'blocked').optional(),
  branches_managed: Joi.array()
    .items(
      Joi.string().hex().length(24).messages({
        'string.hex': 'Branch ID must be a valid hexadecimal',
        'string.length': 'Branch ID must be 24 characters long',
      })
    )
    .optional()
    .default([])
    .messages({
      'array.base': 'Branches managed must be an array of IDs',
    }),
  addresses: Joi.array().items(addressSchema).optional().default([]),
  isTwoFactorEnabled: Joi.boolean().optional().default(false),
});

export const updateBranchAdminSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone_number: Joi.string().trim().optional().allow(''),
  category: Joi.string().valid('super-admin', 'branch-admin').optional(),
  status: Joi.string().valid('active', 'suspended', 'blocked').optional(),
  branches_managed: Joi.array()
    .items(
      Joi.string().hex().length(24).messages({
        'string.hex': 'Branch ID must be a valid hexadecimal',
        'string.length': 'Branch ID must be 24 characters long',
      })
    )
    .optional(),
  addresses: Joi.array().items(addressSchema).optional(),
  isTwoFactorEnabled: Joi.boolean().optional(),
  // Allow empty body when files are uploaded
  remove_profile_img: Joi.string().optional(),
  remove_cover_img: Joi.string().optional(),
})
  .min(0) // Changed from 1 to 0 to allow image-only updates
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
