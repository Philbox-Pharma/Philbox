import Joi from 'joi';

/**
 * DTO for saving a search query
 */
export const saveSearchDTO = Joi.object({
  query: Joi.string().required().trim().min(1).messages({
    'any.required': 'Search query is required',
    'string.empty': 'Search query cannot be empty',
    'string.min': 'Search query must have at least 1 character',
  }),
  filters: Joi.object({
    category: Joi.string().trim().optional(),
    brand: Joi.string().trim().optional(),
    dosageForm: Joi.string().trim().optional(),
    prescriptionRequired: Joi.boolean().optional(),
  }).optional(),
});

/**
 * DTO for fetching autocomplete suggestions
 */
export const searchSuggestionsDTO = Joi.object({
  query: Joi.string().required().trim().min(1).messages({
    'any.required': 'Search query is required',
    'string.empty': 'Search query cannot be empty',
    'string.min': 'Search query must have at least 1 character',
  }),
  limit: Joi.number().integer().min(5).max(20).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 5',
    'number.max': 'Limit cannot exceed 20',
  }),
});

/**
 * DTO for deleting a single search history item
 */
export const deleteSearchDTO = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Search history ID is required',
    'string.empty': 'Search history ID cannot be empty',
  }),
});
