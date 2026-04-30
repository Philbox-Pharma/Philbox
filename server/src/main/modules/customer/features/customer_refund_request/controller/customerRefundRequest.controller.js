import customerRefundRequestService from '../service/customerRefundRequest.service.js';
import baseSendResponse from '../../../../../utils/sendResponse.js';

const sendResponse = (
  res,
  status,
  success,
  message,
  data = null,
  errorCode = null
) =>
  baseSendResponse(res, status, message, {
    success,
    data,
    error_code: errorCode,
  });

export const submitRefundRequest = async (req, res) => {
  try {
    const customerId = req.customer?.id || req.user?.id;
    const { orderId, reason, requestedItems } = req.body;

    // Validation
    if (
      !orderId ||
      !reason ||
      !requestedItems ||
      !Array.isArray(requestedItems) ||
      requestedItems.length === 0
    ) {
      return sendResponse(
        res,
        400,
        false,
        'Invalid request. orderId, reason, and requestedItems array are required.',
        null,
        'INVALID_REQUEST_DATA'
      );
    }

    // Validate each requested item
    for (const item of requestedItems) {
      if (!item.order_item_id || !item.quantity || item.quantity <= 0) {
        return sendResponse(
          res,
          400,
          false,
          'Each requested item must have order_item_id and valid quantity.',
          null,
          'INVALID_ITEM_DATA'
        );
      }
    }

    const refundRequest =
      await customerRefundRequestService.submitRefundRequest(
        customerId,
        orderId,
        reason,
        requestedItems
      );

    return sendResponse(
      res,
      201,
      true,
      'Refund request submitted successfully.',
      {
        request_id: refundRequest._id,
        status: refundRequest.status,
        order_id: refundRequest.order_id,
        total_requested_amount: refundRequest.total_requested_refund_amount,
        requested_items_count: refundRequest.requested_items.length,
        created_at: refundRequest.created_at,
      }
    );
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Order not found.',
        null,
        'ORDER_NOT_FOUND'
      );
    }
    if (error.message === 'ORDER_NOT_BELONGS_TO_CUSTOMER') {
      return sendResponse(
        res,
        403,
        false,
        'Order does not belong to you.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_NOT_REFUNDABLE') {
      return sendResponse(
        res,
        400,
        false,
        'Order is not in a refundable state.',
        null,
        'ORDER_NOT_REFUNDABLE'
      );
    }
    if (error.message === 'SOME_ORDER_ITEMS_NOT_FOUND') {
      return sendResponse(
        res,
        400,
        false,
        'Some requested items were not found in the order.',
        null,
        'SOME_ORDER_ITEMS_NOT_FOUND'
      );
    }
    if (error.message === 'REFUND_REQUEST_ALREADY_PENDING') {
      return sendResponse(
        res,
        400,
        false,
        'A refund request is already pending for this order.',
        null,
        'REFUND_REQUEST_ALREADY_PENDING'
      );
    }

    console.error('Error submitting refund request:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while submitting your refund request.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getMyRefundRequests = async (req, res) => {
  try {
    const customerId = req.customer?.id || req.user?.id;
    const { status } = req.query;

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const refundRequests =
      await customerRefundRequestService.getCustomerRefundRequests(
        customerId,
        filters
      );

    return sendResponse(
      res,
      200,
      true,
      'Refund requests retrieved successfully.',
      {
        requests: refundRequests,
        count: refundRequests.length,
      }
    );
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching your refund requests.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getRefundRequestDetails = async (req, res) => {
  try {
    const customerId = req.customer?.id || req.user?.id;
    const { requestId } = req.params;

    const refundRequestWithDetails =
      await customerRefundRequestService.getCustomerRefundRequestDetails(
        customerId,
        requestId
      );

    return sendResponse(
      res,
      200,
      true,
      'Refund request details retrieved successfully.',
      refundRequestWithDetails
    );
  } catch (error) {
    if (error.message === 'REFUND_REQUEST_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Refund request not found.',
        null,
        'REFUND_REQUEST_NOT_FOUND'
      );
    }

    console.error('Error fetching refund request details:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching refund request details.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};
