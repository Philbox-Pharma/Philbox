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

// ✅ Complete Profile DTO
export const completeProfileDTO = Joi.object({
  // Educational Details (Array of objects, sent as JSON string in multipart)
  educational_details: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return helpers.error('array.base');
        }

        // Validate each education entry
        const schema = Joi.array()
          .items(
            Joi.object({
              degree: Joi.string().required().messages({
                'string.empty': 'Degree name is required',
              }),
              institution: Joi.string().required().messages({
                'string.empty': 'Institution name is required',
              }),
              yearOfCompletion: Joi.number()
                .integer()
                .min(1950)
                .max(new Date().getFullYear())
                .required()
                .messages({
                  'number.base': 'Year of completion must be a number',
                  'number.min': 'Year must be after 1950',
                  'number.max': 'Year cannot be in the future',
                }),
              specialization: Joi.string().allow('').optional(),
            })
          )
          .min(1)
          .required();

        const { error } = schema.validate(parsed);
        if (error) {
          return helpers.error('any.invalid', { message: error.message });
        }

        return parsed;
      } catch (e) {
        return helpers.error('string.json');
      }
    })
    .required()
    .messages({
      'string.json': 'Educational details must be valid JSON',
      'array.base': 'Educational details must be an array',
      'any.invalid': 'Invalid educational details format',
    }),

  // Specializations (Array of strings, sent as JSON string)
  specialization: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return helpers.error('array.base');
        }

        const schema = Joi.array()
          .items(Joi.string().min(2).max(100))
          .min(1)
          .required();

        const { error } = schema.validate(parsed);
        if (error) {
          return helpers.error('any.invalid', { message: error.message });
        }

        return parsed;
      } catch (e) {
        return helpers.error('string.json');
      }
    })
    .required()
    .messages({
      'string.json': 'Specialization must be valid JSON',
      'array.base': 'Specialization must be an array',
      'any.invalid': 'At least one specialization is required',
    }),

  // Experience Details (Array of objects, sent as JSON string)
  experience_details: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return helpers.error('array.base');
        }

        const schema = Joi.array()
          .items(
            Joi.object({
              institution: Joi.string().required().messages({
                'string.empty': 'Institution name is required',
              }),
              starting_date: Joi.date().iso().required().messages({
                'date.base': 'Starting date must be a valid date',
              }),
              ending_date: Joi.date()
                .iso()
                .greater(Joi.ref('starting_date'))
                .when('is_going_on', {
                  is: false,
                  then: Joi.required(),
                  otherwise: Joi.optional(),
                })
                .messages({
                  'date.greater': 'Ending date must be after starting date',
                }),
              is_going_on: Joi.boolean().default(false),
            })
          )
          .min(0); // Experience can be empty for fresh graduates

        const { error } = schema.validate(parsed);
        if (error) {
          return helpers.error('any.invalid', { message: error.message });
        }

        return parsed;
      } catch (e) {
        return helpers.error('string.json');
      }
    })
    .optional()
    .messages({
      'string.json': 'Experience details must be valid JSON',
      'array.base': 'Experience details must be an array',
    }),

  // License Number
  license_number: Joi.string().min(5).max(50).required().messages({
    'string.empty': 'Medical license number is required',
    'string.min': 'License number must be at least 5 characters',
  }),

  // Affiliated Hospital
  affiliated_hospital: Joi.string().max(200).optional().allow(''),

  // Consultation Type
  consultation_type: Joi.string()
    .valid('in-person', 'online', 'both')
    .required()
    .messages({
      'any.only': 'Consultation type must be in-person, online, or both',
      'string.empty': 'Consultation type is required',
    }),

  // Consultation Fee
  consultation_fee: Joi.number().min(0).max(1000000).required().messages({
    'number.base': 'Consultation fee must be a number',
    'number.min': 'Consultation fee cannot be negative',
    'any.required': 'Consultation fee is required',
  }),

  // Online Profile URL (optional)
  onlineProfileURL: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Please provide a valid URL',
  }),
});

// Note: File validation for complete profile is handled by multer middleware
// Expected files:
// - education_files[] (multiple)
// - experience_files[] (multiple)
// - digital_signature (single)
// - profile_img (single)
// - cover_img (single)
