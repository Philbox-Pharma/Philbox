import Announcement from '../../../../../models/Announcement.js';
import Customer from '../../../../../models/Customer.js';
import Doctor from '../../../../../models/Doctor.js';
import Salesperson from '../../../../../models/Salesperson.js';
import { brevo } from '../../../../../config/brevo.config.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class AnnouncementService {
  /**
   * Create a new announcement
   */
  async createAnnouncement(data, req) {
    try {
      const announcement = new Announcement({
        title: data.title,
        message: data.message,
        target_audience: data.target_audience,
        delivery_methods: data.delivery_methods,
        scheduled_at: data.scheduled_at,
        notes: data.notes,
        created_by: req.user._id || req.admin._id,
        status: 'draft',
      });

      await announcement.save();

      await logAdminActivity(
        req,
        'create_announcement',
        `Created announcement: "${data.title}" targeting ${data.target_audience}`,
        'announcements',
        announcement._id,
        {
          new: {
            title: data.title,
            target_audience: data.target_audience,
            delivery_methods: data.delivery_methods,
          },
        }
      );

      return announcement;
    } catch (error) {
      throw new Error(`Failed to create announcement: ${error.message}`);
    }
  }

  /**
   * Get all announcements with filters
   */
  async getAnnouncements(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.target_audience) {
        query.target_audience = filters.target_audience;
      }

      const skip = Math.max(0, filters.skip || 0);
      const limit = Math.min(filters.limit || 20, 100);

      const announcements = await Announcement.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('created_by', 'fullName email')
        .lean();

      const total = await Announcement.countDocuments(query);

      return {
        data: announcements,
        pagination: {
          total,
          skip,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve announcements: ${error.message}`);
    }
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id) {
    try {
      const announcement = await Announcement.findById(id)
        .populate('created_by', 'fullName email')
        .lean();

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      return announcement;
    } catch (error) {
      throw new Error(`Failed to retrieve announcement: ${error.message}`);
    }
  }

  /**
   * Update announcement (only draft announcements)
   */
  async updateAnnouncement(id, data, req) {
    try {
      const announcement = await Announcement.findById(id);

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (announcement.status !== 'draft') {
        throw new Error(
          'Can only update draft announcements. Cancel scheduled/sent announcements instead.'
        );
      }

      const oldData = {
        title: announcement.title,
        message: announcement.message,
        target_audience: announcement.target_audience,
        delivery_methods: announcement.delivery_methods,
        scheduled_at: announcement.scheduled_at,
      };

      if (data.title) announcement.title = data.title;
      if (data.message) announcement.message = data.message;
      if (data.target_audience)
        announcement.target_audience = data.target_audience;
      if (data.delivery_methods)
        announcement.delivery_methods = data.delivery_methods;
      if (data.scheduled_at) announcement.scheduled_at = data.scheduled_at;
      if (data.notes) announcement.notes = data.notes;

      await announcement.save();

      await logAdminActivity(
        req,
        'update_announcement',
        `Updated announcement: "${announcement.title}"`,
        'announcements',
        announcement._id,
        {
          old: oldData,
          new: {
            title: announcement.title,
            message: announcement.message,
            target_audience: announcement.target_audience,
            delivery_methods: announcement.delivery_methods,
            scheduled_at: announcement.scheduled_at,
          },
        }
      );

      return announcement;
    } catch (error) {
      throw new Error(`Failed to update announcement: ${error.message}`);
    }
  }

  /**
   * Get recipients based on target audience
   */
  async getRecipients(targetAudience) {
    try {
      let recipients = [];

      switch (targetAudience) {
        case 'customers':
          recipients = await Customer.find(
            { account_status: 'active' },
            { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
          ).lean();
          break;
        case 'doctors':
          recipients = await Doctor.find(
            { account_status: 'active' },
            { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
          ).lean();
          break;
        case 'salespersons':
          recipients = await Salesperson.find(
            { account_status: 'active' },
            { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
          ).lean();
          break;
        case 'all':
          const [customers, doctors, salespersons] = await Promise.all([
            Customer.find(
              { account_status: 'active' },
              { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
            ).lean(),
            Doctor.find(
              { account_status: 'active' },
              { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
            ).lean(),
            Salesperson.find(
              { account_status: 'active' },
              { email: 1, contactNumber: 1, _id: 1, fullName: 1 }
            ).lean(),
          ]);
          recipients = [...customers, ...doctors, ...salespersons];
          break;
      }

      return recipients;
    } catch (error) {
      throw new Error(`Failed to get recipients: ${error.message}`);
    }
  }

  /**
   * Send announcement via email
   */
  async sendEmailAnnouncements(announcement, recipients) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const recipient of recipients) {
      try {
        if (!recipient.email) {
          results.failed++;
          continue;
        }

        const emailData = {
          from: process.env.EMAIL_FROM || 'noreply@philbox.com',
          to: recipient.email,
          subject: announcement.title,
          html: `
            <h2>${announcement.title}</h2>
            <p>${announcement.message}</p>
            <hr>
            <p><small>This is an automated message from PhilBox</small></p>
          `,
          replyTo: process.env.EMAIL_REPLY_TO || 'support@philbox.com',
        };

        await brevo.emails.send(emailData);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          recipientId: recipient._id,
          email: recipient.email,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send announcement via in-app notification (using socket)
   */
  async sendInAppNotifications(announcement, recipients, io = null) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    if (!io) {
      results.failed = recipients.length;
      return results;
    }

    for (const recipient of recipients) {
      try {
        // Emit notification to user-specific room
        io.to(`user:${recipient._id}`).emit('announcement:new', {
          id: announcement._id,
          title: announcement.title,
          message: announcement.message,
          created_at: announcement.created_at,
          type: 'announcement',
        });
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          recipientId: recipient._id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send announcement via SMS (placeholder - requires SMS service integration)
   */
  async sendSmsAnnouncements(announcement, recipients) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    // TODO: Integrate with SMS service (e.g., Twilio, AWS SNS)
    // For now, log as pending
    results.failed = recipients.length;

    for (const recipient of recipients) {
      if (!recipient.contactNumber) {
        continue;
      }
      // Placeholder for SMS sending logic
      results.errors.push({
        recipientId: recipient._id,
        contactNumber: recipient.contactNumber,
        error: 'SMS service not yet integrated',
      });
    }

    return results;
  }

  /**
   * Send announcement via push notification (placeholder)
   */
  async sendPushNotifications(announcement, recipients) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    // TODO: Integrate with push notification service
    // For now, mark as pending/failed
    results.failed = recipients.length;

    for (const recipient of recipients) {
      results.errors.push({
        recipientId: recipient._id,
        error: 'Push notification service not yet integrated',
      });
    }

    return results;
  }

  /**
   * Send announcement
   */
  async sendAnnouncement(id, req, io = null) {
    try {
      const announcement = await Announcement.findById(id);

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (['sent', 'cancelled'].includes(announcement.status)) {
        throw new Error(
          `Cannot send ${announcement.status} announcements. Please create a new one.`
        );
      }

      if (
        announcement.status === 'scheduled' &&
        new Date() < announcement.scheduled_at
      ) {
        throw new Error(
          'Cannot send announcement scheduled for future time. Wait for scheduled time.'
        );
      }

      // Get recipients
      const recipients = await this.getRecipients(announcement.target_audience);

      if (recipients.length === 0) {
        throw new Error('No active recipients found for this audience');
      }

      // Update status
      announcement.status = 'sent';
      announcement.sent_at = new Date();
      announcement.delivery_status.total_recipients = recipients.length;
      announcement.delivery_status.pending = recipients.length;

      const deliveryResults = {
        email: { sent: 0, failed: 0 },
        sms: { sent: 0, failed: 0 },
        push: { sent: 0, failed: 0 },
        'in-app': { sent: 0, failed: 0 },
      };

      // Send via selected delivery methods
      if (announcement.delivery_methods.includes('email')) {
        const emailResults = await this.sendEmailAnnouncements(
          announcement,
          recipients
        );
        deliveryResults.email.sent = emailResults.sent;
        deliveryResults.email.failed = emailResults.failed;
        announcement.delivery_status.by_method.email.sent = emailResults.sent;
        announcement.delivery_status.by_method.email.failed =
          emailResults.failed;
      }

      if (announcement.delivery_methods.includes('in-app')) {
        const inAppResults = await this.sendInAppNotifications(
          announcement,
          recipients,
          io
        );
        deliveryResults['in-app'].sent = inAppResults.sent;
        deliveryResults['in-app'].failed = inAppResults.failed;
        announcement.delivery_status.by_method['in-app'].sent =
          inAppResults.sent;
        announcement.delivery_status.by_method['in-app'].failed =
          inAppResults.failed;
      }

      if (announcement.delivery_methods.includes('sms')) {
        const smsResults = await this.sendSmsAnnouncements(
          announcement,
          recipients
        );
        deliveryResults.sms.sent = smsResults.sent;
        deliveryResults.sms.failed = smsResults.failed;
        announcement.delivery_status.by_method.sms.pending = smsResults.failed;
      }

      if (announcement.delivery_methods.includes('push')) {
        const pushResults = await this.sendPushNotifications(
          announcement,
          recipients
        );
        deliveryResults.push.sent = pushResults.sent;
        deliveryResults.push.failed = pushResults.failed;
        announcement.delivery_status.by_method.push.pending =
          pushResults.failed;
      }

      // Calculate overall stats
      const totalSent = Object.values(deliveryResults).reduce(
        (sum, method) => sum + method.sent,
        0
      );
      const totalFailed = Object.values(deliveryResults).reduce(
        (sum, method) => sum + method.failed,
        0
      );

      announcement.delivery_status.sent =
        totalSent > 0
          ? Math.ceil(totalSent / announcement.delivery_methods.length)
          : 0;
      announcement.delivery_status.failed =
        totalFailed > 0
          ? Math.ceil(totalFailed / announcement.delivery_methods.length)
          : 0;
      announcement.delivery_status.pending =
        announcement.delivery_status.total_recipients -
        announcement.delivery_status.sent -
        announcement.delivery_status.failed;

      await announcement.save();

      await logAdminActivity(
        req,
        'send_announcement',
        `Sent announcement: "${announcement.title}" to ${announcement.target_audience}`,
        'announcements',
        announcement._id,
        {
          new: {
            status: 'sent',
            recipients: recipients.length,
            delivery_methods: announcement.delivery_methods,
            delivery_status: announcement.delivery_status,
          },
        }
      );

      return {
        announcement,
        deliveryResults,
      };
    } catch (error) {
      throw new Error(`Failed to send announcement: ${error.message}`);
    }
  }

  /**
   * Cancel announcement
   */
  async cancelAnnouncement(id, req) {
    try {
      const announcement = await Announcement.findById(id);

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (['sent', 'cancelled'].includes(announcement.status)) {
        throw new Error(`Cannot cancel ${announcement.status} announcements`);
      }

      announcement.status = 'cancelled';
      await announcement.save();

      await logAdminActivity(
        req,
        'cancel_announcement',
        `Cancelled announcement: "${announcement.title}"`,
        'announcements',
        announcement._id,
        { new: { status: 'cancelled' } }
      );

      return announcement;
    } catch (error) {
      throw new Error(`Failed to cancel announcement: ${error.message}`);
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id, req) {
    try {
      const announcement = await Announcement.findById(id);

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (announcement.status === 'sent') {
        throw new Error(
          'Cannot delete sent announcements. You can only delete draft or cancelled announcements.'
        );
      }

      await Announcement.deleteOne({ _id: id });

      await logAdminActivity(
        req,
        'delete_announcement',
        `Deleted announcement: "${announcement.title}"`,
        'announcements',
        announcement._id,
        { old: { title: announcement.title, status: announcement.status } }
      );

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
  }

  /**
   * Get announcement delivery history
   */
  async getDeliveryHistory(id) {
    try {
      const announcement = await Announcement.findById(id)
        .populate('created_by', 'fullName email')
        .lean();

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      return {
        announcement,
        delivery_status: announcement.delivery_status,
        sent_at: announcement.sent_at,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve delivery history: ${error.message}`);
    }
  }
}

export default new AnnouncementService();
