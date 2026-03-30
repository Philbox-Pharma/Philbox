import Joi from 'joi';

export const addToCartSchema = Joi.object({
  medicineId: Joi.string().required().messages({
    'any.required': 'Medicine ID is required',
    'string.empty': 'Medicine ID cannot be empty',
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
  }),
});

export const updateCartItemSchema = Joi.object({
  itemId: Joi.string().required().messages({
    'any.required': 'Cart item ID is required',
    'string.empty': 'Cart item ID cannot be empty',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
  }),
});

export const removeCartItemSchema = Joi.object({
  itemId: Joi.string().required().messages({
    'any.required': 'Cart item ID is required',
    'string.empty': 'Cart item ID cannot be empty',
  }),
});
