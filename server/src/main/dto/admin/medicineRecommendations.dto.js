import Joi from 'joi';

export const getCustomerRecommendationsDTO = Joi.object({
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
    'string.empty': 'Customer ID cannot be empty',
  }),
});

export const recommendationsQueryDTO = Joi.object({
  limit: Joi.number().integer().min(5).max(20).default(8).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 5',
    'number.max': 'Limit cannot exceed 20',
  }),
});

export const recommendationsInsightsDTO = Joi.object({
  limit: Joi.number().integer().min(5).max(20).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 5',
    'number.max': 'Limit cannot exceed 20',
  }),
  days: Joi.number().integer().min(1).max(365).default(30).messages({
    'number.base': 'Days must be a number',
    'number.integer': 'Days must be an integer',
    'number.min': 'Days must be at least 1',
    'number.max': 'Days cannot exceed 365',
  }),
});
