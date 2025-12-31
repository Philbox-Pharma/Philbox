import sendResponse from '../../../../../../utils/sendResponse.js';
import AppointmentAnalyticsService from '../services/appointmentAnalytics.service.js';

/**
 * Get appointment trends (line chart data)
 */
export const getAppointmentTrends = async (req, res) => {
  try {
    const result = await AppointmentAnalyticsService.getAppointmentTrends(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Appointment trends fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get completion vs missed rate (pie chart data)
 */
export const getCompletionMissedRate = async (req, res) => {
  try {
    const result = await AppointmentAnalyticsService.getCompletionMissedRate(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Completion rate fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get top doctors by appointments (bar chart data)
 */
export const getTopDoctorsByAppointments = async (req, res) => {
  try {
    const result =
      await AppointmentAnalyticsService.getTopDoctorsByAppointments(
        req.query,
        req
      );

    return sendResponse(
      res,
      200,
      'Top doctors by appointments fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get top doctors by revenue (bar chart data)
 */
export const getTopDoctorsByRevenue = async (req, res) => {
  try {
    const result = await AppointmentAnalyticsService.getTopDoctorsByRevenue(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Top doctors by revenue fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get appointment types distribution (pie chart data)
 */
export const getAppointmentTypesDistribution = async (req, res) => {
  try {
    const result =
      await AppointmentAnalyticsService.getAppointmentTypesDistribution(
        req.query,
        req
      );

    return sendResponse(
      res,
      200,
      'Appointment types distribution fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get average appointment revenue (KPI card)
 */
export const getAverageRevenue = async (req, res) => {
  try {
    const result = await AppointmentAnalyticsService.getAverageRevenue(
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Average revenue fetched successfully',
      result
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/**
 * Get dashboard overview (all analytics in one call)
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const result = await AppointmentAnalyticsService.getDashboardOverview(
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

/**
 * Aggregate appointment data (admin utility endpoint)
 */
export const aggregateAppointmentData = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return sendResponse(res, 400, 'Date is required');
    }

    const result =
      await AppointmentAnalyticsService.aggregateAppointmentData(date);

    return sendResponse(res, 200, 'Data aggregated successfully', result);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
