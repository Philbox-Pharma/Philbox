import Joi from 'joi';

/**
 * DTO for getting customers list with filters
 */
export const getCustomersDTO = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  account_status: Joi.string().valid(
    'active',
    'suspended/freezed',
    'blocked/removed'
  ),
  is_Verified: Joi.string().valid('true', 'false'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  branchId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
});

/**
 * DTO for updating customer status
 */
export const toggleCustomerStatusDTO = Joi.object({
  status: Joi.string()
    .valid('active', 'suspended/freezed', 'blocked/removed')
    .required(),
  reason: Joi.string().trim().min(10).max(500).allow(''),
});

/**
 * DTO for getting customer metrics
 */
export const getCustomerMetricsDTO = Joi.object({
  branchId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
});
