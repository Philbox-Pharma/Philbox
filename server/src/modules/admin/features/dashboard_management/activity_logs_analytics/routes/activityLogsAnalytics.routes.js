import express from 'express';
import {
  getActionsTimeline,
  getMostFrequentActions,
  getLoginAttemptsByRole,
  getSuspiciousActivities,
  getActivityOverview,
} from '../controller/activityLogsAnalytics.controller.js';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import {
  timelineQueryDTO,
  frequentActionsQueryDTO,
  loginAttemptsQueryDTO,
  suspiciousActivitiesQueryDTO,
  activityOverviewQueryDTO,
} from '../../../../../../dto/admin/activityLogsAnalytics.dto.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Activity Timeline - Chronological list of all actions
router.get(
  '/timeline',
  validate(timelineQueryDTO, 'query'),
  getActionsTimeline
);

// Most Frequent Actions - Pie chart data
router.get(
  '/frequent-actions',
  validate(frequentActionsQueryDTO, 'query'),
  getMostFrequentActions
);

// Login Attempts by Role - Bar chart data
router.get(
  '/login-attempts',
  validate(loginAttemptsQueryDTO, 'query'),
  getLoginAttemptsByRole
);

// Suspicious Activities - Table data
router.get(
  '/suspicious-activities',
  validate(suspiciousActivitiesQueryDTO, 'query'),
  getSuspiciousActivities
);

// Activity Overview - Summary statistics
router.get(
  '/overview',
  validate(activityOverviewQueryDTO, 'query'),
  getActivityOverview
);

export default router;
