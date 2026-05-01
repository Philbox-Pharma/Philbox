import express from 'express';
import reportController from '../controller/report.controller.js';
import { authenticate as authenticateAdmin } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to authenticate admin
router.use(authenticateAdmin);

/**
 * POST /api/admin/reports/generate
 * Generate a custom report
 * Body: {
 *   report_type: "sales|inventory|appointments|doctor_performance|customer_activity",
 *   date_from: "2026-01-01",
 *   date_to: "2026-04-10",
 *   branch_id?: "optional branch id",
 *   title?: "custom report title"
 * }
 */
router.post('/generate', reportController.generateReport);

/**
 * GET /api/admin/reports
 * Get all reports for the admin
 * Query: ?report_type=sales&page=1&limit=10
 */
router.get('/', reportController.getReports);

/**
 * GET /api/admin/reports/:reportId
 * Get single report details
 */
router.get('/:reportId', reportController.getReport);

/**
 * POST /api/admin/reports/:reportId/save
 * Save/bookmark a report for future reference
 */
router.post('/:reportId/save', reportController.saveReport);

/**
 * DELETE /api/admin/reports/:reportId
 * Delete a report
 */
router.delete('/:reportId', reportController.deleteReport);

/**
 * POST /api/admin/reports/schedule
 * Schedule automatic report generation
 * Body: {
 *   report_type: "sales|inventory|appointments|doctor_performance|customer_activity",
 *   frequency: "daily|weekly|monthly",
 *   branch_id?: "optional branch id",
 *   title?: "custom report title"
 * }
 */
router.post('/schedule', reportController.scheduleReport);

/**
 * PUT /api/admin/reports/:reportId/schedule
 * Update scheduled report (activate/deactivate)
 * Body: {
 *   is_active_schedule: boolean,
 *   frequency?: "daily|weekly|monthly"
 * }
 */
router.put('/:reportId/schedule', reportController.updateScheduledReport);

/**
 * GET /api/admin/reports/scheduled
 * Get all scheduled reports for the admin
 * Query: ?page=1&limit=10
 */
router.get('/scheduled', reportController.getScheduledReports);

export default router;
