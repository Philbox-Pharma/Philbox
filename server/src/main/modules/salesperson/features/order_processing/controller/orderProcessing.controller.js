import salespersonOrderProcessingService from '../service/orderProcessing.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';

const logOrderProcessingActivity = async (
  req,
  actionType,
  description,
  targetId = null,
  changes = {}
) => {
  await logSalespersonActivity(
    req,
    actionType,
    description,
    'orders',
    targetId,
    changes
  );
};

export const getPendingOrdersForProcessing = async (req, res) => {
  try {
    const branchId = req.branchId; // From salesperson token
    const salespersonId = req.userId;
    const { status, customerId, dateFrom, dateTo } = req.query;

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (customerId) {
      filters.customerId = customerId;
    }
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    const orders =
      await salespersonOrderProcessingService.getPendingOrdersForSalesperson(
        branchId,
        salespersonId,
        filters
      );

    await logOrderProcessingActivity(
      req,
      'view_processing_orders',
      'Viewed orders requiring processing',
      null,
      {
        branch_id: branchId,
        filters,
        total_count: orders.length,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Pending orders retrieved successfully.',
      {
        orders,
        total_count: orders.length,
      }
    );
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching pending orders.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getAllPendingOrdersForSalesperson = async (req, res) => {
  try {
    const branchId = req.branchId;
    const salespersonId = req.userId;
    const { customerId, dateFrom, dateTo } = req.query;

    const filters = {
      status: 'pending',
    };

    if (customerId) {
      filters.customerId = customerId;
    }
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    const orders =
      await salespersonOrderProcessingService.getAllPendingOrdersForSalesperson(
        branchId,
        salespersonId,
        filters
      );

    await logOrderProcessingActivity(
      req,
      'view_pending_orders',
      'Viewed pending orders',
      null,
      {
        branch_id: branchId,
        filters,
        total_count: orders.length,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Pending orders retrieved successfully.',
      {
        orders,
        total_count: orders.length,
      }
    );
  } catch (error) {
    console.error('Error fetching all pending orders:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching pending orders.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getCancellationRequestsForSalesperson = async (req, res) => {
  try {
    const branchId = req.branchId;
    const salespersonId = req.userId;
    const { customerId, dateFrom, dateTo } = req.query;

    const filters = {};

    if (customerId) {
      filters.customerId = customerId;
    }
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    const orders =
      await salespersonOrderProcessingService.getCancellationRequestsForSalesperson(
        branchId,
        salespersonId,
        filters
      );

    await logOrderProcessingActivity(
      req,
      'view_cancellation_requests',
      'Viewed cancellation requests',
      null,
      {
        branch_id: branchId,
        filters,
        total_count: orders.length,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Cancellation requests retrieved successfully.',
      {
        orders,
        total_count: orders.length,
      }
    );
  } catch (error) {
    console.error('Error fetching cancellation requests:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching cancellation requests.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getOrderDetailsForProcessing = async (req, res) => {
  try {
    const branchId = req.branchId;
    const salespersonId = req.userId;
    const { orderId } = req.params;

    const orderDetails =
      await salespersonOrderProcessingService.getOrderDetailsForProcessing(
        orderId,
        branchId,
        salespersonId
      );

    await logOrderProcessingActivity(
      req,
      'view_order_details',
      `Viewed order details for order ${orderId}`,
      orderId,
      {
        branch_id: branchId,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Order details retrieved successfully.',
      orderDetails
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
    if (error.message === 'ORDER_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This order is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_NOT_ASSIGNED_TO_YOU') {
      return sendResponse(
        res,
        403,
        false,
        'This order is assigned to another salesperson.',
        null,
        'ACCESS_DENIED'
      );
    }

    console.error('Error fetching order details:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching order details.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const searchOrders = async (req, res) => {
  try {
    const branchId = req.branchId;
    const salespersonId = req.userId;
    const { query, status, sortBy } = req.query;

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (sortBy) {
      filters.sortBy = sortBy;
    }

    const results =
      await salespersonOrderProcessingService.searchOrdersForSalesperson(
        branchId,
        salespersonId,
        query || '',
        filters
      );

    await logOrderProcessingActivity(
      req,
      'search_orders',
      'Searched orders in order processing',
      null,
      {
        branch_id: branchId,
        query: query || '',
        filters,
        total_count: results.length,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Orders search completed successfully.',
      {
        results,
        total_count: results.length,
      }
    );
  } catch (error) {
    console.error('Error searching orders:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while searching orders.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const markOrderAsPacked = async (req, res) => {
  try {
    const salespersonId = req.userId;
    const branchId = req.branchId;
    const { orderId } = req.params;
    const { packing_notes } = req.body;

    const updatedOrder =
      await salespersonOrderProcessingService.markOrderAsPacked(
        orderId,
        salespersonId,
        packing_notes || '',
        branchId
      );

    await logOrderProcessingActivity(
      req,
      'mark_order_packed',
      `Marked order ${orderId} as packed`,
      orderId,
      {
        branch_id: branchId,
        packing_notes: packing_notes || '',
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Order marked as packed successfully.',
      {
        order_id: updatedOrder._id,
        order_reference: String(updatedOrder._id),
        status: updatedOrder.status,
        packing_notes: updatedOrder.packing_notes,
        packed_at: updatedOrder.packed_at,
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
    if (error.message === 'ORDER_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This order is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_NOT_ASSIGNED_TO_YOU') {
      return sendResponse(
        res,
        403,
        false,
        'This order is assigned to another salesperson.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_CANCELLATION_REQUEST_PENDING') {
      return sendResponse(
        res,
        400,
        false,
        'Order has a pending cancellation request and cannot be packed.',
        null,
        'ORDER_CANCELLATION_REQUEST_PENDING'
      );
    }

    console.error('Error marking order as packed:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while marking order as packed.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const markOrderAsReadyForDelivery = async (req, res) => {
  try {
    const salespersonId = req.userId;
    const branchId = req.branchId;
    const { orderId } = req.params;

    const updatedOrder =
      await salespersonOrderProcessingService.markOrderAsReadyForDelivery(
        orderId,
        salespersonId,
        branchId
      );

    await logOrderProcessingActivity(
      req,
      'mark_order_ready_for_delivery',
      `Marked order ${orderId} as ready for delivery`,
      orderId,
      {
        branch_id: branchId,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Order marked as ready for delivery successfully.',
      {
        order_id: updatedOrder._id,
        order_reference: String(updatedOrder._id),
        status: updatedOrder.status,
        ready_for_delivery_at: updatedOrder.ready_for_delivery_at,
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
    if (error.message === 'ORDER_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This order is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_NOT_ASSIGNED_TO_YOU') {
      return sendResponse(
        res,
        403,
        false,
        'This order is assigned to another salesperson.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_NOT_IN_PROCESSING_STATE') {
      return sendResponse(
        res,
        400,
        false,
        'Order must be in processing state to mark as ready for delivery.',
        null,
        'INVALID_ORDER_STATE'
      );
    }
    if (error.message === 'ORDER_CANCELLATION_REQUEST_PENDING') {
      return sendResponse(
        res,
        400,
        false,
        'Order has a pending cancellation request and cannot be marked ready for delivery.',
        null,
        'ORDER_CANCELLATION_REQUEST_PENDING'
      );
    }

    console.error('Error marking order as ready for delivery:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while marking order as ready for delivery.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const approveCancellationRequest = async (req, res) => {
  try {
    const salespersonId = req.userId;
    const branchId = req.branchId;
    const { orderId } = req.params;
    const { approval_reason } = req.body;

    const result =
      await salespersonOrderProcessingService.approveCancellationRequest(
        orderId,
        salespersonId,
        branchId,
        approval_reason || ''
      );

    await logOrderProcessingActivity(
      req,
      'approve_cancellation_request',
      `Approved cancellation request for order ${orderId}`,
      orderId,
      {
        branch_id: branchId,
        approval_reason: approval_reason || '',
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Cancellation request approved successfully.',
      result
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
    if (error.message === 'ORDER_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This order is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_CANCELLATION_NOT_REQUESTED') {
      return sendResponse(
        res,
        400,
        false,
        'This order does not have a pending cancellation request.',
        null,
        'ORDER_CANCELLATION_NOT_REQUESTED'
      );
    }
    if (error.message === 'ORDER_ALREADY_COMPLETED') {
      return sendResponse(
        res,
        400,
        false,
        'Completed orders cannot be cancelled.',
        null,
        'ORDER_ALREADY_COMPLETED'
      );
    }
    if (error.message === 'ORDER_ALREADY_CANCELLED') {
      return sendResponse(
        res,
        400,
        false,
        'This order is already cancelled.',
        null,
        'ORDER_ALREADY_CANCELLED'
      );
    }
    if (error.message === 'BRANCH_SALESPERSON_NOT_FOUND') {
      return sendResponse(
        res,
        500,
        false,
        'Unable to restore stock because no salesperson stock record was found for this branch.',
        null,
        'BRANCH_SALESPERSON_NOT_FOUND'
      );
    }
    if (error.message === 'PAYMENT_TRANSACTION_NOT_FOUND') {
      return sendResponse(
        res,
        400,
        false,
        'No successful payment transaction was found for this order.',
        null,
        'PAYMENT_TRANSACTION_NOT_FOUND'
      );
    }
    if (error.message === 'STRIPE_NOT_CONFIGURED') {
      return sendResponse(
        res,
        500,
        false,
        'Stripe is not configured for gateway-level refunds.',
        null,
        'STRIPE_NOT_CONFIGURED'
      );
    }
    if (error.message === 'STRIPE_PAYMENT_INTENT_MISSING') {
      return sendResponse(
        res,
        400,
        false,
        'Stripe payment intent is missing on the original payment transaction.',
        null,
        'STRIPE_PAYMENT_INTENT_MISSING'
      );
    }
    if (error.message === 'STRIPE_REFUND_FAILED') {
      return sendResponse(
        res,
        502,
        false,
        'Stripe refund failed. Please retry or check Stripe dashboard for details.',
        null,
        'STRIPE_REFUND_FAILED'
      );
    }
    if (
      [
        'JAZZCASH_REFUND_NOT_CONFIGURED',
        'EASYPAISA_REFUND_NOT_CONFIGURED',
      ].includes(error.message)
    ) {
      return sendResponse(
        res,
        500,
        false,
        'Wallet gateway refund is not configured. Please set refund endpoint credentials in environment.',
        null,
        error.message
      );
    }
    if (
      ['JAZZCASH_REFUND_FAILED', 'EASYPAISA_REFUND_FAILED'].includes(
        error.message
      )
    ) {
      return sendResponse(
        res,
        502,
        false,
        'Wallet gateway refund request failed. Check gateway response and retry.',
        null,
        error.message
      );
    }
    if (
      [
        'JAZZCASH_ORIGINAL_TXN_MISSING',
        'EASYPAISA_ORIGINAL_TXN_MISSING',
      ].includes(error.message)
    ) {
      return sendResponse(
        res,
        400,
        false,
        'Original wallet gateway transaction reference is missing for this order.',
        null,
        error.message
      );
    }
    if (error.message === 'UNSUPPORTED_PAYMENT_METHOD_FOR_REFUND') {
      return sendResponse(
        res,
        400,
        false,
        'This payment method is not supported for gateway-level refunds.',
        null,
        'UNSUPPORTED_PAYMENT_METHOD_FOR_REFUND'
      );
    }

    console.error('Error approving cancellation request:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while approving cancellation request.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const rejectCancellationRequest = async (req, res) => {
  try {
    const salespersonId = req.userId;
    const branchId = req.branchId;
    const { orderId } = req.params;
    const { rejection_reason } = req.body;

    const result =
      await salespersonOrderProcessingService.rejectCancellationRequest(
        orderId,
        salespersonId,
        branchId,
        rejection_reason || ''
      );

    await logOrderProcessingActivity(
      req,
      'reject_cancellation_request',
      `Rejected cancellation request for order ${orderId}`,
      orderId,
      {
        branch_id: branchId,
        rejection_reason: rejection_reason || '',
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Cancellation request rejected successfully.',
      result
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
    if (error.message === 'ORDER_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This order is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ORDER_CANCELLATION_NOT_REQUESTED') {
      return sendResponse(
        res,
        400,
        false,
        'This order does not have a pending cancellation request.',
        null,
        'ORDER_CANCELLATION_NOT_REQUESTED'
      );
    }

    console.error('Error rejecting cancellation request:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while rejecting cancellation request.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const viewPrescription = async (req, res) => {
  try {
    const { orderItemId } = req.params;

    const prescription =
      await salespersonOrderProcessingService.getPrescriptionForOrderItem(
        orderItemId
      );

    await logOrderProcessingActivity(
      req,
      'view_prescription',
      `Viewed prescription for order item ${orderItemId}`,
      orderItemId,
      {
        order_reference: prescription?.order_reference || null,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Prescription retrieved successfully.',
      prescription
    );
  } catch (error) {
    if (error.message === 'ORDER_ITEM_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Order item not found.',
        null,
        'ORDER_ITEM_NOT_FOUND'
      );
    }
    if (error.message === 'NO_PRESCRIPTION_FILE') {
      return sendResponse(
        res,
        404,
        false,
        'No prescription file for this item.',
        null,
        'NO_PRESCRIPTION_FILE'
      );
    }

    console.error('Error retrieving prescription:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while retrieving prescription.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const allowPrescriptionForCart = async (req, res) => {
  try {
    const salespersonId = req.userId;
    const branchId = req.branchId;
    const { prescriptionId } = req.params;
    const allowPayload =
      req.body?.allow_payload || req.body?.allowPayload || req.body || {};

    const result =
      await salespersonOrderProcessingService.allowPrescriptionForCart(
        prescriptionId,
        salespersonId,
        allowPayload,
        branchId
      );

    await logOrderProcessingActivity(
      req,
      'allow_prescription_for_cart',
      `Approved uploaded prescription ${prescriptionId} for cart access`,
      prescriptionId,
      {
        branch_id: branchId,
        salesperson_id: salespersonId,
        allow_payload: result?.prescription?.allow_payload || null,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      'Prescription allow payload saved successfully.',
      result
    );
  } catch (error) {
    if (error.message === 'PRESCRIPTION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Prescription not found.',
        null,
        'PRESCRIPTION_NOT_FOUND'
      );
    }
    if (error.message === 'PRESCRIPTION_NOT_FROM_YOUR_BRANCH') {
      return sendResponse(
        res,
        403,
        false,
        'This prescription is not from your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'PRESCRIPTION_NOT_ASSIGNED_TO_YOU') {
      return sendResponse(
        res,
        403,
        false,
        'This prescription is assigned to another salesperson.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'ALLOW_PAYLOAD_REQUIRED') {
      return sendResponse(
        res,
        400,
        false,
        'An allow payload with at least one medicine is required.',
        null,
        'ALLOW_PAYLOAD_REQUIRED'
      );
    }

    console.error('Error approving prescription for cart access:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while saving prescription allow payload.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};
