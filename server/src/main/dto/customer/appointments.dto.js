import Joi from 'joi';

/**
 * Validation for creating appointment request
 */
export const createAppointmentRequestSchema = Joi.object({
  doctor_id: Joi.string().required().messages({
    'any.required': 'Doctor ID is required',
    'string.empty': 'Doctor ID cannot be empty',
  }),

  slot_id: Joi.string().optional().messages({
    'string.base': 'Slot ID must be a valid string',
  }),

  appointment_type: Joi.string()
    .valid('in-person', 'online')
    .required()
    .messages({
      'any.required': 'Appointment type is required',
      'any.only': 'Appointment type must be either in-person or online',
    }),

  consultation_reason: Joi.string().required().min(10).max(500).messages({
    'any.required': 'Consultation reason is required',
    'string.empty': 'Consultation reason cannot be empty',
    'string.min': 'Consultation reason must be at least 10 characters',
    'string.max': 'Consultation reason cannot exceed 500 characters',
  }),

  preferred_date: Joi.date().required().min('now').messages({
    'any.required': 'Preferred date is required',
    'date.base': 'Preferred date must be a valid date',
    'date.min': 'Preferred date cannot be in the past',
  }),

  preferred_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base':
        'Preferred time must be in HH:mm format (e.g., 14:30)',
    }),
});

/**
 * Validation for getting my appointment requests
 */
export const getMyRequestsSchema = Joi.object({
  status: Joi.string()
    .valid('processing', 'accepted', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: processing, accepted, cancelled',
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

/**
 * Validation for canceling appointment request
 */
export const cancelRequestSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'any.required': 'Appointment ID is required',
    'string.empty': 'Appointment ID cannot be empty',
  }),

  cancellation_reason: Joi.string().optional().max(500).allow('').messages({
    'string.max': 'Cancellation reason cannot exceed 500 characters',
  }),
});

/**
 * Validation for getting appointment details
 */
export const getAppointmentDetailsSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'any.required': 'Appointment ID is required',
    'string.empty': 'Appointment ID cannot be empty',
  }),
});
