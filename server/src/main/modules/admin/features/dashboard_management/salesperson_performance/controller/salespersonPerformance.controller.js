import * as salespersonPerformanceService from '../services/salespersonPerformance.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';
import mongoose from 'mongoose';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

/**
 * Get tasks completion statistics
 * Shows completed vs assigned tasks per salesperson
 */
export const getTasksCompletionStats = async (req, res) => {
  try {
    const filters = {
      branch_id: req.query.branch_id
        ? new mongoose.Types.ObjectId(req.query.branch_id)
        : null,
      salesperson_id: req.query.salesperson_id
        ? new mongoose.Types.ObjectId(req.query.salesperson_id)
        : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const adminCategory = req.admin.category;
    const adminBranchesManaged = req.admin.branches_managed || [];

    const stats = await salespersonPerformanceService.getTasksCompletionStats(
      filters,
      adminCategory,
      adminBranchesManaged
    );

    // Log activity
    await logAdminActivity(
      req,
      'view_tasks_completion_stats',
      `Viewed tasks completion statistics (${stats.length} salespersons)`,
      'salespersontasks',
      null,
      { filters }
    );

    return sendResponse(
      res,
      200,
      'Tasks completion statistics retrieved successfully',
      { stats }
    );
  } catch (error) {
    console.error('Error in getTasksCompletionStats:', error);
    return sendResponse(
      res,
      400,
      'Failed to retrieve tasks completion statistics',
      null,
      error.message
    );
  }
};

/**
 * Get salesperson leaderboard
 * Ranks salespersons by orders and revenue
 */
export const getSalespersonLeaderboard = async (req, res) => {
  try {
    const filters = {
      branch_id: req.query.branch_id
        ? new mongoose.Types.ObjectId(req.query.branch_id)
        : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const adminCategory = req.admin.category;
    const adminBranchesManaged = req.admin.branches_managed || [];

    const leaderboard =
      await salespersonPerformanceService.getSalespersonLeaderboard(
        filters,
        adminCategory,
        adminBranchesManaged
      );

    // Log activity
    await logAdminActivity(
      req,
      'view_salesperson_leaderboard',
      `Viewed salesperson leaderboard (${leaderboard.length} salespersons)`,
      'salespersontasks',
      null,
      { filters }
    );

    return sendResponse(
      res,
      200,
      'Salesperson leaderboard retrieved successfully',
      { leaderboard }
    );
  } catch (error) {
    console.error('Error in getSalespersonLeaderboard:', error);
    return sendResponse(
      res,
      400,
      'Failed to retrieve salesperson leaderboard',
      null,
      error.message
    );
  }
};

/**
 * Get task performance trends over time
 * Shows task creation and completion trends grouped by date
 */
export const getTaskPerformanceTrends = async (req, res) => {
  try {
    const filters = {
      branch_id: req.query.branch_id
        ? new mongoose.Types.ObjectId(req.query.branch_id)
        : null,
      salesperson_id: req.query.salesperson_id
        ? new mongoose.Types.ObjectId(req.query.salesperson_id)
        : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const adminCategory = req.admin.category;
    const adminBranchesManaged = req.admin.branches_managed || [];

    const trends = await salespersonPerformanceService.getTaskPerformanceTrends(
      filters,
      adminCategory,
      adminBranchesManaged
    );

    // Log activity
    await logAdminActivity(
      req,
      'view_task_performance_trends',
      `Viewed task performance trends (${trends.length} data points)`,
      'salespersontasks',
      null,
      { filters }
    );

    return sendResponse(
      res,
      200,
      'Task performance trends retrieved successfully',
      { trends }
    );
  } catch (error) {
    console.error('Error in getTaskPerformanceTrends:', error);
    return sendResponse(
      res,
      400,
      'Failed to retrieve task performance trends',
      null,
      error.message
    );
  }
};

/**
 * Get average task completion time by priority
 * Shows how long it takes to complete tasks based on priority level
 */
export const getAverageCompletionTimeByPriority = async (req, res) => {
  try {
    const filters = {
      branch_id: req.query.branch_id
        ? new mongoose.Types.ObjectId(req.query.branch_id)
        : null,
      salesperson_id: req.query.salesperson_id
        ? new mongoose.Types.ObjectId(req.query.salesperson_id)
        : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const adminCategory = req.admin.category;
    const adminBranchesManaged = req.admin.branches_managed || [];

    const completionTimes =
      await salespersonPerformanceService.getAverageCompletionTimeByPriority(
        filters,
        adminCategory,
        adminBranchesManaged
      );

    // Log activity
    await logAdminActivity(
      req,
      'view_completion_time_by_priority',
      'Viewed average task completion time by priority',
      'salespersontasks',
      null,
      { filters }
    );

    return sendResponse(
      res,
      200,
      'Average completion time by priority retrieved successfully',
      { completionTimes }
    );
  } catch (error) {
    console.error('Error in getAverageCompletionTimeByPriority:', error);
    return sendResponse(
      res,
      400,
      'Failed to retrieve average completion time',
      null,
      error.message
    );
  }
};

/**
 * Get comprehensive performance overview
 * Provides overall statistics including tasks, orders, and revenue
 */
export const getPerformanceOverview = async (req, res) => {
  try {
    const filters = {
      branch_id: req.query.branch_id
        ? new mongoose.Types.ObjectId(req.query.branch_id)
        : null,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const adminCategory = req.admin.category;
    const adminBranchesManaged = req.admin.branches_managed || [];

    const overview = await salespersonPerformanceService.getPerformanceOverview(
      filters,
      adminCategory,
      adminBranchesManaged
    );

    // Log activity
    await logAdminActivity(
      req,
      'view_performance_overview',
      `Viewed performance overview (${overview.tasks.totalTasks} tasks, ${overview.activeSalespersons} salespersons)`,
      'salespersontasks',
      null,
      { filters }
    );

    return sendResponse(
      res,
      200,
      'Performance overview retrieved successfully',
      { overview }
    );
  } catch (error) {
    console.error('Error in getPerformanceOverview:', error);
    return sendResponse(
      res,
      400,
      'Failed to retrieve performance overview',
      null,
      error.message
    );
  }
};
