import Joi from 'joi';

export const createBranchDTO = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Branch name must be a string',
    'string.min': 'Branch name must be at least 2 characters',
    'string.max': 'Branch name must not exceed 100 characters',
    'any.required': 'Branch name is required',
  }),

  // Phone number for branch contact
  phone: Joi.string()
    .trim()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.base': 'Phone must be a string',
      'string.pattern.base': 'Phone must be a valid phone number',
      'string.min': 'Phone must be at least 10 characters',
      'string.max': 'Phone must not exceed 20 characters',
    }),

  // Address fields (handled separately by seedAddress)
  street: Joi.string().trim().max(255).optional().messages({
    'string.base': 'Street must be a string',
    'string.max': 'Street must not exceed 255 characters',
  }),

  town: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Town must be a string',
    'string.max': 'Town must not exceed 100 characters',
  }),

  city: Joi.string().trim().max(100).optional().messages({
    'string.base': 'City must be a string',
    'string.max': 'City must not exceed 100 characters',
  }),

  province: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Province must be a string',
    'string.max': 'Province must not exceed 100 characters',
  }),

  country: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Country must be a string',
    'string.max': 'Country must not exceed 100 characters',
  }),

  zip_code: Joi.string().trim().max(20).optional().messages({
    'string.base': 'Zip code must be a string',
    'string.max': 'Zip code must not exceed 20 characters',
  }),

  google_map_link: Joi.string().uri().optional().messages({
    'string.uri': 'Google Map link must be a valid URL',
  }),

  // Branch admin assignment
  under_administration_of: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      'array.base': 'under_administration_of must be an array of admin IDs',
      'string.length': 'Each admin ID must be a valid ObjectId',
    }),
});

export const updateBranchDTO = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.base': 'Branch name must be a string',
    'string.min': 'Branch name must be at least 2 characters',
    'string.max': 'Branch name must not exceed 100 characters',
  }),

  // Phone number for branch contact
  phone: Joi.string()
    .trim()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.base': 'Phone must be a string',
      'string.pattern.base': 'Phone must be a valid phone number',
      'string.min': 'Phone must be at least 10 characters',
      'string.max': 'Phone must not exceed 20 characters',
    }),

  status: Joi.string().valid('Active', 'Inactive').optional().messages({
    'any.only': "Status must be either 'Active' or 'Inactive'",
  }),

  // Address fields (handled separately by seedAddress)
  street: Joi.string().trim().max(255).optional().messages({
    'string.base': 'Street must be a string',
    'string.max': 'Street must not exceed 255 characters',
  }),

  town: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Town must be a string',
    'string.max': 'Town must not exceed 100 characters',
  }),

  city: Joi.string().trim().max(100).optional().messages({
    'string.base': 'City must be a string',
    'string.max': 'City must not exceed 100 characters',
  }),

  province: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Province must be a string',
    'string.max': 'Province must not exceed 100 characters',
  }),

  zip_code: Joi.string().trim().max(20).optional().messages({
    'string.base': 'Zip code must be a string',
    'string.max': 'Zip code must not exceed 20 characters',
  }),

  country: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Country must be a string',
    'string.max': 'Country must not exceed 100 characters',
  }),

  google_map_link: Joi.string().uri().optional().messages({
    'string.uri': 'Google Map link must be a valid URL',
  }),

  // Branch admin assignment
  under_administration_of: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      'array.base': 'under_administration_of must be an array of admin IDs',
      'string.length': 'Each admin ID must be a valid ObjectId',
    }),
});

export const branchQueryDTO = Joi.object({
  search: Joi.string().trim().max(100).optional().messages({
    'string.base': 'Search must be a string',
  }),

  status: Joi.string().valid('Active', 'Inactive').optional().messages({
    'any.only': "Status must be either 'Active' or 'Inactive'",
  }),

  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});
