import cron from 'node-cron';
import AdminActivityLog from '../models/AdminActivityLog.js';
import CustomerActivityLog from '../models/CustomerActivityLog.js';
import DoctorActivityLog from '../models/DoctorActivityLog.js';
import SalespersonActivityLog from '../models/SalespersonActivityLog.js';

/**
 * Activity Log Cleanup Scheduler
 * Deletes activity logs older than 90 days
 * Runs daily at 2 AM
 */
class ActivityLogCleanupScheduler {
  constructor() {
    this.task = null;
  }

  /**
   * Start the scheduler
   * Deletes logs older than 90 days daily at 2 AM
   */
  start() {
    // Runs at 2 AM every day (0 2 * * *)
    this.task = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Starting activity log cleanup...');
      await this.cleanupLogs();
    });

    console.log('✅ Activity log cleanup scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('⏹️ Activity log cleanup scheduler stopped');
    }
  }

  /**
   * Cleanup function - deletes logs older than 90 days
   * @private
   */
  async cleanupLogs() {
    try {
      // Calculate date 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      console.log(
        `📊 Deleting logs older than: ${ninetyDaysAgo.toISOString()}`
      );

      // Delete from all activity log collections
      const [adminResult, customerResult, doctorResult, salespersonResult] =
        await Promise.all([
          AdminActivityLog.deleteMany({ created_at: { $lt: ninetyDaysAgo } }),
          CustomerActivityLog.deleteMany({
            created_at: { $lt: ninetyDaysAgo },
          }),
          DoctorActivityLog.deleteMany({ created_at: { $lt: ninetyDaysAgo } }),
          SalespersonActivityLog.deleteMany({
            created_at: { $lt: ninetyDaysAgo },
          }),
        ]);

      // Log cleanup results
      const totalDeleted =
        adminResult.deletedCount +
        customerResult.deletedCount +
        doctorResult.deletedCount +
        salespersonResult.deletedCount;

      console.log(`✅ Activity log cleanup completed`);
      console.log(`   📋 Admin logs deleted: ${adminResult.deletedCount}`);
      console.log(
        `   👤 Customer logs deleted: ${customerResult.deletedCount}`
      );
      console.log(`   👨‍⚕️ Doctor logs deleted: ${doctorResult.deletedCount}`);
      console.log(
        `   🧑‍💼 Salesperson logs deleted: ${salespersonResult.deletedCount}`
      );
      console.log(`   📊 Total logs deleted: ${totalDeleted}`);
    } catch (error) {
      console.error('❌ Error during activity log cleanup:', error);
    }
  }

  /**
   * Manual cleanup trigger (for testing or immediate cleanup)
   * @public
   */
  async triggerCleanup() {
    console.log('🔧 Manual activity log cleanup triggered');
    await this.cleanupLogs();
  }
}

export default new ActivityLogCleanupScheduler();
