import Joi from 'joi';

/**
 * Validation for getting doctor reviews with filters
 */
export const getReviewsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),

  sentiment: Joi.string()
    .valid('positive', 'negative', 'neutral')
    .optional()
    .messages({
      'any.only': 'Sentiment must be one of: positive, negative, neutral',
    }),

  start_date: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date',
  }),

  end_date: Joi.date().optional().min(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
  }),

  sort_by: Joi.string()
    .valid('created_at', 'rating')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, rating',
    }),

  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be one of: asc, desc',
  }),
});

/**
 * Validation for getting review statistics
 */
export const getReviewStatsSchema = Joi.object({
  start_date: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date',
  }),

  end_date: Joi.date().optional().min(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
  }),
});
