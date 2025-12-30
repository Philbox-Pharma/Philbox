import RefillReminder from '../../../../../models/RefillReminder.js';
import MedicineItem from '../../../../../models/MedicineItem.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class RefillReminderService {
  /**
   * Create a new refill reminder
   */
  async createReminder(customerId, reminderData, req) {
    try {
      // Validate that all medicine IDs exist
      const medicines = await MedicineItem.find({
        _id: { $in: reminderData.medicines },
      });

      if (medicines.length !== reminderData.medicines.length) {
        throw new Error('One or more medicine IDs are invalid');
      }

      // Calculate next notification date based on frequency
      const nextNotificationDate = this.calculateNextNotificationDate(
        reminderData.frequency,
        reminderData.timeOfDay
      );

      // Create the reminder
      const reminder = await RefillReminder.create({
        patient_id: customerId,
        medicines: reminderData.medicines,
        frequency: reminderData.frequency,
        timeOfDay: reminderData.timeOfDay,
        notificationMethod: reminderData.notificationMethod,
        nextNotificationDate,
        isActive: true,
      });

      // Populate medicine details
      await reminder.populate('medicines', 'tradeName genericName strength');

      // Log activity
      await logCustomerActivity(
        req,
        'create_reminder',
        `Created refill reminder for ${medicines.length} medicine(s)`,
        'refill_reminder',
        reminder._id
      );

      return {
        reminder,
        message: 'Refill reminder created successfully',
      };
    } catch (error) {
      console.error('Create Reminder Error:', error);
      throw error;
    }
  }

  /**
   * Get all active reminders for a customer
   */
  async getReminders(customerId, query = {}) {
    try {
      const { isActive = true, page = 1, limit = 10 } = query;

      const skip = (page - 1) * limit;

      const reminders = await RefillReminder.find({
        patient_id: customerId,
        ...(isActive !== undefined && { isActive }),
      })
        .populate('medicines', 'tradeName genericName strength dosageForm')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await RefillReminder.countDocuments({
        patient_id: customerId,
        ...(isActive !== undefined && { isActive }),
      });

      return {
        reminders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get Reminders Error:', error);
      throw error;
    }
  }

  /**
   * Get a single reminder by ID
   */
  async getReminderById(customerId, reminderId) {
    try {
      const reminder = await RefillReminder.findOne({
        _id: reminderId,
        patient_id: customerId,
      }).populate('medicines', 'tradeName genericName strength dosageForm');

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      return reminder;
    } catch (error) {
      console.error('Get Reminder By ID Error:', error);
      throw error;
    }
  }

  /**
   * Update a reminder
   */
  async updateReminder(customerId, reminderId, updateData, req) {
    try {
      const reminder = await RefillReminder.findOne({
        _id: reminderId,
        patient_id: customerId,
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Validate medicine IDs if provided
      if (updateData.medicines) {
        const medicines = await MedicineItem.find({
          _id: { $in: updateData.medicines },
        });

        if (medicines.length !== updateData.medicines.length) {
          throw new Error('One or more medicine IDs are invalid');
        }
      }

      // Recalculate next notification date if frequency or time changed
      if (updateData.frequency || updateData.timeOfDay) {
        const frequency = updateData.frequency || reminder.frequency;
        const timeOfDay = updateData.timeOfDay || reminder.timeOfDay;
        updateData.nextNotificationDate = this.calculateNextNotificationDate(
          frequency,
          timeOfDay
        );
      }

      // Update the reminder
      Object.assign(reminder, updateData);
      await reminder.save();

      // Populate medicine details
      await reminder.populate('medicines', 'tradeName genericName strength');

      // Log activity
      await logCustomerActivity(
        req,
        'update_reminder',
        `Updated refill reminder`,
        'refill_reminder',
        reminder._id
      );

      return {
        reminder,
        message: 'Refill reminder updated successfully',
      };
    } catch (error) {
      console.error('Update Reminder Error:', error);
      throw error;
    }
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(customerId, reminderId, req) {
    try {
      const reminder = await RefillReminder.findOneAndDelete({
        _id: reminderId,
        patient_id: customerId,
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Log activity
      await logCustomerActivity(
        req,
        'delete_reminder',
        `Deleted refill reminder`,
        'refill_reminder',
        reminder._id
      );

      return {
        message: 'Refill reminder deleted successfully',
      };
    } catch (error) {
      console.error('Delete Reminder Error:', error);
      throw error;
    }
  }

  /**
   * Mark reminder as completed (deactivate)
   */
  async markAsCompleted(customerId, reminderId, req) {
    try {
      const reminder = await RefillReminder.findOne({
        _id: reminderId,
        patient_id: customerId,
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      reminder.isActive = false;
      await reminder.save();

      // Log activity
      await logCustomerActivity(
        req,
        'complete_reminder',
        `Marked refill reminder as completed`,
        'refill_reminder',
        reminder._id
      );

      return {
        reminder,
        message: 'Reminder marked as completed',
      };
    } catch (error) {
      console.error('Mark Completed Error:', error);
      throw error;
    }
  }

  /**
   * Calculate next notification date based on frequency and time
   */
  calculateNextNotificationDate(frequency, timeOfDay) {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(':').map(Number);

    const nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, start from tomorrow
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    // Adjust based on frequency
    switch (frequency) {
      case 'weekly':
        // If we're past today's time, schedule for next week same day
        if (nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
      case 'monthly':
        // If we're past today's time, schedule for next month
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;
      // daily is default, already handled above
    }

    return nextDate;
  }

  /**
   * Get reminders that need to be sent (for cron job)
   */
  async getRemindersToSend() {
    try {
      const now = new Date();

      const reminders = await RefillReminder.find({
        isActive: true,
        nextNotificationDate: { $lte: now },
      })
        .populate('patient_id', 'fullName email contactNumber')
        .populate('medicines', 'tradeName genericName strength');

      return reminders;
    } catch (error) {
      console.error('Get Reminders To Send Error:', error);
      throw error;
    }
  }

  /**
   * Update reminder after sending notification
   */
  async updateAfterNotification(reminderId) {
    try {
      const reminder = await RefillReminder.findById(reminderId);

      if (!reminder) {
        return;
      }

      // Update last notification sent
      reminder.lastNotificationSent = new Date();

      // Calculate next notification date
      reminder.nextNotificationDate = this.calculateNextNotificationDate(
        reminder.frequency,
        reminder.timeOfDay
      );

      await reminder.save();
    } catch (error) {
      console.error('Update After Notification Error:', error);
      throw error;
    }
  }
}

export default new RefillReminderService();
