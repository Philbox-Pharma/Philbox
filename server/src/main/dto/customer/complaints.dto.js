import Joi from 'joi';

export const createComplaintSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  description: Joi.string().trim().min(10).max(2000).required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
  }),
  category: Joi.string()
    .valid('order_issue', 'doctor_issue', 'payment', 'other')
    .required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  customer_address_id: Joi.string().optional(),
});

export const listComplaintsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid('pending', 'in-progress', 'in_progress', 'resolved', 'closed')
    .optional(),
  category: Joi.string()
    .valid('order_issue', 'doctor_issue', 'payment', 'other')
    .optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
});

export const complaintIdParamSchema = Joi.object({
  complaintId: Joi.string().required().messages({
    'any.required': 'Complaint ID is required',
  }),
});

export const addComplaintMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required().messages({
    'any.required': 'Message is required',
    'string.empty': 'Message is required',
  }),
});

export const rateComplaintResolutionSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  feedback: Joi.string().trim().max(500).allow('', null).optional(),
});
