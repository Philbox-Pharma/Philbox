import Joi from 'joi';

// Common date range validation
export const dateRangeQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});

// Timeline query validation
export const timelineQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  userId: Joi.string().optional(),
  actionType: Joi.string().optional(),
  userRole: Joi.string().valid('admin', 'salesperson').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

// Frequent actions query validation
export const frequentActionsQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  userRole: Joi.string().valid('admin', 'salesperson').optional(),
  topN: Joi.number().integer().min(5).max(50).default(10),
});

// Login attempts query validation
export const loginAttemptsQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});

// Suspicious activities query validation
export const suspiciousActivitiesQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Activity overview query validation
export const activityOverviewQueryDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});
