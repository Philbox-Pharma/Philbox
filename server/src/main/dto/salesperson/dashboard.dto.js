import Joi from 'joi';

export const getDashboardQueryDto = Joi.object({
  activityLimit: Joi.number().integer().min(1).max(50).default(10),
});
