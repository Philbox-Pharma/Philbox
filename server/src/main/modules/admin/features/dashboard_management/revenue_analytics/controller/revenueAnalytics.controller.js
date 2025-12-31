import sendResponse from '../../../../../../utils/sendResponse.js';
import RevenueAnalyticsService from '../services/revenueAnalytics.service.js';

/**
 * Get revenue trends (line chart data)
 */
export const getRevenueTrends = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getRevenueTrends(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Revenue trends fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get revenue split: appointments vs orders (pie chart data)
 */
export const getRevenueSplit = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getRevenueSplit(
      req.query,
      req
    );

    return sendResponse(res, 200, 'Revenue split fetched successfully', result);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get top branches by revenue (bar chart data - super admin only)
 */
export const getTopBranchesByRevenue = async (req, res) => {
  try {
    // Check if user is super admin
    if (!req.admin || req.admin.category !== 'super-admin') {
      return sendResponse(res, 403, 'Access denied. Super admin only.', null);
    }

    const result = await RevenueAnalyticsService.getTopBranchesByRevenue(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Top branches by revenue fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get refund statistics (bar chart data)
 */
export const getRefundStatistics = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getRefundStatistics(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Refund statistics fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get average revenue per customer (KPI)
 */
export const getAverageRevenuePerCustomer = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getAverageRevenuePerCustomer(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Average revenue per customer fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get payment method breakdown (pie chart data)
 */
export const getPaymentMethodBreakdown = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getPaymentMethodBreakdown(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Payment method breakdown fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get dashboard overview (all KPIs and charts)
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const result = await RevenueAnalyticsService.getDashboardOverview(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Dashboard overview fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
