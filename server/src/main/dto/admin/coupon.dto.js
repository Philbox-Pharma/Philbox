import Joi from 'joi';

export const createCouponDTO = Joi.object({
  cupon_code: Joi.string().required().alphanum().min(3).max(20).messages({
    'string.empty': 'Coupon code is required',
    'string.alphanum': 'Coupon code must contain only letters and numbers',
    'string.min': 'Coupon code must be at least 3 characters',
    'string.max': 'Coupon code must not exceed 20 characters',
  }),
  expiry_time: Joi.date().required().greater('now').messages({
    'date.base': 'Expiry time must be a valid date',
    'date.greater': 'Expiry time must be in the future',
  }),
  percent_off: Joi.number().required().min(0).max(100).messages({
    'number.base': 'Discount percentage is required',
    'number.min': 'Discount percentage cannot be less than 0',
    'number.max': 'Discount percentage cannot exceed 100',
  }),
  for: Joi.string().required().valid('appointments', 'medicine').messages({
    'any.only': "Coupon type must be either 'appointments' or 'medicine'",
  }),
  max_use_limit: Joi.number().optional().min(1).messages({
    'number.min': 'Max use limit must be at least 1',
  }),
});

export const updateCouponDTO = Joi.object({
  expiry_time: Joi.date().optional().greater('now').messages({
    'date.base': 'Expiry time must be a valid date',
    'date.greater': 'Expiry time must be in the future',
  }),
  percent_off: Joi.number().optional().min(0).max(100).messages({
    'number.base': 'Discount percentage must be a number',
    'number.min': 'Discount percentage cannot be less than 0',
    'number.max': 'Discount percentage cannot exceed 100',
  }),
  is_active: Joi.boolean().optional(),
  max_use_limit: Joi.number().optional().min(1).messages({
    'number.min': 'Max use limit must be at least 1',
  }),
}).min(1);

export const validateCouponDTO = Joi.object({
  cupon_code: Joi.string().required().messages({
    'string.empty': 'Coupon code is required',
    'any.required': 'Coupon code is required',
  }),
  for: Joi.string().required().valid('appointments', 'medicine').messages({
    'any.only': "Coupon type must be either 'appointments' or 'medicine'",
    'any.required': 'Coupon type is required',
  }),
});
