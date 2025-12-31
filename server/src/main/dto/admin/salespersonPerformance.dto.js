import Joi from 'joi';

/**
 * Validation for performance query parameters with filters
 */
export const performanceQueryDTO = Joi.object({
  branch_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'branch_id must be a valid MongoDB ObjectId',
    }),

  salesperson_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'salesperson_id must be a valid MongoDB ObjectId',
    }),

  startDate: Joi.date().iso().optional().messages({
    'date.format': 'startDate must be in ISO 8601 format',
  }),

  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.format': 'endDate must be in ISO 8601 format',
    'date.min': 'endDate must be greater than or equal to startDate',
  }),
});

/**
 * Validation for leaderboard query (no salesperson_id filter)
 */
export const leaderboardQueryDTO = Joi.object({
  branch_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'branch_id must be a valid MongoDB ObjectId',
    }),

  startDate: Joi.date().iso().optional().messages({
    'date.format': 'startDate must be in ISO 8601 format',
  }),

  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.format': 'endDate must be in ISO 8601 format',
    'date.min': 'endDate must be greater than or equal to startDate',
  }),
});
