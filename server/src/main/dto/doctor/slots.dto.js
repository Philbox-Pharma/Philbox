import Joi from 'joi';

/**
 * Validation for creating a single slot
 */
export const createSlotSchema = Joi.object({
  date: Joi.date().required().min('now').messages({
    'date.base': 'Date must be a valid date',
    'date.min': 'Date cannot be in the past',
    'any.required': 'Date is required',
  }),

  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
      'any.required': 'Start time is required',
    }),

  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format (e.g., 17:00)',
      'any.required': 'End time is required',
    }),

  slot_duration: Joi.number().valid(15, 30, 60).default(30).messages({
    'any.only': 'Slot duration must be 15, 30, or 60 minutes',
  }),

  notes: Joi.string().max(500).allow('').optional(),
});

/**
 * Validation for creating recurring slots
 */
export const createRecurringSlotSchema = Joi.object({
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
      'any.required': 'Start time is required',
    }),

  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format (e.g., 17:00)',
      'any.required': 'End time is required',
    }),

  slot_duration: Joi.number().valid(15, 30, 60).default(30).messages({
    'any.only': 'Slot duration must be 15, 30, or 60 minutes',
  }),

  recurring_pattern: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').required(),

    days_of_week: Joi.array()
      .items(Joi.number().min(0).max(6))
      .when('frequency', {
        is: 'weekly',
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'array.base': 'Days of week must be an array',
        'number.min': 'Day must be between 0 (Sunday) and 6 (Saturday)',
        'number.max': 'Day must be between 0 (Sunday) and 6 (Saturday)',
      }),

    start_date: Joi.date().required().min('now').messages({
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required',
    }),

    end_date: Joi.date().required().greater(Joi.ref('start_date')).messages({
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
  }).required(),

  notes: Joi.string().max(500).allow('').optional(),
});

/**
 * Validation for updating a slot
 */
export const updateSlotSchema = Joi.object({
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
    }),

  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format (e.g., 17:00)',
    }),

  slot_duration: Joi.number().valid(15, 30, 60).optional().messages({
    'any.only': 'Slot duration must be 15, 30, or 60 minutes',
  }),

  status: Joi.string().valid('available', 'unavailable').optional().messages({
    'any.only': 'Status must be either available or unavailable',
  }),

  notes: Joi.string().max(500).allow('').optional(),
}).min(1);

/**
 * Validation for querying slots
 */
export const getSlotSchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional().greater(Joi.ref('start_date')).messages({
    'date.greater': 'End date must be after start date',
  }),
  status: Joi.string().valid('available', 'booked', 'unavailable').optional(),
});
