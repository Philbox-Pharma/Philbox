import { sendRefillReminderEmail } from './sendEmail.js';
import DeviceToken from '../models/DeviceToken.js';
import NotificationPreference from '../models/NotificationPreference.js';
import NotificationLog from '../models/NotificationLog.js';
import dotenv from 'dotenv';

dotenv.config();

let firebaseAdmin = null;

// SMS Rate Limiting Configuration (in-memory)
const SMS_RATE_LIMIT = {
  max: 5, // Maximum 5 SMS per window
  window: 15 * 60 * 1000, // 15 minutes
};
const smsHistory = new Map(); // Maps phone number -> array of timestamps

// Try to initialize Firebase Admin SDK
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const firebaseServiceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (projectId && firebaseServiceAccountRaw) {
    let firebaseAccountJson = null;

    try {
      firebaseAccountJson = JSON.parse(firebaseServiceAccountRaw);
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. Ensure it is a single-line valid JSON string.'
      );
    }

    if (
      firebaseAccountJson.private_key &&
      typeof firebaseAccountJson.private_key === 'string'
    ) {
      // Handle escaped newlines when JSON is copied into .env.
      firebaseAccountJson.private_key = firebaseAccountJson.private_key.replace(
        /\\n/g,
        '\n'
      );
    }

    const admin = await import('firebase-admin');
    firebaseAdmin = admin.default;

    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(firebaseAccountJson),
        projectId,
      });
    }
    console.log('✅ Firebase Admin SDK initialized');
  } else {
    console.warn(
      '⚠️ Firebase Admin SDK not initialized. Missing FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_JSON.'
    );
  }
} catch (error) {
  console.warn(
    '⚠️ Firebase Admin SDK not initialized. Push notifications will be queued only:',
    error.message
  );
}

class NotificationService {
  /**
   * Check if SMS is within rate limit for a phone number
   * @private
   */
  _checkSMSRateLimit(to) {
    const now = Date.now();
    const cutoffTime = now - SMS_RATE_LIMIT.window;

    // Get historical timestamps for this phone, filter out old ones
    if (smsHistory.has(to)) {
      smsHistory.set(
        to,
        smsHistory.get(to).filter(timestamp => timestamp > cutoffTime)
      );
    }

    // If no history, initialize empty array
    if (!smsHistory.has(to)) {
      smsHistory.set(to, []);
    }

    const history = smsHistory.get(to);

    // Check if limit exceeded
    if (history.length >= SMS_RATE_LIMIT.max) {
      const oldestTimestamp = history[0];
      const retryAfter = Math.ceil(
        (oldestTimestamp + SMS_RATE_LIMIT.window - now) / 1000
      );
      return {
        allowed: false,
        retryAfter,
      };
    }

    return { allowed: true };
  }

  /**
   * Record SMS sent for rate limiting
   * @private
   */
  _recordSMSSent(to) {
    if (!smsHistory.has(to)) {
      smsHistory.set(to, []);
    }
    smsHistory.get(to).push(Date.now());
  }

