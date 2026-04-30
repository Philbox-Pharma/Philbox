import express from 'express';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
  getDeviceTokens,
  getNotifications,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notifications.controller.js';
import { authenticateAnyRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateAnyRole);

/**
 * @route   POST /api/notifications/device-tokens/register
 * @desc    Register a device token for push notifications
 * @access  Private
 * @body    deviceToken (string, required), deviceType (web|ios|android, required), deviceName (string, optional)
 */
router.post('/device-tokens/register', registerDeviceToken);

/**
 * @route   DELETE /api/notifications/device-tokens/:tokenId
 * @desc    Unregister a device token
 * @access  Private
 * @params  tokenId (string, required)
 */
router.delete('/device-tokens/:tokenId', unregisterDeviceToken);

/**
 * @route   GET /api/notifications/device-tokens
 * @desc    Get all device tokens for authenticated user
 * @access  Private
 */
router.get('/device-tokens', getDeviceTokens);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences for authenticated user
 * @access  Private
 */
router.get('/preferences', getNotificationPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences for authenticated user
 * @access  Private
 * @body    Various boolean flags for notification types (email, sms, push, etc.)
 */
router.put('/preferences', updateNotificationPreferences);

/**
 * @route   POST /api/notifications/test
 * @desc    Send a test notification to user (email, SMS, or push)
 * @access  Private
 * @body    method (email|sms|push, required), recipient (string, optional - uses user's email/phone/id by default)
 */
router.post('/test', sendTestNotification);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for authenticated user with pagination and filters
 * @access  Private
 * @query   page (number, default: 1), limit (number, default: 10), type (string, optional),
 *          readStatus (read|unread|all, optional), sortBy (string, default: created_at), sortOrder (asc|desc, default: desc)
 */
router.get('/', getNotifications);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification by ID
 * @access  Private
 * @params  id (string, required)
 */
router.get('/:id', getNotification);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 * @params  id (string, required)
 */
router.patch('/:id/read', markNotificationAsRead);

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for authenticated user
 * @access  Private
 */
router.post('/mark-all-read', markAllNotificationsAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 * @params  id (string, required)
 */
router.delete('/:id', deleteNotification);

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for authenticated user
 * @access  Private
 */
router.delete('/', deleteAllNotifications);

export default router;
