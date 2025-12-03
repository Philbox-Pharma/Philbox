import Joi from 'joi';

export const createBranchAdminSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
  }),
  phone_number: Joi.string().optional(),
  branches_managed: Joi.array()
    .items(Joi.string().hex().length(24))
    .required()
    .messages({
      'array.base': 'Branches managed must be an array of IDs',
    })
    .optional(),
  addresses: Joi.array()
    .items(
      Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        country: Joi.string().required(),
        postal_code: Joi.string().optional(),
      })
    )
    .optional(),
});

export const updateBranchAdminSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
  phone_number: Joi.string().optional(),
  branches_managed: Joi.array().items(Joi.string().hex().length(24)).optional(),
  addresses: Joi.array()
    .items(
      Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        country: Joi.string().required(),
        postal_code: Joi.string().optional(),
      })
    )
    .optional(),
});
