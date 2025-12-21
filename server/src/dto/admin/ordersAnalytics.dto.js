// 📘 dto/admin/ordersAnalytics.dto.js
import Joi from 'joi';

/**
 * DTO for fetching orders analytics
 */
export const getOrdersAnalyticsDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
  branchId: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
