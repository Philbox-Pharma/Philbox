import Joi from 'joi';

/**
 * DTO for updating task status
 */
export const updateTaskStatusDto = Joi.object({
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only':
        'Status must be one of: pending, in-progress, completed, cancelled',
    }),
});

/**
 * DTO for adding task update/comment
 */
export const addTaskUpdateDto = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 1 character',
    'string.max': 'Message cannot exceed 1000 characters',
    'any.required': 'Message is required',
  }),
});
