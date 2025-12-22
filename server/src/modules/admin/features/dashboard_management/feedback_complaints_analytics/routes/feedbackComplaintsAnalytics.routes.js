import express from 'express';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import {
  getReviewSentimentAnalysis,
  getComplaintResolutionTime,
  getComplaintsByCategory,
  getFeedbackByCategory,
  getComplaintResolutionStatus,
  getFeedbackTrends,
  getComplaintTrends,
  getOverallSummary,
  exportReportData,
} from '../controller/feedbackComplaintsAnalytics.controller.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import {
  getFeedbackComplaintsAnalyticsDTO,
  exportReportDataDTO,
} from '../../../../../../dto/admin/feedbackComplaintsAnalytics.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== FEEDBACK & COMPLAINTS ANALYTICS ENDPOINTS =====
 */

// 📊 GET Overall Summary - All KPIs in one call
router.get(
  '/summary',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getOverallSummary
);

// 🥧 GET Review Sentiment Analysis (Pie Chart: positive/negative/neutral)
router.get(
  '/sentiment-analysis',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getReviewSentimentAnalysis
);

// 📈 GET Complaint Resolution Time (KPI - average days)
router.get(
  '/resolution-time',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getComplaintResolutionTime
);

// 📊 GET Complaints by Category (Bar Chart)
router.get(
  '/complaints-by-category',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getComplaintsByCategory
);

// 📊 GET Feedback by Category (Bar Chart)
router.get(
  '/feedback-by-category',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getFeedbackByCategory
);

// 🍩 GET Unresolved vs Resolved Complaints (Donut Chart)
router.get(
  '/resolution-status',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getComplaintResolutionStatus
);

// 📈 GET Feedback Trends Over Time (Line Chart)
router.get(
  '/feedback-trends',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getFeedbackTrends
);

// 📈 GET Complaint Trends Over Time (Line Chart)
router.get(
  '/complaint-trends',
  validate(getFeedbackComplaintsAnalyticsDTO, 'query'),
  getComplaintTrends
);

// 📄 EXPORT Report Data to PDF
router.get('/export', validate(exportReportDataDTO, 'query'), exportReportData);

export default router;
