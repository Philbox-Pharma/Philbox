import Joi from 'joi';

export const checkoutSummaryQueryDTO = Joi.object({
  address_id: Joi.string().optional(),
  delivery_google_map_link: Joi.string().uri().optional().trim(),
  coupon_code: Joi.string().optional().trim(),
});

export const placeOrderDTO = Joi.object({
  address_id: Joi.string().optional(),
  delivery_google_map_link: Joi.string().uri().optional().trim(),
  coupon_code: Joi.string().optional().allow('', null).trim(),
  payment_method: Joi.string()
    .valid('jazzcash', 'easypaisa', 'stripe')
    .required(),
  wallet_number: Joi.string().optional().allow('', null).trim(),
  stripe_payment_method_id: Joi.string().optional().allow('', null).trim(),
  prescription_id: Joi.string().optional(),
  notes: Joi.string().max(500).optional().allow('', null),
}).or('address_id', 'delivery_google_map_link');

export const uploadPrescriptionDTO = Joi.object({
  notes: Joi.string().max(500).optional().allow('', null),
});