  /**
   * Send SMS notification using Twilio
   */
  async sendSMS(to, message) {
    try {
      // Check rate limit
      const rateCheckResult = this._checkSMSRateLimit(to);
      if (!rateCheckResult.allowed) {
        console.warn(
          `SMS rate limit exceeded for ${to}. Retry after ${rateCheckResult.retryAfter}s`
        );
        return {
          success: false,
          error: `SMS rate limit exceeded. Please try again in ${rateCheckResult.retryAfter} seconds.`,
          retryAfter: rateCheckResult.retryAfter,
        };
      }

      // Check if Twilio credentials are configured
      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER
      ) {
        console.warn('Twilio credentials not configured');
        return {
          success: false,
          error: 'SMS service not configured',
        };
      }

      // Import Twilio dynamically to avoid errors if not installed
      const twilio = await import('twilio');
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const sms = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      // Record SMS sent for rate limiting
      this._recordSMSSent(to);

      console.log('SMS sent successfully. SID:', sms.sid);
      return { success: true, messageId: sms.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification via FCM
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Get user's device tokens
      const deviceTokens = await DeviceToken.find(
        {
          user_id: userId,
          is_active: true,
        },
        { token: 1 }
      ).lean();

      if (!deviceTokens || deviceTokens.length === 0) {
        console.log(`No active device tokens found for user ${userId}`);
        return {
          success: false,
          message: 'No active device tokens',
          tokensCount: 0,
        };
      }

      const tokens = deviceTokens.map(dt => dt.token);

      // If Firebase is initialized, send via FCM
      if (firebaseAdmin) {
        try {
          const message = {
            notification: {
              title,
              body,
            },
            data: Object.entries(data).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {}),
          };

          const messaging = firebaseAdmin.messaging();
          const multicastMessage = {
            tokens,
            ...message,
          };

          const response = messaging.sendEachForMulticast
            ? await messaging.sendEachForMulticast(multicastMessage)
            : await messaging.sendMulticast(multicastMessage);

          console.log(
            `✅ Push notification sent to ${response.successCount}/${tokens.length} devices`
          );

          // Log failed tokens for cleanup
          if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                console.error(
                  `Failed to send to token ${tokens[idx]}: ${resp.error.code}`
                );
                // Mark token as inactive if invalid
                if (
                  resp.error.code === 'messaging/invalid-registration-token' ||
                  resp.error.code === 'messaging/invalid-argument' ||
                  resp.error.code ===
                    'messaging/registration-token-not-registered'
                ) {
                  DeviceToken.updateOne(
                    { token: tokens[idx] },
                    { is_active: false }
                  ).catch(err =>
                    console.error('Error marking token inactive:', err)
                  );
                }
              }
            });
          }

          return {
            success: true,
            message: 'Push notification sent via FCM',
            successCount: response.successCount,
            failureCount: response.failureCount,
            tokensCount: tokens.length,
          };
        } catch (fcmError) {
          console.error('FCM error:', fcmError);
          // Fall back to queued status
          return {
            success: false,
            message: 'FCM delivery failed, notification queued',
            error: fcmError.message,
            tokensCount: tokens.length,
          };
        }
      } else {
        // Firebase not initialized - queue notification for later delivery
        console.log(
          `⏳ Push notification queued for ${tokens.length} device(s) (Firebase not initialized)`
        );
        return {
          success: true,
          message:
            'Push notification queued (Firebase credentials not configured)',
          queued: true,
          tokensCount: tokens.length,
        };
      }
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register or update device token
   */
  async registerDeviceToken(
    userId,
    userType,
    token,
    deviceType = 'web',
    deviceName = null,
    userAgent = null
  ) {
    try {
      const existingToken = await DeviceToken.findOne({
        user_id: userId,
        token,
      });

      if (existingToken) {
        // Update last used time
        existingToken.last_used_at = new Date();
        existingToken.is_active = true;
        if (deviceName) existingToken.device_name = deviceName;
        if (userAgent) existingToken.user_agent = userAgent;
        await existingToken.save();
      } else {
        // Create new token
        await DeviceToken.create({
          user_id: userId,
          user_type: userType,
          token,
          device_type: deviceType,
          device_name: deviceName,
          user_agent: userAgent,
        });
      }

      console.log(`✅ Device token registered for user ${userId}`);
      return { success: true, message: 'Device token registered' };
    } catch (error) {
      console.error('Error registering device token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token) {
    try {
      const result = await DeviceToken.findOneAndUpdate(
        { token },
        { is_active: false, last_used_at: new Date() },
        { new: true }
      );

      if (result) {
        console.log(`✅ Device token unregistered`);
        return { success: true };
      } else {
        return { success: false, error: 'Token not found' };
      }
    } catch (error) {
      console.error('Error unregistering device token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(userId, userType) {
    try {
      let preferences = await NotificationPreference.findOne({
        user_id: userId,
        user_type: userType,
      });

      if (!preferences) {
        // Create default preferences if not found
        preferences = await NotificationPreference.create({
          user_id: userId,
          user_type: userType,
        });
      }

      return { success: true, data: preferences };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(userId, userType, updates) {
    try {
      const preferences = await NotificationPreference.findOneAndUpdate(
        { user_id: userId, user_type: userType },
        { $set: updates },
        { new: true, upsert: true }
      );

      console.log(`✅ Notification preferences updated for user ${userId}`);
      return { success: true, data: preferences };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log notification delivery
   */
  async logNotification(
    userId,
    userType,
    notificationType,
    title,
    message,
    data = {},
    channelsSent = [],
    status = 'sent',
    errorMessage = null
  ) {
    try {
      await NotificationLog.create({
        user_id: userId,
        user_type: userType,
        notification_type: notificationType,
        title,
        message,
        data,
        channels_sent: channelsSent,
        status,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Check if user has notification enabled for type
   */
  async isNotificationEnabled(userId, userType, notificationType) {
    try {
      const result = await this.getNotificationPreferences(userId, userType);

      if (!result.success) {
        // If preferences don't exist, assume enabled
        return true;
      }

      const preferences = result.data;
      const channelsEnabled =
        preferences.notification_channels.push ||
        preferences.notification_channels.email ||
        preferences.notification_channels.sms ||
        preferences.notification_channels.in_app;

      if (!channelsEnabled) return false;

      // Check specific notification type
      switch (notificationType) {
        case 'appointment_reminder':
          return preferences.appointment_reminders?.enabled ?? true;
        case 'appointment_status_change':
          return preferences.appointment_status_changes?.enabled ?? true;
        case 'new_message':
        case 'consultation_message':
          return preferences[`${notificationType}`]?.enabled ?? true;
        case 'order_status_change':
          return preferences.order_status_changes?.enabled ?? true;
        case 'new_task':
          return preferences.new_tasks?.enabled ?? true;
        case 'low_stock_alert':
          return preferences.low_stock_alerts?.enabled ?? true;
        case 'system_announcement':
          return preferences.system_announcements?.enabled ?? true;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Send refill reminder notification
   */
  async sendRefillReminder(reminder, customer, medicines) {
    const medicineNames = medicines
      .map(med => med.tradeName || med.genericName)
      .join(', ');

    const results = {};
    const channelsSent = [];

    // Send notification based on method
    switch (reminder.notificationMethod) {
      case 'email':
        try {
          await sendRefillReminderEmail(
            customer.email,
            customer.fullName,
            medicines
          );
          results.email = { success: true };
          channelsSent.push('email');
        } catch (error) {
          console.error('Error sending refill reminder email:', error);
          results.email = { success: false, error: error.message };
        }
        break;

      case 'sms':
        const smsMessage = `Medicine Refill Reminder: It's time to refill your medication(s): ${medicineNames}. Stay healthy!`;
        results.sms = await this.sendSMS(customer.contactNumber, smsMessage);
        if (results.sms.success) channelsSent.push('sms');
        break;

      case 'push':
        const isEnabled = await this.isNotificationEnabled(
          customer._id,
          'customer',
          'refill_reminder'
        );

        if (isEnabled) {
          results.push = await this.sendPushNotification(
            customer._id,
            'Medicine Refill Reminder',
            `Time to refill: ${medicineNames}`,
            {
              type: 'refill_reminder',
              reminderId: reminder._id.toString(),
              medicines: medicines.map(m => m._id.toString()),
            }
          );
          if (results.push.success) channelsSent.push('push');
        } else {
          results.push = { success: false, message: 'Notifications disabled' };
        }
        break;

      default:
        console.error(
          'Invalid notification method:',
          reminder.notificationMethod
        );
    }

    // Log the notification attempt
    await this.logNotification(
      customer._id,
      'customer',
      'refill_reminder',
      'Medicine Refill Reminder',
      `Time to refill: ${medicineNames}`,
      { reminder_id: reminder._id.toString() },
      channelsSent,
      Object.values(results).every(r => r.success) ? 'sent' : 'failed'
    );

    return results;
  }

  /**
   * Send test notification
   */
  async sendTestNotification(method, recipient, name = 'Test User') {
    switch (method) {
      case 'email':
        try {
          await sendRefillReminderEmail(recipient, name, [
            {
              tradeName: 'Test Medicine',
              genericName: 'Test Generic',
              strength: '500mg',
            },
          ]);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }

      case 'sms':
        return await this.sendSMS(
          recipient,
          'This is a test SMS notification from Philbox.'
        );

      case 'push':
        return await this.sendPushNotification(
          recipient,
          'Test Notification',
          'This is a test push notification from Philbox.'
        );

      default:
        return { success: false, error: 'Invalid notification method' };
    }
  }
}

export default new NotificationService();
