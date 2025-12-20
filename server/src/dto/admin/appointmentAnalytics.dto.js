// 📘 dto/admin/appointmentAnalytics.dto.js
import Joi from 'joi';

/**
 * DTO for fetching appointment analytics
 */
export const getAppointmentAnalyticsDTO = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')),
  period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
});

/**
 * DTO for aggregating appointment data
 */
export const aggregateAppointmentsDTO = Joi.object({
  date: Joi.date().iso().required(),
});
