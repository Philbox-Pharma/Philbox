import customerService from '../services/customer.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

class CustomerController {
  /**
   * Get All Customers with filters and pagination
   * @route GET /api/super-admin/customers
   */
  async getCustomers(req, res) {
    try {
      const result = await customerService.getCustomers(req.query, req);

      return sendResponse(res, 200, 'Customers retrieved successfully', result);
    } catch (error) {
      console.error('Error in getCustomers controller:', error);
      return sendResponse(
        res,
        500,
        'Failed to retrieve customers',
        null,
        error.message
      );
    }
  }

  /**
   * Get Single Customer Details
   * @route GET /api/super-admin/customers/:id
   */
  async getCustomerById(req, res) {
    try {
      const result = await customerService.getCustomerById(req.params.id, req);

      return sendResponse(
        res,
        200,
        'Customer details retrieved successfully',
        result
      );
    } catch (error) {
      console.error('Error in getCustomerById controller:', error);

      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(
          res,
          404,
          'Customer not found',
          null,
          error.message
        );
      }

      if (error.message === 'UNAUTHORIZED_ACCESS') {
        return sendResponse(
          res,
          403,
          'You do not have access to this customer',
          null,
          error.message
        );
      }

      return sendResponse(
        res,
        500,
        'Failed to retrieve customer details',
        null,
        error.message
      );
    }
  }

  /**
   * Toggle Customer Account Status
   * @route PATCH /api/super-admin/customers/:id/status
   */
  async toggleCustomerStatus(req, res) {
    try {
      const { status, reason } = req.body;

      const result = await customerService.toggleCustomerStatus(
        req.params.id,
        status,
        reason,
        req
      );

      return sendResponse(
        res,
        200,
        'Customer status updated successfully',
        result
      );
    } catch (error) {
      console.error('Error in toggleCustomerStatus controller:', error);

      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(
          res,
          404,
          'Customer not found',
          null,
          error.message
        );
      }

      if (error.message === 'INVALID_STATUS') {
        return sendResponse(
          res,
          400,
          'Invalid status value',
          null,
          error.message
        );
      }

      return sendResponse(
        res,
        500,
        'Failed to update customer status',
        null,
        error.message
      );
    }
  }

  /**
   * Get Customer Metrics
   * @route GET /api/super-admin/customers/metrics/analytics
   */
  async getCustomerMetrics(req, res) {
    try {
      const { branchId } = req.query;

      const result = await customerService.getCustomerMetrics(branchId, req);

      return sendResponse(
        res,
        200,
        'Customer metrics retrieved successfully',
        result
      );
    } catch (error) {
      console.error('Error in getCustomerMetrics controller:', error);
      return sendResponse(
        res,
        500,
        'Failed to retrieve customer metrics',
        null,
        error.message
      );
    }
  }
}

export default new CustomerController();
