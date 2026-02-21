import Joi from 'joi';

/**
 * Validation for getting pending appointment requests
 */
export const getRequestsSchema = Joi.object({
  status: Joi.string()
    .valid('processing', 'accepted', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: processing, accepted, cancelled',
    }),

  start_date: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date',
  }),

  end_date: Joi.date().optional().min(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
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

/**
 * Validation for accepting appointment request
 */
export const acceptRequestSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'any.required': 'Appointment ID is required',
    'string.empty': 'Appointment ID cannot be empty',
  }),

  slot_id: Joi.string().optional().messages({
    'string.base': 'Slot ID must be a valid string',
  }),

  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters',
  }),
});

/**
 * Validation for rejecting appointment request
 */
export const rejectRequestSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'any.required': 'Appointment ID is required',
    'string.empty': 'Appointment ID cannot be empty',
  }),

  rejection_reason: Joi.string().required().min(10).max(500).messages({
    'any.required': 'Rejection reason is required',
    'string.empty': 'Rejection reason cannot be empty',
    'string.min': 'Rejection reason must be at least 10 characters',
    'string.max': 'Rejection reason cannot exceed 500 characters',
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
