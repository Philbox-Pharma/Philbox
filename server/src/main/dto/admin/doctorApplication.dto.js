import Joi from 'joi';

/**
 * DTO for approving a doctor application
 */
export const approveDoctorApplicationDTO = Joi.object({
  comment: Joi.string().max(500).optional().allow(''),
});

/**
 * DTO for rejecting a doctor application
 */
export const rejectDoctorApplicationDTO = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Reason for rejection is required',
    'string.min': 'Reason must be at least 10 characters long',
    'string.max': 'Reason must not exceed 500 characters',
    'any.required': 'Reason for rejection is required',
  }),
});

/**
 * DTO for fetching doctor applications with filters
 */
export const getDoctorApplicationsDTO = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  status: Joi.string()
    .valid('pending', 'processing', 'approved', 'rejected')
    .optional()
    .default('pending'),
});
