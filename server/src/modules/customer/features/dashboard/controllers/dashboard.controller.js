import customerDashboardService from '../service/dashboard.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

/**
 * Get customer dashboard data
 */
export const getDashboard = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const dashboardData = await customerDashboardService.getDashboardData(
      customerId,
      req
    );

    return sendResponse(
      res,
      200,
      'Dashboard data fetched successfully',
      dashboardData
    );
  } catch (err) {
    console.error('Dashboard Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
