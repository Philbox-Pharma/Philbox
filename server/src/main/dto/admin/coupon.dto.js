import Joi from 'joi';

export const createCouponDTO = Joi.object({
  cupon_code: Joi.string().required().alphanum().min(3).max(20).messages({
    'string.empty': 'Coupon code is required',
    'string.alphanum': 'Coupon code must contain only letters and numbers',
    'string.min': 'Coupon code must be at least 3 characters',
    'string.max': 'Coupon code must not exceed 20 characters',
  }),
  discount_type: Joi.string().required().valid('percentage', 'fixed').messages({
    'any.only': "Discount type must be either 'percentage' or 'fixed'",
  }),
  discount_value: Joi.number().required().min(0).messages({
    'number.base': 'Discount value is required',
    'number.min': 'Discount value cannot be less than 0',
  }),
  min_order_amount: Joi.number().optional().min(0).default(0),
  max_discount: Joi.number().optional().min(0).allow(null),
  expiry_time: Joi.date().required().greater('now').messages({
    'date.base': 'Expiry time must be a valid date',
    'date.greater': 'Expiry time must be in the future',
  }),
  for: Joi.string().required().valid('appointments', 'medicine', 'all').messages({
    'any.only': "Coupon valid for must be 'appointments', 'medicine', or 'all'",
  }),
  max_use_limit: Joi.number().optional().min(1).allow(null).messages({
    'number.min': 'Max use limit must be at least 1',
  }),
});

export const updateCouponDTO = Joi.object({
  discount_type: Joi.string().optional().valid('percentage', 'fixed'),
  discount_value: Joi.number().optional().min(0),
  min_order_amount: Joi.number().optional().min(0),
  max_discount: Joi.number().optional().min(0).allow(null),
  expiry_time: Joi.date().optional().greater('now').messages({
    'date.base': 'Expiry time must be a valid date',
    'date.greater': 'Expiry time must be in the future',
  }),
  for: Joi.string().optional().valid('appointments', 'medicine', 'all'),
  is_active: Joi.boolean().optional(),
  max_use_limit: Joi.number().optional().min(1).allow(null).messages({
    'number.min': 'Max use limit must be at least 1',
  }),
}).min(1);

export const validateCouponDTO = Joi.object({
  cupon_code: Joi.string().required().messages({
    'string.empty': 'Coupon code is required',
    'any.required': 'Coupon code is required',
  }),
  for: Joi.string().required().valid('appointments', 'medicine', 'all').messages({
    'any.only': "Coupon type must be either 'appointments', 'medicine', or 'all'",
    'any.required': 'Coupon type is required',
  }),
});
