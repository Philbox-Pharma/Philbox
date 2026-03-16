import sendResponse from '../../../../../utils/sendResponse.js';
import { getDashboardData } from '../service/dashboard.service.js';

class SalespersonDashboardController {
  async getDashboard(req, res) {
    try {
      const activityLimit = parseInt(req.query.activityLimit || 10, 10);
      const dashboard = await getDashboardData(req, activityLimit);

      return sendResponse(res, 200, 'Dashboard data retrieved successfully', {
        success: true,
        data: dashboard,
      });
    } catch (error) {
      if (error.message === 'SALESPERSON_NOT_FOUND') {
        return sendResponse(res, 404, 'Salesperson not found');
      }

      return sendResponse(
        res,
        500,
        'Failed to fetch dashboard data',
        null,
        error.message
      );
    }
  }
}

export default new SalespersonDashboardController();
