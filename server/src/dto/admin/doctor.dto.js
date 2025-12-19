// 📘 dto/admin/doctor.dto.js
import Joi from 'joi';

/**
 * DTO for fetching doctors list with filters
 */
export const getDoctorsDTO = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  specialization: Joi.string().optional(),
  account_status: Joi.string()
    .valid('active', 'suspended/freezed', 'blocked/removed')
    .optional(),
  sortBy: Joi.string()
    .valid('fullName', 'created_at', 'averageRating', 'consultation_fee')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

/**
 * DTO for updating doctor profile
 */
export const updateDoctorProfileDTO = Joi.object({
  specialization: Joi.array().items(Joi.string()).optional(),
  consultation_fee: Joi.number().min(0).optional(),
  consultation_type: Joi.string()
    .valid('in-person', 'online', 'both')
    .optional(),
  affiliated_hospital: Joi.string().optional(),
  contactNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional(),
});

/**
 * DTO for suspending/activating doctor account
 */
export const updateDoctorStatusDTO = Joi.object({
  status: Joi.string()
    .valid('active', 'suspended/freezed', 'blocked/removed')
    .required(),
  reason: Joi.string().when('status', {
    is: Joi.valid('suspended/freezed', 'blocked/removed'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  sendNotification: Joi.boolean().optional().default(true),
});
