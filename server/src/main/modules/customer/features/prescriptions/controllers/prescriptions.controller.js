import sendResponse from '../../../../../utils/sendResponse.js';
import customerPrescriptionsService from '../service/prescriptions.service.js';

class CustomerPrescriptionsController {
  _getCustomerId(req) {
    return (
      req.user?.id ||
      req.user?._id ||
      req.customer?._id ||
      req.customer?.id ||
      req.session?.customerId ||
      null
    );
  }

  _parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  async getMyPrescriptions(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result = await customerPrescriptionsService.getMyPrescriptions(
        customerId,
        {
          search: req.query.search || null,
          type: req.query.type || 'all',
          doctorId: req.query.doctor_id || req.query.doctorId || null,
          fromDate: req.query.from_date || null,
          toDate: req.query.to_date || null,
          sortBy: req.query.sort_by || req.query.sortBy || 'created_at',
          sortOrder: req.query.sort_order || req.query.sortOrder || 'desc',
          page: this._parsePositiveInt(req.query.page, 1),
          limit: this._parsePositiveInt(req.query.limit, 10),
        }
      );

      return sendResponse(
        res,
        200,
        'Prescriptions fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Get prescriptions error:', error);
      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getPrescriptionStats(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result =
        await customerPrescriptionsService.getPrescriptionStats(customerId);

      return sendResponse(
        res,
        200,
        'Prescription stats fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Get prescription stats error:', error);
      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getUploadedPrescriptions(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result =
        await customerPrescriptionsService.getUploadedPrescriptions(
          customerId,
          {
            page: this._parsePositiveInt(req.query.page, 1),
            limit: this._parsePositiveInt(req.query.limit, 10),
          }
        );

      return sendResponse(
        res,
        200,
        'Uploaded prescriptions fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Get uploaded prescriptions error:', error);
      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async uploadPrescription(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result = await customerPrescriptionsService.uploadPrescription(
        customerId,
        req.file,
        {
          notes: req.body?.notes || null,
          prescriptionType:
            req.body?.prescription_type ||
            req.body?.prescriptionType ||
            'general',
          orderId: req.body?.order_id || req.body?.orderId || null,
        }
      );

      return sendResponse(res, 201, 'PRESCRIPTION_UPLOADED', result.data);
    } catch (error) {
      console.error('Upload prescription error:', error);

      if (error.message === 'PRESCRIPTION_FILE_REQUIRED') {
        return sendResponse(res, 400, 'Prescription file is required');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getPrescriptionPDF(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { prescriptionId } = req.params;
      const result = await customerPrescriptionsService.getPrescriptionPDF(
        customerId,
        prescriptionId
      );

      return sendResponse(
        res,
        200,
        'PDF URL retrieved successfully',
        result.data
      );
    } catch (error) {
      console.error('Get prescription PDF error:', error);

      if (error.message === 'PRESCRIPTION_NOT_FOUND') {
        return sendResponse(res, 404, 'Prescription not found');
      }
      if (error.message === 'PRESCRIPTION_NOT_APPROVED') {
        return sendResponse(
          res,
          400,
          'Prescription has not been approved for cart access yet',
          null,
          'PRESCRIPTION_NOT_APPROVED'
        );
      }
      if (error.message === 'PRESCRIPTION_ALLOW_PAYLOAD_EMPTY') {
        return sendResponse(
          res,
          400,
          'Approved prescription does not contain any allowed medicines',
          null,
          'PRESCRIPTION_ALLOW_PAYLOAD_EMPTY'
        );
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getPrescriptionDetails(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { prescriptionId } = req.params;
      const result = await customerPrescriptionsService.getPrescriptionDetails(
        customerId,
        prescriptionId
      );

      return sendResponse(
        res,
        200,
        'Prescription details fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Get prescription details error:', error);

      if (error.message === 'PRESCRIPTION_NOT_FOUND') {
        return sendResponse(res, 404, 'Prescription not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async addPrescriptionMedicinesToCart(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { prescriptionId } = req.params;
      const result =
        await customerPrescriptionsService.addPrescriptionMedicinesToCart(
          customerId,
          prescriptionId
        );

      return sendResponse(
        res,
        200,
        'Prescription medicines added to cart successfully',
        result.data
      );
    } catch (error) {
      console.error('Add prescription medicines to cart error:', error);

      if (error.message === 'PRESCRIPTION_NOT_FOUND') {
        return sendResponse(res, 404, 'Prescription not found');
      }
      if (error.message === 'PRESCRIPTION_HAS_NO_MEDICINES') {
        return sendResponse(
          res,
          400,
          'Prescription does not contain medicines'
        );
      }
      if (error.message === 'PRESCRIPTION_NOT_APPROVED') {
        return sendResponse(
          res,
          400,
          'Prescription has not been approved for cart access yet',
          null,
          'PRESCRIPTION_NOT_APPROVED'
        );
      }
      if (error.message === 'PRESCRIPTION_ALLOW_PAYLOAD_EMPTY') {
        return sendResponse(
          res,
          400,
          'Approved prescription does not contain any allowed medicines',
          null,
          'PRESCRIPTION_ALLOW_PAYLOAD_EMPTY'
        );
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }
}

export default new CustomerPrescriptionsController();
