import express from 'express';
import * as salespersonPerformanceController from '../controller/salespersonPerformance.controller.js';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import {
  performanceQueryDTO,
  leaderboardQueryDTO,
} from '../../../../../../dto/admin/salespersonPerformance.dto.js';

const router = express.Router();

/**
 * @route   GET /api/admin/salesperson-performance/overview
 * @desc    Get comprehensive performance overview
 * @access  Super-admin (all branches), Branch-admin (own branch)
 */
router.get(
  '/overview',
  authenticate,
  validate(leaderboardQueryDTO, 'query'),
  salespersonPerformanceController.getPerformanceOverview
);

/**
 * @route   GET /api/admin/salesperson-performance/tasks-completion
 * @desc    Get tasks completion statistics per salesperson
 * @access  Super-admin (all branches), Branch-admin (own branch)
 */
router.get(
  '/tasks-completion',
  authenticate,
  validate(performanceQueryDTO, 'query'),
  salespersonPerformanceController.getTasksCompletionStats
);

/**
 * @route   GET /api/admin/salesperson-performance/leaderboard
 * @desc    Get salesperson leaderboard ranked by orders and revenue
 * @access  Super-admin (all branches), Branch-admin (own branch)
 */
router.get(
  '/leaderboard',
  authenticate,
  validate(leaderboardQueryDTO, 'query'),
  salespersonPerformanceController.getSalespersonLeaderboard
);

/**
 * @route   GET /api/admin/salesperson-performance/trends
 * @desc    Get task performance trends over time
 * @access  Super-admin (all branches), Branch-admin (own branch)
 */
router.get(
  '/trends',
  authenticate,
  validate(performanceQueryDTO, 'query'),
  salespersonPerformanceController.getTaskPerformanceTrends
);

/**
 * @route   GET /api/admin/salesperson-performance/completion-time
 * @desc    Get average task completion time by priority
 * @access  Super-admin (all branches), Branch-admin (own branch)
 */
router.get(
  '/completion-time',
  authenticate,
  validate(performanceQueryDTO, 'query'),
  salespersonPerformanceController.getAverageCompletionTimeByPriority
);

export default router;
