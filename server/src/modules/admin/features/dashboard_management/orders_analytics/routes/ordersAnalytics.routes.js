import express from 'express';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import {
  getOrdersTrends,
  getOrderStatusBreakdown,
  getTopSellingMedicines,
  getStockAlerts,
  getRevenueByCategory,
  getOrderRefundRate,
  getDashboardOverview,
} from '../controller/ordersAnalytics.controller.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import { getOrdersAnalyticsDTO } from '../../../../../../dto/admin/ordersAnalytics.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * GET /api/admin/orders-analytics/trends
 * Get daily/weekly/monthly orders trends
 */
router.get('/trends', validate(getOrdersAnalyticsDTO), getOrdersTrends);

/**
 * GET /api/admin/orders-analytics/status-breakdown
 * Get order status distribution (pending, processing, delivered, cancelled)
 */
router.get(
  '/status-breakdown',
  validate(getOrdersAnalyticsDTO),
  getOrderStatusBreakdown
);

/**
 * GET /api/admin/orders-analytics/top-medicines
 * Get top selling medicines (ranked list)
 */
router.get(
  '/top-medicines',
  validate(getOrdersAnalyticsDTO),
  getTopSellingMedicines
);

/**
 * GET /api/admin/orders-analytics/stock-alerts
 * Get low stock and expiring stock alerts
 */
router.get('/stock-alerts', validate(getOrdersAnalyticsDTO), getStockAlerts);

/**
 * GET /api/admin/orders-analytics/revenue-by-category
 * Get revenue breakdown by medicine category
 */
router.get(
  '/revenue-by-category',
  validate(getOrdersAnalyticsDTO),
  getRevenueByCategory
);

/**
 * GET /api/admin/orders-analytics/refund-rate
 * Get order refund rate KPI
 */
router.get('/refund-rate', validate(getOrdersAnalyticsDTO), getOrderRefundRate);

/**
 * GET /api/admin/orders-analytics/overview
 * Get all analytics in one call (dashboard overview)
 */
router.get('/overview', validate(getOrdersAnalyticsDTO), getDashboardOverview);

export default router;
