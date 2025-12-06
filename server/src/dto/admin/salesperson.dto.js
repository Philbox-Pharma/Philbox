import Joi from 'joi';

export const createSalespersonDTO = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  contactNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  gender: Joi.string().valid('Male', 'Female').required(),
  dateOfBirth: Joi.date().optional(),
  // Must be an array of valid Branch ObjectIds
  branches_to_be_managed: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one branch must be assigned to the salesperson.',
    }),
});

export const updateSalespersonDTO = Joi.object({
  fullName: Joi.string().min(3).max(50).optional(),
  contactNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional(),
  gender: Joi.string().valid('Male', 'Female').optional(),
  dateOfBirth: Joi.date().optional(),
  branches_to_be_managed: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional(),
});

export const changeStatusDTO = Joi.object({
  status: Joi.string()
    .lowercase()
    .valid('active', 'suspended', 'blocked')
    .required(),
});
