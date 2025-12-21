import express from 'express';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import {
  getNewCustomersTrends,
  getCustomerActivityStatus,
  getDoctorApplicationsBreakdown,
  getDoctorActivityTrends,
  getTopCustomers,
  getCustomerRetentionRate,
  getDashboardOverview,
} from '../controller/userEngagementAnalytics.controller.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import {
  getUserEngagementAnalyticsDTO,
  getTopCustomersDTO,
} from '../../../../../../dto/admin/userEngagementAnalytics.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== USER ENGAGEMENT ANALYTICS ENDPOINTS =====
 */

// 📊 GET Dashboard Overview - All KPIs and charts in one call
router.get(
  '/overview',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getDashboardOverview
);

// 📈 GET New Customers Over Time (Line Chart)
router.get(
  '/new-customers',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getNewCustomersTrends
);

// 🥧 GET Active vs Inactive Customers (Pie Chart)
router.get(
  '/customer-status',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getCustomerActivityStatus
);

// 📊 GET Doctor Applications Breakdown (Bar Chart - Super Admin)
router.get(
  '/doctor-applications',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getDoctorApplicationsBreakdown
);

// 🔥 GET Doctor Activity Trends (Heatmap/Table)
router.get(
  '/doctor-activity',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getDoctorActivityTrends
);

// 🏆 GET Top Customers by Appointments or Orders (Ranked List)
router.get(
  '/top-customers',
  validate(getTopCustomersDTO, 'query'),
  getTopCustomers
);

// 📊 GET Customer Retention Rate (KPI)
router.get(
  '/retention-rate',
  validate(getUserEngagementAnalyticsDTO, 'query'),
  getCustomerRetentionRate
);

export default router;
