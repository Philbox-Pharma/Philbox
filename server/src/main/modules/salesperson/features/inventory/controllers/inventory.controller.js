import sendResponse from '../../../../../utils/sendResponse.js';
import {
  inventoryQuerySchema,
  updateStockSchema,
} from '../../../../../dto/salesperson/inventory.dto.js';
import inventoryService from '../service/inventory.service.js';

class InventoryController {
  async listInventory(req, res) {
    try {
      const { error, value } = inventoryQuerySchema.validate(req.query);
      if (error) {
        return sendResponse(
          res,
          400,
          'Validation error',
          null,
          error.details.map(detail => detail.message)
        );
      }

      const data = await inventoryService.listInventory(value, req);
      return sendResponse(res, 200, 'Inventory retrieved successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to retrieve inventory',
        null,
        error.details || error.message
      );
    }
  }

  async getMedicineDetails(req, res) {
    try {
      const data = await inventoryService.getMedicineDetails(
        req.params.medicineId,
        req
      );
      return sendResponse(res, 200, 'Medicine details retrieved successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to retrieve medicine details',
        null,
        error.details || error.message
      );
    }
  }

  async updateStock(req, res) {
    try {
      const { error, value } = updateStockSchema.validate(req.body);
      if (error) {
        return sendResponse(
          res,
          400,
          'Validation error',
          null,
          error.details.map(detail => detail.message)
        );
      }

      const data = await inventoryService.updateStock(
        req.params.medicineId,
        value,
        req
      );
      return sendResponse(res, 200, 'Stock updated successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to update stock',
        null,
        error.details || error.message
      );
    }
  }

  async discontinueMedicine(req, res) {
    try {
      const data = await inventoryService.discontinueMedicine(
        req.params.medicineId,
        req
      );

      return sendResponse(res, 200, 'Medicine discontinued successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to discontinue medicine',
        null,
        error.details || error.message
      );
    }
  }

  async softDeleteMedicine(req, res) {
    try {
      const data = await inventoryService.softDeleteMedicine(
        req.params.medicineId,
        req
      );

      return sendResponse(res, 200, data.message, {
        success: true,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to delete medicine',
        null,
        error.details || error.message
      );
    }
  }

  async getMedicineAuditLogs(req, res) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      const data = await inventoryService.getMedicineAuditLogs(
        req.params.medicineId,
        { page, limit },
        req
      );

      return sendResponse(res, 200, 'Audit logs retrieved successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to retrieve audit logs',
        null,
        error.details || error.message
      );
    }
  }

  async exportInventory(req, res) {
    try {
      const buffer = await inventoryService.exportInventory(req);
      const timestamp = Date.now();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=inventory-export-${timestamp}.xlsx`
      );

      return res.status(200).send(buffer);
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to export inventory',
        null,
        error.details || error.message
      );
    }
  }
}

export default new InventoryController();
