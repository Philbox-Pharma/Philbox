import Joi from 'joi';

export const inventoryQuerySchema = Joi.object({
  search: Joi.string().optional(),
  branch_id: Joi.string().optional(),
  category: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const updateStockSchema = Joi.object({
  quantity: Joi.number().min(0).required(),
  reason: Joi.string().max(500).optional(),
});
