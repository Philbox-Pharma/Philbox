import Joi from 'joi';

export const lowStockListQuerySchema = Joi.object({
  branchId: Joi.string().hex().length(24).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const lowStockCountQuerySchema = Joi.object({
  branchId: Joi.string().hex().length(24).optional(),
});

export const updateThresholdSchema = Joi.object({
  threshold: Joi.number().min(1).max(1000).required(),
});
