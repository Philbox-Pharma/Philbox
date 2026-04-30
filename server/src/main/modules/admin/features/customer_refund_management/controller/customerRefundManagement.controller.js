import customerRefundRequestService from '../../../../customer/features/customer_refund_request/service/customerRefundRequest.service.js';
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

export const getPendingRefundRequests = async (req, res) => {
  try {
    const {
      customerId,
      sortBy = 'created_at',
      order = 'asc',
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (customerId) {
      filters.customerId = customerId;
    }

    let refundRequests =
      await customerRefundRequestService.getPendingRefundRequests(filters);

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    refundRequests.sort((a, b) => {
      if (sortBy === 'created_at') {
        return (new Date(a.created_at) - new Date(b.created_at)) * sortOrder;
      }
      if (sortBy === 'amount') {
        return (
          (a.total_requested_refund_amount - b.total_requested_refund_amount) *
          sortOrder
        );
      }
      return 0;
    });

    // Paginate
    const startIdx = (page - 1) * limit;
    const paginatedRequests = refundRequests.slice(startIdx, startIdx + limit);

    return sendResponse(
      res,
      200,
      true,
      'Pending refund requests retrieved successfully.',
      {
        requests: paginatedRequests,
        total_count: refundRequests.length,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(refundRequests.length / limit),
      }
    );
  } catch (error) {
    console.error('Error fetching pending refund requests:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching pending refund requests.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const approveAndAllocateRefund = async (req, res) => {
  try {
    const superAdminId = req.admin?.id;
    const { requestId } = req.params;
    const { approvedItems, notes } = req.body;

    if (Array.isArray(approvedItems)) {
      for (const item of approvedItems) {
        if (!item.order_item_id || !item.branch_id) {
          return sendResponse(
            res,
            400,
            false,
            'Each approved item must have order_item_id and branch_id.',
            null,
            'INVALID_ITEM_DATA'
          );
        }
      }
    }

    const result = await customerRefundRequestService.approveAndAllocateRefund(
      requestId,
      approvedItems,
      superAdminId,
      notes
    );

    return sendResponse(
      res,
      200,
      true,
      'Refund approved and allocated to branches successfully.',
      {
        refund_request: {
          id: result.refund_request._id,
          status: result.refund_request.status,
          total_approved_amount: result.refund_request.requested_items.reduce(
            (sum, item) => sum + item.requested_refund_amount,
            0
          ),
        },
        allocations_created: result.allocations.length,
        allocations: result.allocations.map(a => ({
          id: a._id,
          branch_id: a.branch_id,
          status: a.status,
          total_amount: a.total_allocation_amount,
          items_count: a.allocated_items.length,
        })),
      }
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
    if (error.message === 'INVALID_APPROVED_ITEMS') {
      return sendResponse(
        res,
        400,
        false,
        'Some approved items are not in the refund request.',
        null,
        'INVALID_APPROVED_ITEMS'
      );
    }

    console.error('Error approving and allocating refund:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while approving and allocating the refund.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const rejectRefundRequest = async (req, res) => {
  try {
    const superAdminId = req.admin?.id;
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return sendResponse(
        res,
        400,
        false,
        'rejectionReason is required.',
        null,
        'INVALID_REQUEST_DATA'
      );
    }

    const refundRequest =
      await customerRefundRequestService.rejectRefundRequest(
        requestId,
        superAdminId,
        rejectionReason
      );

    return sendResponse(
      res,
      200,
      true,
      'Refund request rejected successfully.',
      {
        request_id: refundRequest._id,
        status: refundRequest.status,
        rejection_reason: refundRequest.rejection_reason,
      }
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

    console.error('Error rejecting refund request:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while rejecting the refund request.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const processFinalRefundToCustomer = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result =
      await customerRefundRequestService.processFinalRefundToCustomer(
        requestId
      );

    return sendResponse(
      res,
      200,
      true,
      'Refund processed to customer successfully.',
      {
        refund_request_id: result.refund_request._id,
        refund_transaction_id: result.refund_transaction._id,
        total_refund_amount: result.total_refund_amount,
        status: result.refund_request.status,
        completed_at: result.refund_request.completed_at,
      }
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
    if (error.message === 'NOT_ALL_BRANCHES_COMPLETED') {
      return sendResponse(
        res,
        400,
        false,
        'Not all branch allocations have been completed yet.',
        null,
        'NOT_ALL_BRANCHES_COMPLETED'
      );
    }

    console.error('Error processing final refund:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while processing the final refund.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};
