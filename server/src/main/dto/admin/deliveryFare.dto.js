import Joi from 'joi';

export const createDeliveryFareDTO = Joi.object({
  min_distance_km: Joi.number().min(0).required(),
  max_distance_km: Joi.number().min(0).allow(null),
  fare_amount: Joi.number().min(0).required(),
  is_active: Joi.boolean().default(true),
});

export const updateDeliveryFareDTO = Joi.object({
  min_distance_km: Joi.number().min(0),
  max_distance_km: Joi.number().min(0).allow(null),
  fare_amount: Joi.number().min(0),
  is_active: Joi.boolean(),
}).min(1);
