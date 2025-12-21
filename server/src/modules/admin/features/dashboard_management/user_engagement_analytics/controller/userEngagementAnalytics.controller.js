import userEngagementAnalyticsService from '../services/userEngagementAnalytics.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';

export const getNewCustomersTrends = async (req, res) => {
  try {
    const result = await userEngagementAnalyticsService.getNewCustomersTrends(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'New customers trends retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getNewCustomersTrends controller:', error);
    sendResponse(res, 500, 'Failed to retrieve new customers trends');
  }
};

export const getCustomerActivityStatus = async (req, res) => {
  try {
    const result =
      await userEngagementAnalyticsService.getCustomerActivityStatus(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Customer activity status retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getCustomerActivityStatus controller:', error);
    sendResponse(res, 500, 'Failed to retrieve customer activity status');
  }
};

export const getDoctorApplicationsBreakdown = async (req, res) => {
  try {
    const result =
      await userEngagementAnalyticsService.getDoctorApplicationsBreakdown(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Doctor applications breakdown retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getDoctorApplicationsBreakdown controller:', error);
    sendResponse(res, 500, 'Failed to retrieve doctor applications breakdown');
  }
};

export const getDoctorActivityTrends = async (req, res) => {
  try {
    const result = await userEngagementAnalyticsService.getDoctorActivityTrends(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Doctor activity trends retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getDoctorActivityTrends controller:', error);
    sendResponse(res, 500, 'Failed to retrieve doctor activity trends');
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const result = await userEngagementAnalyticsService.getTopCustomers(
      req.query,
      req
    );
    sendResponse(res, 200, 'Top customers retrieved successfully', result);
  } catch (error) {
    console.error('Error in getTopCustomers controller:', error);
    sendResponse(res, 500, 'Failed to retrieve top customers');
  }
};

export const getCustomerRetentionRate = async (req, res) => {
  try {
    const result =
      await userEngagementAnalyticsService.getCustomerRetentionRate(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Customer retention rate retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getCustomerRetentionRate controller:', error);
    sendResponse(res, 500, 'Failed to retrieve customer retention rate');
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const result = await userEngagementAnalyticsService.getDashboardOverview(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'User engagement dashboard overview retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getDashboardOverview controller:', error);
    sendResponse(res, 500, 'Failed to retrieve dashboard overview');
  }
};
