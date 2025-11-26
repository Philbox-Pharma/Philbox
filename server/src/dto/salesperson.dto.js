import Joi from 'joi';

export const createSalespersonDTO = Joi.object({
  fullName: Joi.string().trim().required().messages({
    'string.base': 'Full name must be a string',
    'any.required': 'Full name is required',
  }),

  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': "Gender must be one of 'male', 'female', or 'other'",
    'any.required': 'Gender is required',
  }),

  contactNumber: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Contact number must contain only digits and symbols like +, -, ()',
      'any.required': 'Contact number is required',
    }),

  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  city: Joi.string().trim().required().messages({
    'string.base': 'City must be a string',
    'any.required': 'City is required',
  }),

  province: Joi.string().trim().required().messages({
    'string.base': 'Province must be a string',
    'any.required': 'Province is required',
  }),

  country: Joi.string().trim().required().messages({
    'string.base': 'Country must be a string',
    'any.required': 'Country is required',
  }),

  branch_assigned: Joi.string().hex().length(24).optional().messages({
    'string.length': 'Branch ID must be a valid ObjectId',
  }),
});
