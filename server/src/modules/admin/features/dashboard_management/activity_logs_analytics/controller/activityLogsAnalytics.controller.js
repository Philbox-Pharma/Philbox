import activityLogsAnalyticsService from '../services/activityLogsAnalytics.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';

// Get Admin and Salesperson Actions Timeline
export const getActionsTimeline = async (req, res) => {
  try {
    const data = await activityLogsAnalyticsService.getActionsTimeline(
      req.query,
      req
    );
    sendResponse(res, 200, 'Activity timeline retrieved successfully', data);
  } catch (error) {
    sendResponse(res, 500, error.message, null, error.message);
  }
};

// Get Most Frequent Actions
export const getMostFrequentActions = async (req, res) => {
  try {
    const data = await activityLogsAnalyticsService.getMostFrequentActions(
      req.query,
      req
    );
    sendResponse(res, 200, 'Frequent actions retrieved successfully', data);
  } catch (error) {
    sendResponse(res, 500, error.message, null, error.message);
  }
};

// Get Login Attempts by Role
export const getLoginAttemptsByRole = async (req, res) => {
  try {
    const data = await activityLogsAnalyticsService.getLoginAttemptsByRole(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Login attempts by role retrieved successfully',
      data
    );
  } catch (error) {
    sendResponse(res, 500, error.message, null, error.message);
  }
};

// Get Suspicious Activities
export const getSuspiciousActivities = async (req, res) => {
  try {
    const data = await activityLogsAnalyticsService.getSuspiciousActivities(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Suspicious activities retrieved successfully',
      data
    );
  } catch (error) {
    sendResponse(res, 500, error.message, null, error.message);
  }
};

// Get Activity Overview Summary
export const getActivityOverview = async (req, res) => {
  try {
    const data = await activityLogsAnalyticsService.getActivityOverview(
      req.query,
      req
    );
    sendResponse(res, 200, 'Activity overview retrieved successfully', data);
  } catch (error) {
    sendResponse(res, 500, error.message, null, error.message);
  }
};
