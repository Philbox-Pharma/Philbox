import sendResponse from '../../../../../utils/sendResponse.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import exportDataService from '../service/exportData.service.js';

class ExportController {
  /**
   * Export Customers to Excel/CSV
   * GET /api/admin/exports/customers?format=xlsx|csv&branch_id=?&status=?
   */
  async exportCustomers(req, res) {
    try {
      const { format = 'xlsx', branch_id, status } = req.query;

      const result = await exportDataService.exportCustomers(
        { branch_id, status },
        format,
        req
      );

      return sendResponse(res, 200, 'EXPORT_SUCCESSFUL', result);
    } catch (error) {
      console.error('Error exporting customers:', error);
      const errorMessage =
        error.message === 'NO_DATA_TO_EXPORT'
          ? 'No customers found'
          : error.message;
      return sendResponse(res, 400, 'EXPORT_FAILED', null, errorMessage);
    }
  }

  /**
   * Export Orders to Excel/CSV
   * GET /api/admin/exports/orders?format=xlsx|csv&branch_id=?&status=?&date_from=?&date_to=?
   */
  async exportOrders(req, res) {
    try {
      const {
        format = 'xlsx',
        branch_id,
        status,
        date_from,
        date_to,
      } = req.query;

      const result = await exportDataService.exportOrders(
        { branch_id, status, date_from, date_to },
        format,
        req
      );

      return sendResponse(res, 200, 'EXPORT_SUCCESSFUL', result);
    } catch (error) {
      console.error('Error exporting orders:', error);
      const errorMessage =
        error.message === 'NO_DATA_TO_EXPORT'
          ? 'No orders found'
          : error.message;
      return sendResponse(res, 400, 'EXPORT_FAILED', null, errorMessage);
    }
  }

  /**
   * Export Appointments to Excel/CSV
   * GET /api/admin/exports/appointments?format=xlsx|csv&status=?&date_from=?&date_to=?&doctor_id=?
   */
  async exportAppointments(req, res) {
    try {
      const {
        format = 'xlsx',
        status,
        date_from,
        date_to,
        doctor_id,
      } = req.query;

      const result = await exportDataService.exportAppointments(
        { status, date_from, date_to, doctor_id },
        format,
        req
      );

      return sendResponse(res, 200, 'EXPORT_SUCCESSFUL', result);
    } catch (error) {
      console.error('Error exporting appointments:', error);
      const errorMessage =
        error.message === 'NO_DATA_TO_EXPORT'
          ? 'No appointments found'
          : error.message;
      return sendResponse(res, 400, 'EXPORT_FAILED', null, errorMessage);
    }
  }

  /**
   * Export Inventory to Excel/CSV
   * GET /api/admin/exports/inventory?format=xlsx|csv&branch_id=?
   */
  async exportInventory(req, res) {
    try {
      const { format = 'xlsx', branch_id } = req.query;

      const result = await exportDataService.exportInventory(
        { branch_id },
        format,
        req
      );

      return sendResponse(res, 200, 'EXPORT_SUCCESSFUL', result);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      const errorMessage =
        error.message === 'NO_DATA_TO_EXPORT'
          ? 'No inventory found'
          : error.message;
      return sendResponse(res, 400, 'EXPORT_FAILED', null, errorMessage);
    }
  }

  /**
   * Export Reviews to Excel/CSV
   * GET /api/admin/exports/reviews?format=xlsx|csv&rating=?&date_from=?&date_to=?
   */
  async exportReviews(req, res) {
    try {
      const { format = 'xlsx', rating, date_from, date_to } = req.query;

      const result = await exportDataService.exportReviews(
        { rating, date_from, date_to },
        format,
        req
      );

      return sendResponse(res, 200, 'EXPORT_SUCCESSFUL', result);
    } catch (error) {
      console.error('Error exporting reviews:', error);
      const errorMessage =
        error.message === 'NO_DATA_TO_EXPORT'
          ? 'No reviews found'
          : error.message;
      return sendResponse(res, 400, 'EXPORT_FAILED', null, errorMessage);
    }
  }

  /**
   * Download exported file
   * GET /api/admin/exports/download/:filename
   */
  async downloadFile(req, res) {
    try {
      const { filename } = req.params;

      // Validate filename to prevent directory traversal attacks
      if (
        !filename ||
        filename.includes('..') ||
        filename.includes('/') ||
        filename.includes('\\')
      ) {
        return sendResponse(
          res,
          400,
          'INVALID_FILENAME',
          null,
          'Invalid filename'
        );
      }

      // Construct complete file path
      const filePath = `${process.cwd()}/src/main/exports/${filename}`;

      // Check if file exists
      const fs = await import('fs').then(m => m.promises);
      try {
        await fs.access(filePath);
      } catch {
        return sendResponse(
          res,
          404,
          'FILE_NOT_FOUND',
          null,
          'Export file not found'
        );
      }

      // Log download activity
      await logAdminActivity(
        req,
        'DOWNLOAD_EXPORT',
        `Downloaded export file: ${filename}`,
        'exports',
        null,
        { filename }
      );

      // Send file for download
      res.download(filePath, filename, err => {
        if (err) {
          console.error('Error downloading file:', err);
          return sendResponse(
            res,
            500,
            'DOWNLOAD_FAILED',
            null,
            'Error downloading file'
          );
        }
      });
    } catch (error) {
      console.error('Error processing download:', error);
      return sendResponse(res, 500, 'DOWNLOAD_FAILED', null, error.message);
    }
  }
}

export default new ExportController();
