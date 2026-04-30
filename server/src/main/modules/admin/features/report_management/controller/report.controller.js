import Report from '../../../../../models/Report.js';
import reportGenerationService from '../service/reportGeneration.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class ReportController {
  /**
   * Generate a custom report
   * POST /api/admin/reports/generate
   */
  async generateReport(req, res) {
    try {
      const adminId = req.user?.id || req.user?._id;
      const { report_type, date_from, date_to, branch_id, title } = req.body;

      if (!report_type || !date_from || !date_to) {
        return sendResponse(
          res,
          400,
          'INVALID_PARAMETERS',
          null,
          'Missing required fields'
        );
      }

      const validTypes = [
        'sales',
        'inventory',
        'appointments',
        'doctor_performance',
        'customer_activity',
      ];
      if (!validTypes.includes(report_type)) {
        return sendResponse(
          res,
          400,
          'INVALID_REPORT_TYPE',
          null,
          'Invalid report type'
        );
      }

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
      }

      // Create report document
      const report = await Report.create({
        title:
          title ||
          `${report_type.replace(/_/g, ' ')} Report - ${new Date().toLocaleDateString()}`,
        report_type,
        date_from: new Date(date_from),
        date_to: new Date(date_to),
        branch_id,
        admin_id: adminId,
        ...reportData,
        status: 'generated',
      });

      // Log activity
      await logAdminActivity(
        req,
        'GENERATE_REPORT',
        `Generated ${report_type} report`,
        'reports',
        report._id,
        { report_type, date_from, date_to }
      );

      return sendResponse(res, 201, 'REPORT_GENERATED', report);
    } catch (error) {
      console.error('Error generating report:', error);
      return sendResponse(
        res,
        500,
        'REPORT_GENERATION_FAILED',
        null,
        error.message
      );
    }
  }

  /**
   * Get all reports for admin
   * GET /api/admin/reports
   */
  async getReports(req, res) {
    try {
      const adminId = req.user?.id || req.user?._id;
      const {
        report_type,
        page = 1,
        limit = 10,
        skip = (page - 1) * limit,
      } = req.query;

      // Build query
      const query = { admin_id: adminId };
      if (report_type) {
        query.report_type = report_type;
      }

      // Get reports with pagination
      const [reports, total] = await Promise.all([
        Report.find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Report.countDocuments(query),
      ]);

      return sendResponse(res, 200, 'REPORTS_FETCHED', {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      return sendResponse(
        res,
        500,
        'FETCH_REPORTS_FAILED',
        null,
        error.message
      );
    }
  }

  /**
   * Get single report
   * GET /api/admin/reports/:reportId
   */
  async getReport(req, res) {
    try {
      const { reportId } = req.params;
      const adminId = req.user?.id || req.user?._id;

      const report = await Report.findOne({
        _id: reportId,
        admin_id: adminId,
      }).lean();

      if (!report) {
        return sendResponse(
          res,
          404,
          'REPORT_NOT_FOUND',
          null,
          'Report not found'
        );
      }

      return sendResponse(res, 200, 'REPORT_FETCHED', report);
    } catch (error) {
      console.error('Error fetching report:', error);
      return sendResponse(res, 500, 'FETCH_REPORT_FAILED', null, error.message);
    }
  }

  /**
   * Save report (bookmark for future reference)
   * POST /api/admin/reports/:reportId/save
   */
  async saveReport(req, res) {
    try {
      const { reportId } = req.params;
      const adminId = req.user?.id || req.user?._id;

      const report = await Report.findOneAndUpdate(
        { _id: reportId, admin_id: adminId },
        {
          is_saved: true,
          saved_at: new Date(),
        },
        { new: true }
      );

      if (!report) {
        return sendResponse(
          res,
          404,
          'REPORT_NOT_FOUND',
          null,
          'Report not found'
        );
      }

      await logAdminActivity(
        req,
        'SAVE_REPORT',
        `Saved ${report.report_type} report`,
        'reports',
        reportId
      );

      return sendResponse(res, 200, 'REPORT_SAVED', report);
    } catch (error) {
      console.error('Error saving report:', error);
      return sendResponse(res, 500, 'SAVE_REPORT_FAILED', null, error.message);
    }
  }

  /**
   * Delete report
   * DELETE /api/admin/reports/:reportId
   */
  async deleteReport(req, res) {
    try {
      const { reportId } = req.params;
      const adminId = req.user?.id || req.user?._id;

      const report = await Report.findOneAndDelete({
        _id: reportId,
        admin_id: adminId,
      });

      if (!report) {
        return sendResponse(
          res,
          404,
          'REPORT_NOT_FOUND',
          null,
          'Report not found'
        );
      }

      await logAdminActivity(
        req,
        'DELETE_REPORT',
        `Deleted ${report.report_type} report`,
        'reports',
        reportId
      );

      return sendResponse(res, 200, 'REPORT_DELETED');
    } catch (error) {
      console.error('Error deleting report:', error);
      return sendResponse(
        res,
        500,
        'DELETE_REPORT_FAILED',
        null,
        error.message
      );
    }
  }

  /**
   * Schedule report generation
   * POST /api/admin/reports/schedule
   */
  async scheduleReport(req, res) {
    try {
      const adminId = req.user?.id || req.user?._id;
      const {
        report_type,
        frequency, // daily, weekly, monthly
        branch_id,
        title,
      } = req.body;

      if (!report_type || !frequency) {
        return sendResponse(
          res,
          400,
          'INVALID_PARAMETERS',
          null,
          'Missing required fields'
        );
      }

      // Create scheduled report
      const scheduledReport = await Report.create({
        title: title || `Scheduled ${report_type} Report`,
        report_type,
        branch_id,
        admin_id: adminId,
        is_scheduled: true,
        frequency,
        is_active_schedule: true,
        schedule_next_date: new Date(),
        status: 'processing',
      });

      await logAdminActivity(
        req,
        'SCHEDULE_REPORT',
        `Scheduled ${frequency} ${report_type} report`,
        'reports',
        scheduledReport._id,
        { report_type, frequency }
      );

      return sendResponse(res, 201, 'REPORT_SCHEDULED', scheduledReport);
    } catch (error) {
      console.error('Error scheduling report:', error);
      return sendResponse(
        res,
        500,
        'SCHEDULE_REPORT_FAILED',
        null,
        error.message
      );
    }
  }

  /**
   * Update scheduled report
   * PUT /api/admin/reports/:reportId/schedule
   */
  async updateScheduledReport(req, res) {
    try {
      const { reportId } = req.params;
      const adminId = req.user?.id || req.user?._id;
      const { is_active_schedule, frequency } = req.body;

      const report = await Report.findOneAndUpdate(
        { _id: reportId, admin_id: adminId, is_scheduled: true },
        {
          is_active_schedule: is_active_schedule,
          frequency: frequency || undefined,
        },
        { new: true }
      );

      if (!report) {
        return sendResponse(
          res,
          404,
          'SCHEDULED_REPORT_NOT_FOUND',
          null,
          'Scheduled report not found'
        );
      }

      await logAdminActivity(
        req,
        'UPDATE_SCHEDULED_REPORT',
        `Updated scheduled report (${is_active_schedule ? 'activated' : 'deactivated'})`,
        'reports',
        reportId
      );

      return sendResponse(res, 200, 'SCHEDULED_REPORT_UPDATED', report);
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      return sendResponse(
        res,
        500,
        'UPDATE_SCHEDULED_REPORT_FAILED',
        null,
        error.message
      );
    }
  }

  /**
   * Get scheduled reports
   * GET /api/admin/reports/scheduled
   */
  async getScheduledReports(req, res) {
    try {
      const adminId = req.user?.id || req.user?._id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        Report.find({
          admin_id: adminId,
          is_scheduled: true,
        })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Report.countDocuments({
          admin_id: adminId,
          is_scheduled: true,
        }),
      ]);

      return sendResponse(res, 200, 'SCHEDULED_REPORTS_FETCHED', {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return sendResponse(
        res,
        500,
        'FETCH_SCHEDULED_REPORTS_FAILED',
        null,
        error.message
      );
    }
  }
}

export default new ReportController();
