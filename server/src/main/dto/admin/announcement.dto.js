import Joi from 'joi';

export const createAnnouncementDTO = Joi.object({
  title: Joi.string().required().trim().min(3).max(200).messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must not exceed 200 characters',
  }),
  message: Joi.string().required().trim().min(10).max(5000).messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message must not exceed 5000 characters',
  }),
  target_audience: Joi.string()
    .required()
    .valid('all', 'customers', 'doctors', 'salespersons')
    .messages({
      'any.only':
        "Target audience must be one of: 'all', 'customers', 'doctors', 'salespersons'",
    }),
  delivery_methods: Joi.array()
    .required()
    .min(1)
    .items(Joi.string().valid('email', 'sms', 'push', 'in-app'))
    .messages({
      'array.min': 'At least one delivery method must be selected',
      'any.only':
        "Delivery methods must be one of: 'email', 'sms', 'push', 'in-app'",
    }),
  scheduled_at: Joi.date().required().min('now').messages({
    'date.base': 'Scheduled time must be a valid date',
    'date.min': 'Scheduled time must be in the future',
  }),
  notes: Joi.string().optional().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters',
  }),
});

export const updateAnnouncementDTO = Joi.object({
  title: Joi.string().optional().trim().min(3).max(200).messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must not exceed 200 characters',
  }),
  message: Joi.string().optional().trim().min(10).max(5000).messages({
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message must not exceed 5000 characters',
  }),
  target_audience: Joi.string()
    .optional()
    .valid('all', 'customers', 'doctors', 'salespersons')
    .messages({
      'any.only':
        "Target audience must be one of: 'all', 'customers', 'doctors', 'salespersons'",
    }),
  delivery_methods: Joi.array()
    .optional()
    .min(1)
    .items(Joi.string().valid('email', 'sms', 'push', 'in-app'))
    .messages({
      'array.min': 'At least one delivery method must be selected',
      'any.only':
        "Delivery methods must be one of: 'email', 'sms', 'push', 'in-app'",
    }),
  scheduled_at: Joi.date().optional().min('now').messages({
    'date.base': 'Scheduled time must be a valid date',
    'date.min': 'Scheduled time must be in the future',
  }),
  notes: Joi.string().optional().trim().max(1000).messages({
    'string.max': 'Notes must not exceed 1000 characters',
  }),
}).min(1);

export const getAnnouncementsDTO = Joi.object({
  status: Joi.string()
    .optional()
    .valid('draft', 'scheduled', 'sent', 'failed', 'cancelled')
    .messages({
      'any.only':
        "Status must be one of: 'draft', 'scheduled', 'sent', 'failed', 'cancelled'",
    }),
  target_audience: Joi.string()
    .optional()
    .valid('all', 'customers', 'doctors', 'salespersons')
    .messages({
      'any.only':
        "Target audience must be one of: 'all', 'customers', 'doctors', 'salespersons'",
    }),
  skip: Joi.number().optional().min(0).default(0),
  limit: Joi.number().optional().min(1).max(100).default(20),
});

export const sendAnnouncementDTO = Joi.object({
  send_immediately: Joi.boolean().optional().default(false),
});
