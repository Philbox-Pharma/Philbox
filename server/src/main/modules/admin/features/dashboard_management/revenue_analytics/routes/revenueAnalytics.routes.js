import express from 'express';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import {
  getRevenueTrends,
  getRevenueSplit,
  getTopBranchesByRevenue,
  getRefundStatistics,
  getAverageRevenuePerCustomer,
  getPaymentMethodBreakdown,
  getDashboardOverview,
} from '../controller/revenueAnalytics.controller.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import { getRevenueAnalyticsDTO } from '../../../../../../dto/admin/revenueAnalytics.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== REVENUE ANALYTICS ENDPOINTS =====
 */

// 📊 GET Dashboard Overview - All KPIs and charts in one call
router.get(
  '/overview',
  validate(getRevenueAnalyticsDTO, 'query'),
  getDashboardOverview
);

// 📈 GET Revenue Trends (Daily/Weekly/Monthly - Line Chart)
router.get(
  '/trends',
  validate(getRevenueAnalyticsDTO, 'query'),
  getRevenueTrends
);

// 🥧 GET Revenue Split: Appointments vs Orders (Pie Chart)
router.get(
  '/split',
  validate(getRevenueAnalyticsDTO, 'query'),
  getRevenueSplit
);

// 🏆 GET Top Branches by Revenue (Bar Chart - Super Admin Only)
router.get(
  '/top-branches',
  validate(getRevenueAnalyticsDTO, 'query'),
  getTopBranchesByRevenue
);

// 💸 GET Refund Statistics (Bar Chart)
router.get(
  '/refunds',
  validate(getRevenueAnalyticsDTO, 'query'),
  getRefundStatistics
);

// 💰 GET Average Revenue Per Customer (KPI)
router.get(
  '/average-per-customer',
  validate(getRevenueAnalyticsDTO, 'query'),
  getAverageRevenuePerCustomer
);

// 💳 GET Payment Method Breakdown (Pie Chart)
router.get(
  '/payment-methods',
  validate(getRevenueAnalyticsDTO, 'query'),
  getPaymentMethodBreakdown
);

export default router;
