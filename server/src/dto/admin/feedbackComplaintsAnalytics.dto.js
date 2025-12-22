// 📘 dto/admin/feedbackComplaintsAnalytics.dto.js
import Joi from 'joi';

/**
 * DTO for fetching feedback and complaints analytics with date filters
 */
export const getFeedbackComplaintsAnalyticsDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
});

/**
 * DTO for exporting report data
 */
export const exportReportDataDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
});
