import cron from 'node-cron';
import Announcement from '../models/Announcement.js';
import AnnouncementService from '../modules/admin/features/announcement_management/services/announcement.service.js';

/**
 * Announcement Scheduler
 * Checks every minute for scheduled announcements that should be sent
 */

let io = null;

export const setAnnouncementSchedulerIO = ioInstance => {
  io = ioInstance;
};

// Run every minute
const announcementScheduler = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Find announcements that are scheduled to be sent now or in the past
    const announcementsToSend = await Announcement.find({
      status: 'scheduled',
      scheduled_at: { $lte: now },
    });

    for (const announcement of announcementsToSend) {
      try {
        // Create a minimal req object for logging
        const fakeReq = {
          user: null,
          admin: {
            _id: announcement.created_by,
          },
          ip: 'scheduler',
          headers: {
            'user-agent': 'announcement-scheduler',
          },
        };

        // Send the announcement
        await AnnouncementService.sendAnnouncement(
          announcement._id,
          fakeReq,
          io
        );

        console.log(
          `✅ Announcement "${announcement.title}" sent scheduled successfully`
        );
      } catch (error) {
        console.error(
          `❌ Failed to send scheduled announcement "${announcement.title}":`,
          error.message
        );

        // Mark as failed
        announcement.status = 'failed';
        await announcement.save();
      }
    }
  } catch (error) {
    console.error('❌ Announcement scheduler error:', error.message);
  }
});

export default announcementScheduler;
