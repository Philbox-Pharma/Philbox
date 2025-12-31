import Joi from 'joi';

// Create task DTO
export const createTaskDTO = Joi.object({
  salesperson_id: Joi.string().required().messages({
    'string.empty': 'Salesperson ID is required',
    'any.required': 'Salesperson ID is required',
  }),
  branch_id: Joi.string().required().messages({
    'string.empty': 'Branch ID is required',
    'any.required': 'Branch ID is required',
  }),
  title: Joi.string().required().trim().min(3).max(200).messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().trim().max(1000).optional().allow(''),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .optional(),
  deadline: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Deadline must be a valid date',
    'date.greater': 'Deadline must be in the future',
    'any.required': 'Deadline is required',
  }),
});

// Update task DTO
export const updateTaskDTO = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  deadline: Joi.date().iso().optional(),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .optional(),
}).min(1);

// Add task update DTO
export const addTaskUpdateDTO = Joi.object({
  message: Joi.string().required().trim().min(1).max(500).messages({
    'string.empty': 'Update message is required',
    'string.min': 'Update message must not be empty',
    'string.max': 'Update message must not exceed 500 characters',
  }),
});

// Query tasks DTO
export const queryTasksDTO = Joi.object({
  salesperson_id: Joi.string().optional(),
  branch_id: Joi.string().optional(),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Get statistics DTO
export const getStatisticsDTO = Joi.object({
  branch_id: Joi.string().optional(),
  salesperson_id: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});
