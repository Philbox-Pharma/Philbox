// 📘 dto/pagination.dto.js
import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow('').optional(),
  status: Joi.string().trim().optional(),
  branch: Joi.string().trim().optional(),
});
