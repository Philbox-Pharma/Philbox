import Joi from 'joi';

export const customerRegisterDTO = Joi.object({
  fullName: Joi.string().required().min(3).max(50),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must be between 3-30 characters and alphanumeric.',
    }),
  contactNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional(),
  gender: Joi.string().valid('Male', 'Female').optional(),
  dateOfBirth: Joi.date().optional(),
});

export const verifyEmailDTO = Joi.object({
  token: Joi.string().required(),
});

export const loginDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgetPasswordDTO = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordDTO = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Customers don't have "onboarding", but they can update profile & address
export const updateProfileDTO = Joi.object({
  fullName: Joi.string().min(3).optional(),
  contactNumber: Joi.string().optional(),
  gender: Joi.string().valid('Male', 'Female').optional(),
  dateOfBirth: Joi.date().optional(),
  // Address fields (to create/update Address document)
  street: Joi.string().optional(),
  city: Joi.string().optional(),
  province: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  country: Joi.string().optional(),
  google_map_link: Joi.string().optional(),
});
