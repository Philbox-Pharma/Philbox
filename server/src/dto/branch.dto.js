import Joi from "joi";

export const createBranchDTO = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Branch name must be a string",
    "any.required": "Branch name is required",
  }),

  city: Joi.string().optional().trim().messages({
    "string.base": "City must be a string",
  }),

  province: Joi.string().optional().trim().messages({
    "string.base": "Province must be a string",
  }),

  country: Joi.string().optional().trim().messages({
    "string.base": "Country must be a string",
  }),

  street: Joi.string().optional().trim().messages({
    "string.base": "Street must be a string",
  }),

  town: Joi.string().optional().trim().messages({
    "string.base": "Town must be a string",
  }),

  zip_code: Joi.string().optional().trim().messages({
    "string.base": "Zip code must be a string",
  }),

  google_map_link: Joi.string().uri().optional().messages({
    "string.uri": "Google Map link must be a valid URL",
  }),

  under_administration_of: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      "array.base": "under_administration_of must be an array of admin IDs",
      "string.length": "Each admin ID must be a valid ObjectId",
    }),
});

export const updateBranchDTO = Joi.object({
  name: Joi.string().trim().optional().messages({
    "string.base": "Branch name must be a string",
  }),

  status: Joi.string().valid("Active", "Inactive").optional().messages({
    "any.only": "Status must be either 'Active' or 'Inactive'",
  }),

  under_administration_of: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      "array.base": "under_administration_of must be an array of admin IDs",
      "string.length": "Each admin ID must be a valid ObjectId",
    }),

  // Address fields (optional)
  street: Joi.string().optional().trim(),
  town: Joi.string().optional().trim(),
  city: Joi.string().optional().trim(),
  province: Joi.string().optional().trim(),
  zip_code: Joi.string().optional().trim(),
  country: Joi.string().optional().trim(),
  google_map_link: Joi.string().uri().optional(),
});

export const branchQueryDTO = Joi.object({
  search: Joi.string().optional().trim(),
  status: Joi.string().valid("Active", "Inactive").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
