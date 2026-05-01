import express from 'express';
import exportController from '../controller/export.controller.js';
import { authenticate as authenticateAdmin } from '../../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/admin/exports/customers
 * @desc    Export customers to Excel or CSV
 * @access  Private (Admin only)
 * @query   {string} format - Export format (xlsx or csv) - default: xlsx
 * @query   {string} branch_id - Optional branch filter
 * @query   {string} status - Optional customer status filter
 * @returns {Object} File download URL and metadata
 */
router.get(
  '/customers',
  authenticateAdmin,
  exportController.exportCustomers.bind(exportController)
);

/**
 * @route   GET /api/admin/exports/orders
 * @desc    Export orders to Excel or CSV
 * @access  Private (Admin only)
 * @query   {string} format - Export format (xlsx or csv) - default: xlsx
 * @query   {string} branch_id - Optional branch filter
 * @query   {string} status - Optional order status filter (completed, pending, cancelled)
 * @query   {string} date_from - Optional start date for range filter
 * @query   {string} date_to - Optional end date for range filter
 * @returns {Object} File download URL and metadata
 */
router.get(
  '/orders',
  authenticateAdmin,
  exportController.exportOrders.bind(exportController)
);

/**
 * @route   GET /api/admin/exports/appointments
 * @desc    Export appointments to Excel or CSV
 * @access  Private (Admin only)
 * @query   {string} format - Export format (xlsx or csv) - default: xlsx
 * @query   {string} status - Optional appointment status filter (confirmed, completed, cancelled, no_show)
 * @query   {string} date_from - Optional start date for range filter
 * @query   {string} date_to - Optional end date for range filter
 * @query   {string} doctor_id - Optional doctor filter
 * @returns {Object} File download URL and metadata
 */
router.get(
  '/appointments',
  authenticateAdmin,
  exportController.exportAppointments.bind(exportController)
);

/**
 * @route   GET /api/admin/exports/inventory
 * @desc    Export inventory/stock to Excel or CSV
 * @access  Private (Admin only)
 * @query   {string} format - Export format (xlsx or csv) - default: xlsx
 * @query   {string} branch_id - Optional branch filter
 * @returns {Object} File download URL and metadata
 */
router.get(
  '/inventory',
  authenticateAdmin,
  exportController.exportInventory.bind(exportController)
);

/**
 * @route   GET /api/admin/exports/reviews
 * @desc    Export reviews to Excel or CSV
 * @access  Private (Admin only)
 * @query   {string} format - Export format (xlsx or csv) - default: xlsx
 * @query   {string} rating - Optional rating filter (1-5)
 * @query   {string} date_from - Optional start date for range filter
 * @query   {string} date_to - Optional end date for range filter
 * @returns {Object} File download URL and metadata
 */
router.get(
  '/reviews',
  authenticateAdmin,
  exportController.exportReviews.bind(exportController)
);

/**
 * @route   GET /api/admin/exports/download/:filename
 * @desc    Download an exported file
 * @access  Private (Admin only)
 * @param   {string} filename - Name of the export file to download
 * @returns {File} The exported file for download
 */
router.get(
  '/download/:filename',
  authenticateAdmin,
  exportController.downloadFile.bind(exportController)
);

export default router;
