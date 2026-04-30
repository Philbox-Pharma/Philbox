import cron from 'node-cron';
import refillReminderService from '../modules/customer/features/refill_reminder/service/refillReminder.service.js';
import notificationService from './notificationService.js';

class ReminderScheduler {
  constructor() {
    this.isRunning = false;
    this.schedule = '*/5 * * * *';
    this.scheduleLabel = 'Every 5 minutes';
  }

  /**
   * Start the reminder scheduler
   * Runs every 5 minutes to check for reminders that need to be sent
   */
  start() {
    if (this.isRunning) {
      console.log('Reminder scheduler is already running');
      return;
    }

    // Run every minute in development for faster testing,
    // otherwise run every 5 minutes in production-like environments.
    const isDevelopment = process.env.NODE_ENV === 'development';
    this.schedule = isDevelopment ? '* * * * *' : '*/5 * * * *';
    this.scheduleLabel = isDevelopment ? 'Every minute' : 'Every 5 minutes';

    this.task = cron.schedule(this.schedule, async () => {
      console.log('Running reminder scheduler...');
      await this.processReminders();
    });

    this.isRunning = true;
    console.log(`✅ Reminder scheduler started (${this.scheduleLabel})`);
  }

  /**
   * Stop the reminder scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log('❌ Reminder scheduler stopped');
    }
  }

  /**
   * Process all reminders that need to be sent
   */
  async processReminders() {
    try {
      // Get all reminders that need to be sent
      const reminders = await refillReminderService.getRemindersToSend();

      if (reminders.length === 0) {
        console.log('No reminders to send at this time');
        return;
      }

      console.log(`Processing ${reminders.length} reminder(s)...`);

      // Send notifications for each reminder
      for (const reminder of reminders) {
        try {
          await this.sendReminderNotification(reminder);
        } catch (error) {
          console.error(
            `Failed to send reminder ${reminder._id}:`,
            error.message
          );
        }
      }

      console.log('Reminder processing completed');
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  /**
   * Send notification for a specific reminder
   */
  async sendReminderNotification(reminder) {
    try {
      const customer = reminder.patient_id;
      const medicines = reminder.medicines;

      // Validate customer data
      if (!customer || !customer.email) {
        console.error(`Invalid customer data for reminder ${reminder._id}`);
        return;
      }

      // Send notification based on method
      const result = await notificationService.sendRefillReminder(
        reminder,
        customer,
        medicines
      );

      // Log the result
      if (
        result.email?.success ||
        result.sms?.success ||
        result.push?.success
      ) {
        console.log(`✅ Notification sent for reminder ${reminder._id}`);

        // Update reminder after successful notification
        await refillReminderService.updateAfterNotification(reminder._id);
      } else {
        console.error(
          `❌ Failed to send notification for reminder ${reminder._id}:`,
          result
        );
      }
    } catch (error) {
      console.error(
        `Error sending reminder notification for ${reminder._id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Manually trigger reminder processing (for testing)
   */
  async triggerNow() {
    console.log('Manually triggering reminder processing...');
    await this.processReminders();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: `${this.schedule} (${this.scheduleLabel})`,
    };
  }
}

// Export singleton instance
export default new ReminderScheduler();
