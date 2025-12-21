import ordersAnalyticsService from '../services/ordersAnalytics.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';

export const getOrdersTrends = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getOrdersTrends(req.query, req);
    sendResponse(res, 200, 'Orders trends retrieved successfully', result);
  } catch (error) {
    console.error('Error in getOrdersTrends controller:', error);
    sendResponse(res, 500, 'Failed to retrieve orders trends');
  }
};

export const getOrderStatusBreakdown = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getOrderStatusBreakdown(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Order status breakdown retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getOrderStatusBreakdown controller:', error);
    sendResponse(res, 500, 'Failed to retrieve order status breakdown');
  }
};

export const getTopSellingMedicines = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getTopSellingMedicines(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Top selling medicines retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getTopSellingMedicines controller:', error);
    sendResponse(res, 500, 'Failed to retrieve top selling medicines');
  }
};

export const getStockAlerts = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getStockAlerts(req.query, req);
    sendResponse(res, 200, 'Stock alerts retrieved successfully', result);
  } catch (error) {
    console.error('Error in getStockAlerts controller:', error);
    sendResponse(res, 500, 'Failed to retrieve stock alerts');
  }
};

export const getRevenueByCategory = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getRevenueByCategory(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Revenue by category retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getRevenueByCategory controller:', error);
    sendResponse(res, 500, 'Failed to retrieve revenue by category');
  }
};

export const getOrderRefundRate = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getOrderRefundRate(
      req.query,
      req
    );
    sendResponse(res, 200, 'Order refund rate retrieved successfully', result);
  } catch (error) {
    console.error('Error in getOrderRefundRate controller:', error);
    sendResponse(res, 500, 'Failed to retrieve order refund rate');
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const result = await ordersAnalyticsService.getDashboardOverview(
      req.query,
      req
    );
    sendResponse(res, 200, 'Dashboard overview retrieved successfully', result);
  } catch (error) {
    console.error('Error in getDashboardOverview controller:', error);
    sendResponse(res, 500, 'Failed to retrieve dashboard overview');
  }
};
