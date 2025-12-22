import feedbackComplaintsAnalyticsService from '../services/feedbackComplaintsAnalytics.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';

export const getReviewSentimentAnalysis = async (req, res) => {
  try {
    const result =
      await feedbackComplaintsAnalyticsService.getReviewSentimentAnalysis(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Review sentiment analysis retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getReviewSentimentAnalysis controller:', error);
    sendResponse(res, 500, 'Failed to retrieve review sentiment analysis');
  }
};

export const getComplaintResolutionTime = async (req, res) => {
  try {
    const result =
      await feedbackComplaintsAnalyticsService.getComplaintResolutionTime(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Complaint resolution time retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getComplaintResolutionTime controller:', error);
    sendResponse(res, 500, 'Failed to retrieve complaint resolution time');
  }
};

export const getComplaintsByCategory = async (req, res) => {
  try {
    const result =
      await feedbackComplaintsAnalyticsService.getComplaintsByCategory(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Complaints by category retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getComplaintsByCategory controller:', error);
    sendResponse(res, 500, 'Failed to retrieve complaints by category');
  }
};

export const getFeedbackByCategory = async (req, res) => {
  try {
    const result =
      await feedbackComplaintsAnalyticsService.getFeedbackByCategory(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Feedback by category retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getFeedbackByCategory controller:', error);
    sendResponse(res, 500, 'Failed to retrieve feedback by category');
  }
};

export const getComplaintResolutionStatus = async (req, res) => {
  try {
    const result =
      await feedbackComplaintsAnalyticsService.getComplaintResolutionStatus(
        req.query,
        req
      );
    sendResponse(
      res,
      200,
      'Complaint resolution status retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getComplaintResolutionStatus controller:', error);
    sendResponse(res, 500, 'Failed to retrieve complaint resolution status');
  }
};

export const getFeedbackTrends = async (req, res) => {
  try {
    const result = await feedbackComplaintsAnalyticsService.getFeedbackTrends(
      req.query,
      req
    );
    sendResponse(res, 200, 'Feedback trends retrieved successfully', result);
  } catch (error) {
    console.error('Error in getFeedbackTrends controller:', error);
    sendResponse(res, 500, 'Failed to retrieve feedback trends');
  }
};

export const getComplaintTrends = async (req, res) => {
  try {
    const result = await feedbackComplaintsAnalyticsService.getComplaintTrends(
      req.query,
      req
    );
    sendResponse(res, 200, 'Complaint trends retrieved successfully', result);
  } catch (error) {
    console.error('Error in getComplaintTrends controller:', error);
    sendResponse(res, 500, 'Failed to retrieve complaint trends');
  }
};

export const getOverallSummary = async (req, res) => {
  try {
    const result = await feedbackComplaintsAnalyticsService.getOverallSummary(
      req.query,
      req
    );
    sendResponse(
      res,
      200,
      'Overall feedback and complaints summary retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getOverallSummary controller:', error);
    sendResponse(
      res,
      500,
      'Failed to retrieve overall feedback and complaints summary'
    );
  }
};

export const exportReportData = async (req, res) => {
  try {
    const result = await feedbackComplaintsAnalyticsService.exportReportData(
      req.query,
      req
    );
    sendResponse(res, 200, 'Report data exported successfully', result);
  } catch (error) {
    console.error('Error in exportReportData controller:', error);
    sendResponse(res, 500, 'Failed to export report data');
  }
};
