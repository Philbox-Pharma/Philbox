import Joi from 'joi';

// ✅ Registration DTO
export const doctorRegisterDTO = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Full name must be a string',
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.empty': 'Password is required',
  }),
  // Basic validation for phone numbers (adjust regex as per your region, e.g., Pakistan)
  contactNumber: Joi.string()
    .pattern(/^(\+92|92|0)(3\d{2})[- ]?\d{7}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid contact number',
    }),
  gender: Joi.string().valid('Male', 'Female').required(),
  dateOfBirth: Joi.date().iso().less('now').required().messages({
    'date.base': 'Date of birth must be a valid date',
    'date.less': 'Date of birth must be in the past',
  }),
});

// ✅ Verify Email DTO
export const verifyEmailDTO = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Verification token is required',
  }),
});

// ✅ Login DTO
export const loginDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ✅ Forget Password DTO
export const forgetPasswordDTO = Joi.object({
  email: Joi.string().email().required(),
});

// ✅ Reset Password DTO
export const resetPasswordDTO = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters long',
  }),
});
