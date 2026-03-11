import Joi from 'joi';

/**
 * Validation for getting patient medical history
 */
export const getMedicalHistorySchema = Joi.object({
  patientId: Joi.string().required().messages({
    'any.required': 'Patient ID is required',
    'string.empty': 'Patient ID cannot be empty',
  }),

  startDate: Joi.date().iso().optional().messages({
    'date.base': 'Start date must be a valid date',
    'date.format': 'Start date must be in ISO format',
  }),

  endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
    'date.base': 'End date must be a valid date',
    'date.format': 'End date must be in ISO format',
    'date.min': 'End date must be after start date',
  }),

  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
});
