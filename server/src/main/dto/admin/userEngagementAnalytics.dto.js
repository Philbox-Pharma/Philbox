// 📘 dto/admin/userEngagementAnalytics.dto.js
import Joi from 'joi';

/**
 * DTO for fetching user engagement analytics
 */
export const getUserEngagementAnalyticsDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
  branchId: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

/**
 * DTO for top customers analytics
 */
export const getTopCustomersDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  metric: Joi.string().valid('appointments', 'orders', 'both').optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  branchId: Joi.string().optional(),
});
