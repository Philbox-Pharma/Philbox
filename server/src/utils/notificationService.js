import { sendRefillReminderEmail } from './sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

class NotificationService {
  /**
   * Send SMS notification using Twilio
   */
  async sendSMS(to, message) {
    try {
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
        to,
      });

      console.log('SMS sent:', sms.sid);
      return { success: true, messageId: sms.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification
   * Note: This is a placeholder. Actual implementation would depend on
   * your push notification service (Firebase, OneSignal, etc.)
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // TODO: Implement actual push notification logic
      // For now, this is a placeholder that logs the notification
      console.log('Push notification would be sent:', {
        userId,
        title,
        body,
        data,
      });

      return {
        success: true,
        message: 'Push notification queued (placeholder)',
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
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
        } catch (error) {
          console.error('Error sending refill reminder email:', error);
          results.email = { success: false, error: error.message };
        }
        break;

      case 'sms':
        const smsMessage = `Medicine Refill Reminder: It's time to refill your medication(s): ${medicineNames}. Stay healthy!`;
        results.sms = await this.sendSMS(customer.contactNumber, smsMessage);
        break;

      case 'push':
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
        break;

      default:
        console.error(
          'Invalid notification method:',
          reminder.notificationMethod
        );
    }

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
