import sendResponse from '../../../../../utils/sendResponse.js';
import {
  getLowStockAlerts,
  getLowStockAlertsCount,
  resolveLowStockAlert,
  updateMedicineThreshold,
} from '../service/lowStockAlerts.service.js';

class LowStockAlertsController {
  async getLowStockAlerts(req, res) {
    try {
      const data = await getLowStockAlerts(req, req.query);
      return sendResponse(res, 200, 'Low stock alerts fetched successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to fetch low stock alerts',
        null,
        error.message
      );
    }
  }

  async getLowStockCount(req, res) {
    try {
      const { branchId = null } = req.query;
      const data = await getLowStockAlertsCount(req, branchId);
      return sendResponse(res, 200, 'Low stock counts fetched successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to fetch low stock counts',
        null,
        error.message
      );
    }
  }

  async resolveLowStockAlert(req, res) {
    try {
      const { stockId } = req.params;
      const data = await resolveLowStockAlert(req, stockId);
      return sendResponse(res, 200, 'Low stock alert resolved successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to resolve low stock alert',
        null,
        error.message
      );
    }
  }

  async updateThreshold(req, res) {
    try {
      const { medicineId } = req.params;
      const { threshold } = req.body;
      const data = await updateMedicineThreshold(req, medicineId, threshold);
      return sendResponse(
        res,
        200,
        'Low stock threshold updated successfully',
        {
          success: true,
          data,
        }
      );
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to update low stock threshold',
        null,
        error.message
      );
    }
  }
}

export default new LowStockAlertsController();
