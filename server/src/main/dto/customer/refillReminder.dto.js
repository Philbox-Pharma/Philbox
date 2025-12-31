import Joi from 'joi';

/**
 * DTO for creating a refill reminder
 */
export const createRefillReminderDTO = Joi.object({
  medicines: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.base': 'Medicines must be an array',
      'array.min': 'At least one medicine is required',
      'any.required': 'Medicines are required',
    }),
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .required()
    .messages({
      'any.required': 'Frequency is required',
      'any.only': 'Frequency must be one of: daily, weekly, monthly',
    }),
  timeOfDay: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'any.required': 'Time of day is required',
      'string.pattern.base':
        'Time must be in 24-hour format (HH:MM), e.g., "08:00" or "18:30"',
    }),
  notificationMethod: Joi.string()
    .valid('email', 'sms', 'push')
    .required()
    .messages({
      'any.required': 'Notification method is required',
      'any.only': 'Notification method must be one of: email, sms, push',
    }),
});

/**
 * DTO for updating a refill reminder
 */
export const updateRefillReminderDTO = Joi.object({
  medicines: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .optional()
    .messages({
      'array.base': 'Medicines must be an array',
      'array.min': 'At least one medicine is required',
    }),
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .optional()
    .messages({
      'any.only': 'Frequency must be one of: daily, weekly, monthly',
    }),
  timeOfDay: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base':
        'Time must be in 24-hour format (HH:MM), e.g., "08:00" or "18:30"',
    }),
  notificationMethod: Joi.string()
    .valid('email', 'sms', 'push')
    .optional()
    .messages({
      'any.only': 'Notification method must be one of: email, sms, push',
    }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean',
  }),
}).min(1);

/**
 * DTO for marking reminder as completed
 */
export const markCompletedDTO = Joi.object({
  isActive: Joi.boolean().valid(false).required().messages({
    'any.required': 'isActive field is required',
    'any.only': 'isActive must be false to mark as completed',
  }),
});
