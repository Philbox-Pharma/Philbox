import cron from 'node-cron';
import Report from '../models/Report.js';
import reportGenerationService from '../modules/admin/features/report_management/service/reportGeneration.service.js';

/**
 * Report Scheduler
 * Automatically generates scheduled reports based on frequency
 * Runs checks daily at 1 AM
 */
class ReportScheduler {
  constructor() {
    this.task = null;
  }

  /**
   * Start the scheduler
   * Checks for reports that need generation every day at 1 AM
   */
  start() {
    // Runs at 1 AM every day (0 1 * * *)
    this.task = cron.schedule('0 1 * * *', async () => {
      console.log('📊 Starting scheduled report generation...');
      await this.generateScheduledReports();
    });

    console.log('✅ Report scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('⏹️ Report scheduler stopped');
    }
  }

  /**
   * Generate scheduled reports
   * @private
   */
  async generateScheduledReports() {
    try {
      const now = new Date();

      // Find all active scheduled reports
      const scheduledReports = await Report.find({
        is_scheduled: true,
        is_active_schedule: true,
        schedule_next_date: { $lte: now },
      });

      console.log(`📋 Found ${scheduledReports.length} reports to generate`);

      for (const reportConfig of scheduledReports) {
        try {
          await this.generateReport(reportConfig);
        } catch (error) {
          console.error(
            `❌ Failed to generate report ${reportConfig._id}:`,
            error
          );

          // Update report status
          await Report.findByIdAndUpdate(reportConfig._id, {
            status: 'failed',
            error_message: error.message,
          });
        }
      }

      console.log('✅ Scheduled report generation completed');
    } catch (error) {
      console.error('❌ Error in report scheduler:', error);
    }
  }

  /**
   * Generate a single scheduled report
   * @private
   */
  async generateReport(reportConfig) {
    const { _id, report_type, branch_id, frequency, admin_id } = reportConfig;

    // Calculate date range based on frequency
    const { date_from, date_to } = this.getDateRange(frequency);

    // Generate report based on type
    let reportData;
    switch (report_type) {
      case 'sales':
        reportData = await reportGenerationService.generateSalesReport({
          date_from,
          date_to,
          branch_id,
        });
        break;
      case 'inventory':
        reportData = await reportGenerationService.generateInventoryReport({
          branch_id,
        });
        break;
      case 'appointments':
        reportData = await reportGenerationService.generateAppointmentReport({
          date_from,
          date_to,
          branch_id,
        });
        break;
      case 'doctor_performance':
        reportData =
          await reportGenerationService.generateDoctorPerformanceReport({
            date_from,
            date_to,
            branch_id,
          });
        break;
      case 'customer_activity':
        reportData =
          await reportGenerationService.generateCustomerActivityReport({
            date_from,
            date_to,
          });
        break;
      default:
        throw new Error(`Unknown report type: ${report_type}`);
    }

    // Create new report entry
    const newReport = await Report.create({
      title: `${report_type} Report - ${new Date().toLocaleDateString()}`,
      report_type,
      date_from,
      date_to,
      branch_id,
      admin_id,
      ...reportData,
      status: 'generated',
      is_scheduled: false, // This is the generated copy, not the template
    });

    // Update schedule configuration with next generation date
    const nextDate = this.getNextScheduleDate(frequency);
    await Report.findByIdAndUpdate(_id, {
      schedule_next_date: nextDate,
    });

    console.log(`✅ Generated ${report_type} report (ID: ${newReport._id})`);
    return newReport;
  }

  /**
   * Get date range based on frequency
   * @private
   */
  getDateRange(frequency) {
    const date_to = new Date();
    const date_from = new Date();

    switch (frequency) {
      case 'daily':
        date_from.setDate(date_from.getDate() - 1);
        break;
      case 'weekly':
        date_from.setDate(date_from.getDate() - 7);
        break;
      case 'monthly':
        date_from.setMonth(date_from.getMonth() - 1);
        break;
    }

    return { date_from, date_to };
  }

  /**
   * Calculate next schedule date
   * @private
   */
  getNextScheduleDate(frequency) {
    const nextDate = new Date();

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(1, 0, 0, 0); // 1 AM
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        nextDate.setHours(1, 0, 0, 0);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setHours(1, 0, 0, 0);
        break;
    }

    return nextDate;
  }

  /**
   * Manual trigger for report generation (for testing)
   * @public
   */
  async triggerNow() {
    console.log('🔧 Manual report generation triggered');
    await this.generateScheduledReports();
  }
}

export default new ReportScheduler();
