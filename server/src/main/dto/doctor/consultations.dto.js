import Joi from 'joi';

/**
 * Validation for getting past consultations with filters
 */
export const getPastConsultationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),

  patient_name: Joi.string().optional().trim().messages({
    'string.base': 'Patient name must be a string',
  }),

  start_date: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date',
  }),

  end_date: Joi.date().optional().min(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
  }),

  sort_by: Joi.string()
    .valid('created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at',
    }),

  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be one of: asc, desc',
  }),
});

/**
 * Validation for getting consultation details
 */
export const getConsultationDetailsSchema = Joi.object({
  consultationId: Joi.string().required().messages({
    'any.required': 'Consultation ID is required',
    'string.empty': 'Consultation ID cannot be empty',
  }),
});

/**
 * Validation for getting prescription details
 */
export const getPrescriptionDetailsSchema = Joi.object({
  prescriptionId: Joi.string().required().messages({
    'any.required': 'Prescription ID is required',
    'string.empty': 'Prescription ID cannot be empty',
  }),
});

/**
 * Validation for getting consultation statistics
 */
export const getConsultationStatsSchema = Joi.object({
  start_date: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date',
  }),

  end_date: Joi.date().optional().min(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
  }),
});
