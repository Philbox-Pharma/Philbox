import Joi from 'joi';

/**
 * Validation schema to register/update device token
 */
export const registerDeviceTokenSchema = Joi.object({
  deviceToken: Joi.string().required().min(10),
  deviceType: Joi.string().valid('web', 'ios', 'android').required(),
  deviceName: Joi.string().optional().max(255),
}).unknown(true);

/**
 * Validation schema to update notification preferences
 */
export const updateNotificationPreferencesSchema = Joi.object({
  email: Joi.boolean().optional(),
  sms: Joi.boolean().optional(),
  push: Joi.boolean().optional(),
  refill_reminder: Joi.boolean().optional(),
  appointment_reminder: Joi.boolean().optional(),
  order_status: Joi.boolean().optional(),
  message_notifications: Joi.boolean().optional(),
  task_notifications: Joi.boolean().optional(),
  low_stock_alerts: Joi.boolean().optional(),
}).unknown(true);

/**
 * Validation schema for sending test notification
 */
export const sendTestNotificationSchema = Joi.object({
  method: Joi.string().valid('email', 'sms', 'push').required(),
  recipient: Joi.string().optional(), // Optional - will use default if not provided
}).unknown(true);
