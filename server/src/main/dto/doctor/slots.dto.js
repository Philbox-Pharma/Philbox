import Joi from 'joi';

/**
 * Helper function to convert HH:mm to minutes
 */
const timeToMinutes = timeStr => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

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

  slot_duration: Joi.number().integer().min(5).max(120).default(20).messages({
    'number.min': 'Slot duration must be at least 5 minutes',
    'number.max': 'Slot duration must not exceed 120 minutes',
    'number.unsafe': 'Slot duration must be a whole number',
  }),

  notes: Joi.string().max(500).allow('').optional(),
}).custom((value, helpers) => {
  // Validate that time range exactly matches slot_duration
  const startMinutes = timeToMinutes(value.start_time);
  const endMinutes = timeToMinutes(value.end_time);
  const duration = endMinutes - startMinutes;

  if (duration <= 0) {
    return helpers.message('End time must be after start time');
  }

  if (duration !== value.slot_duration) {
    return helpers.message(
      `Time range (${duration} minutes) must be exactly equal to slot duration (${value.slot_duration} minutes)`
    );
  }

  return value;
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

  slot_duration: Joi.number().integer().min(5).max(120).default(20).messages({
    'number.min': 'Slot duration must be at least 5 minutes',
    'number.max': 'Slot duration must not exceed 120 minutes',
    'number.unsafe': 'Slot duration must be a whole number',
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
}).custom((value, helpers) => {
  // Validate that time range exactly matches slot_duration
  const startMinutes = timeToMinutes(value.start_time);
  const endMinutes = timeToMinutes(value.end_time);
  const duration = endMinutes - startMinutes;

  if (duration <= 0) {
    return helpers.message('End time must be after start time');
  }

  if (duration !== value.slot_duration) {
    return helpers.message(
      `Time range (${duration} minutes) must be exactly equal to slot duration (${value.slot_duration} minutes)`
    );
  }

  return value;
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

  slot_duration: Joi.number().integer().min(5).max(120).optional().messages({
    'number.min': 'Slot duration must be at least 5 minutes',
    'number.max': 'Slot duration must not exceed 120 minutes',
    'number.unsafe': 'Slot duration must be a whole number',
  }),

  status: Joi.string().valid('booked', 'unbooked').optional().messages({
    'any.only': 'Status must be either booked or unbooked',
  }),

  notes: Joi.string().max(500).allow('').optional(),
})
  .min(1)
  .custom((value, helpers) => {
    // If both start_time and end_time (and slot_duration) are provided, validate exact match
    if (value.start_time && value.end_time && value.slot_duration) {
      const startMinutes = timeToMinutes(value.start_time);
      const endMinutes = timeToMinutes(value.end_time);
      const duration = endMinutes - startMinutes;

      if (duration <= 0) {
        return helpers.message('End time must be after start time');
      }

      if (duration !== value.slot_duration) {
        return helpers.message(
          `Time range (${duration} minutes) must be exactly equal to slot duration (${value.slot_duration} minutes)`
        );
      }
    }

    return value;
  });

/**
 * Validation for querying slots
 */
export const getSlotSchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional().greater(Joi.ref('start_date')).messages({
    'date.greater': 'End date must be after start date',
  }),
  status: Joi.string().valid('booked', 'unbooked').optional(),
});
