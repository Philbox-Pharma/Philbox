import sendResponse from '../../../../../utils/sendResponse.js';
import {
  generateExcelTemplate,
  previewInventoryUpload,
  processInventoryUpload,
  listUnresolvedInventoryErrors,
  resolveInventoryErrorLog,
} from '../service/inventoryUpload.service.js';

class InventoryUploadController {
  async downloadTemplate(req, res) {
    try {
      const buffer = generateExcelTemplate();
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=inventory_template.xlsx'
      );
      return res.status(200).send(buffer);
    } catch (error) {
      return sendResponse(
        res,
        500,
        'Failed to generate inventory template',
        null,
        error.message
      );
    }
  }

  async preview(req, res) {
    try {
      const data = await previewInventoryUpload(req.file);
      return sendResponse(
        res,
        200,
        'Inventory preview generated successfully',
        {
          success: true,
          data,
        }
      );
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to preview inventory file',
        null,
        error.details || error.message
      );
    }
  }

  async confirmUpload(req, res) {
    try {
      const data = await processInventoryUpload(req, req.file);
      return sendResponse(res, 200, 'Inventory uploaded successfully', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to upload inventory file',
        null,
        error.details || error.message
      );
    }
  }

  async upload(req, res) {
    return this.confirmUpload(req, res);
  }

  async unresolvedErrors(req, res) {
    try {
      const data = await listUnresolvedInventoryErrors(
        req,
        req.params.uploadedFileId
      );

      return sendResponse(res, 200, 'Unresolved inventory errors fetched', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to fetch unresolved inventory errors',
        null,
        error.details || error.message
      );
    }
  }

  async resolveErrorLog(req, res) {
    try {
      const data = await resolveInventoryErrorLog(
        req,
        req.params.uploadedFileId,
        req.params.logId,
        req.body || {}
      );

      return sendResponse(res, 200, 'Inventory row resolution completed', {
        success: true,
        data,
      });
    } catch (error) {
      return sendResponse(
        res,
        error.status || 500,
        error.message || 'Failed to resolve inventory row',
        null,
        error.details || error.message
      );
    }
  }
}

export default new InventoryUploadController();
