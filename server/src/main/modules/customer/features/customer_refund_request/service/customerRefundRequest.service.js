import CustomerRefundRequest from '../../../../../models/CustomerRefundRequest.js';
import BranchRefundAllocation from '../../../../../models/BranchRefundAllocation.js';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Customer from '../../../../../models/Customer.js';
import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Transaction from '../../../../../models/Transaction.js';
import Currency from '../../../../../models/Currency.js';
import {
  sendRefundRequestSubmissionEmail,
  sendRefundCompletionNotificationToCustomer,
} from '../../../../../utils/sendEmail.js';
import notificationService from '../../../../../utils/notificationService.js';

class CustomerRefundRequestService {
  // ==================== CUSTOMER OPERATIONS ====================

  /**
   * Submit a refund request from a customer
   * @param {string} customerId - Customer ID
   * @param {string} orderId - Order ID
   * @param {string} reason - Reason for refund
   * @param {Array} requestedItems - Items to refund [{ order_item_id, quantity }]
   */
  async submitRefundRequest(customerId, orderId, reason, requestedItems) {
    const session = await CustomerRefundRequest.startSession();
    session.startTransaction();

    try {
      // Validate order exists and belongs to customer
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      if (order.customer_id.toString() !== customerId) {
        throw new Error('ORDER_NOT_BELONGS_TO_CUSTOMER');
      }

      // Validate order is in a refundable state
      if (order.status !== 'completed') {
        throw new Error('ORDER_NOT_REFUNDABLE');
      }

      // Fetch all order items and validate requested items
      const orderItems = await OrderItem.find({
        _id: { $in: requestedItems.map(item => item.order_item_id) },
        order_id: orderId,
      })
        .session(session)
        .lean();

      if (orderItems.length !== requestedItems.length) {
        throw new Error('SOME_ORDER_ITEMS_NOT_FOUND');
      }

      // Build requested items with full details including branch_id
      const enrichedRequestedItems = requestedItems.map(reqItem => {
        const orderItem = orderItems.find(
          oi => oi._id.toString() === reqItem.order_item_id.toString()
        );
        if (!orderItem) {
          throw new Error('ORDER_ITEM_NOT_FOUND');
        }
        return {
          order_item_id: orderItem._id,
          quantity: reqItem.quantity,
          unit_price:
            orderItem.price ||
            Number(orderItem.subtotal || 0) /
              Math.max(Number(orderItem.quantity || 1), 1),
          requested_refund_amount:
            (reqItem.quantity || orderItem.quantity) *
            (orderItem.price ||
              Number(orderItem.subtotal || 0) /
                Math.max(Number(orderItem.quantity || 1), 1)),
          branch_id: orderItem.branch_id || order.branch_id,
        };
      });

      // Calculate total refund amount
      const totalRefundAmount = enrichedRequestedItems.reduce(
        (sum, item) => sum + item.requested_refund_amount,
        0
      );

      // Check if refund already in progress for this order
      const existingRequest = await CustomerRefundRequest.findOne({
        order_id: orderId,
        status: {
          $in: [
            'submitted',
            'super_admin_review',
            'approved',
            'partially_approved',
          ],
        },
      }).session(session);

      if (existingRequest) {
        throw new Error('REFUND_REQUEST_ALREADY_PENDING');
      }

      // Create refund request
      const refundRequest = await CustomerRefundRequest.create(
        [
          {
            customer_id: customerId,
            order_id: orderId,
            reason,
            requested_items: enrichedRequestedItems,
            total_requested_refund_amount: totalRefundAmount,
            status: 'submitted',
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Send async notifications (non-blocking)
      this._notifyRefundRequestSubmitted(refundRequest[0], order);

      return refundRequest[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get refund requests for a customer
   */
  async getCustomerRefundRequests(customerId, filters = {}) {
    const query = { customer_id: customerId };

    if (filters.status) {
      query.status = filters.status;
    }

    const requests = await CustomerRefundRequest.find(query)
      .populate('order_id', 'status total created_at')
      .populate(
        'requested_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .sort({ created_at: -1 })
      .lean();

    const requestIds = requests.map(request => request._id);
    const allocations = await BranchRefundAllocation.find({
      refund_request_id: { $in: requestIds },
    })
      .select('refund_request_id branch_id status allocated_at completed_at')
      .populate('branch_id', 'name branch_name branch_code')
      .lean();

    const allocationsByRequestId = new Map();
    allocations.forEach(allocation => {
      const key = String(allocation.refund_request_id);
      if (!allocationsByRequestId.has(key)) {
        allocationsByRequestId.set(key, []);
      }
      allocationsByRequestId.get(key).push(allocation);
    });

    return requests.map(request => ({
      ...request,
      allocation_status: allocationsByRequestId.get(String(request._id)) || [],
    }));
  }

  async getCustomerRefundRequestDetails(customerId, requestId) {
    const refundRequest = await CustomerRefundRequest.findOne({
      _id: requestId,
      customer_id: customerId,
    })
      .populate('order_id', 'status total created_at')
      .populate(
        'requested_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .populate('requested_items.branch_id', 'branch_name branch_code city')
      .lean();

    if (!refundRequest) {
      throw new Error('REFUND_REQUEST_NOT_FOUND');
    }

    const allocations = await BranchRefundAllocation.find({
      refund_request_id: requestId,
    })
      .populate('branch_id', 'name branch_name branch_code city')
      .select(
        'branch_id status allocated_at accepted_at completed_at branch_admin_notes total_allocation_amount'
      )
      .lean();

    return {
      ...refundRequest,
      allocation_status: allocations,
    };
  }

  // ==================== SUPER ADMIN OPERATIONS ====================

  /**
   * Get all pending refund requests for super admin review
   */
  async getPendingRefundRequests(filters = {}) {
    const query = { status: { $in: ['submitted', 'super_admin_review'] } };

    if (filters.customerId) {
      query.customer_id = filters.customerId;
    }

    return await CustomerRefundRequest.find(query)
      .populate('customer_id', 'fullName name email phone')
      .populate('order_id', 'status total created_at')
      .populate(
        'requested_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .populate('requested_items.branch_id', 'branch_name branch_code city')
      .sort({ created_at: 1 })
      .lean();
  }

  /**
   * Super admin reviews and allocates refund items to branches
   * @param {string} requestId - Refund request ID
   * @param {Array} approvedItems - Items approved for refund [{ order_item_id, quantity, branch_id }]
   * @param {string} superAdminId - Super admin ID
   * @param {string} notes - Optional notes from super admin
   */
  async approveAndAllocateRefund(
    requestId,
    approvedItems,
    superAdminId,
    notes = ''
  ) {
    const session = await CustomerRefundRequest.startSession();
    session.startTransaction();

    try {
      const refundRequest =
        await CustomerRefundRequest.findById(requestId).session(session);
      if (!refundRequest) {
        throw new Error('REFUND_REQUEST_NOT_FOUND');
      }

      // Auto-allocate all requested items if approvedItems is not provided
      const normalizedApprovedItems =
        Array.isArray(approvedItems) && approvedItems.length
          ? approvedItems
          : refundRequest.requested_items.map(item => ({
              order_item_id: item.order_item_id,
              quantity: item.quantity,
              branch_id: item.branch_id,
            }));

      // Validate approved items exist in requested items
      const requestedItemIds = refundRequest.requested_items.map(item =>
        item.order_item_id.toString()
      );
      const approvedItemIds = normalizedApprovedItems.map(item =>
        item.order_item_id.toString()
      );

      if (!approvedItemIds.every(id => requestedItemIds.includes(id))) {
        throw new Error('INVALID_APPROVED_ITEMS');
      }

      // Group approved items by branch
      const itemsByBranch = {};
      normalizedApprovedItems.forEach(item => {
        const branchId = item.branch_id.toString();
        if (!itemsByBranch[branchId]) {
          itemsByBranch[branchId] = [];
        }
        itemsByBranch[branchId].push(item);
      });

      // Create branch allocations
      const allocations = [];
      for (const [branchId, branchItems] of Object.entries(itemsByBranch)) {
        const totalAllocationAmount = branchItems.reduce((sum, item) => {
          const requestedItem = refundRequest.requested_items.find(
            ri => ri.order_item_id.toString() === item.order_item_id.toString()
          );
          return (
            sum + (requestedItem ? requestedItem.requested_refund_amount : 0)
          );
        }, 0);

        const enrichedItems = branchItems.map(item => {
          const requestedItem = refundRequest.requested_items.find(
            ri => ri.order_item_id.toString() === item.order_item_id.toString()
          );
          return {
            order_item_id: item.order_item_id,
            quantity: requestedItem.quantity,
            unit_price: requestedItem.unit_price,
            refund_amount: requestedItem.requested_refund_amount,
          };
        });

        const allocation = await BranchRefundAllocation.create(
          [
            {
              refund_request_id: requestId,
              branch_id: branchId,
              order_id: refundRequest.order_id,
              customer_id: refundRequest.customer_id,
              allocated_items: enrichedItems,
              total_allocation_amount: totalAllocationAmount,
              status: 'allocated',
              allocated_by: superAdminId,
              allocated_at: new Date(),
            },
          ],
          { session }
        );

        allocations.push(allocation[0]);
      }

      // Update refund request status
      const isFullyApproved =
        normalizedApprovedItems.length === refundRequest.requested_items.length;
      refundRequest.status = isFullyApproved
        ? 'approved'
        : 'partially_approved';
      refundRequest.reviewed_by = superAdminId;
      refundRequest.reviewed_at = new Date();
      refundRequest.super_admin_notes = notes;

      await refundRequest.save({ session });

      await session.commitTransaction();

      // Send async notifications (non-blocking)
      this._notifyRefundAllocation(refundRequest, allocations);

      return {
        refund_request: refundRequest,
        allocations,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Super admin rejects a refund request
   */
  async rejectRefundRequest(requestId, superAdminId, rejectionReason) {
    const refundRequest = await CustomerRefundRequest.findById(requestId);
    if (!refundRequest) {
      throw new Error('REFUND_REQUEST_NOT_FOUND');
    }

    refundRequest.status = 'rejected';
    refundRequest.reviewed_by = superAdminId;
    refundRequest.reviewed_at = new Date();
    refundRequest.rejection_reason = rejectionReason;

    await refundRequest.save();

    // Send rejection notification to customer
    this._notifyRefundRequestRejected(refundRequest);

    return refundRequest;
  }

  /**
   * Process final refund to customer (after branch completion)
   * Called after all branch allocations are completed
   */
  async processFinalRefundToCustomer(requestId) {
    const session = await CustomerRefundRequest.startSession();
    session.startTransaction();

    try {
      const refundRequest =
        await CustomerRefundRequest.findById(requestId).session(session);
      if (!refundRequest) {
        throw new Error('REFUND_REQUEST_NOT_FOUND');
      }

      // Check all allocations are completed
      const pendingAllocations = await BranchRefundAllocation.findOne({
        refund_request_id: requestId,
        status: { $ne: 'completed' },
      }).session(session);

      if (pendingAllocations) {
        throw new Error('NOT_ALL_BRANCHES_COMPLETED');
      }

      // Calculate approved refund amount
      const allocations = await BranchRefundAllocation.find({
        refund_request_id: requestId,
        status: 'completed',
      }).session(session);

      const totalRefundAmount = allocations.reduce(
        (sum, alloc) => sum + alloc.total_allocation_amount,
        0
      );

      // Get order and payment info
      const order = await Order.findById(refundRequest.order_id).session(
        session
      );
      const medicineRefundTotals = new Map();
      for (const allocation of allocations) {
        for (const item of allocation.allocated_items) {
          const orderItem = await OrderItem.findById(item.order_item_id)
            .select('medicine_id quantity')
            .session(session);

          const medicineId = orderItem?.medicine_id?.toString?.() || null;
          if (!medicineId) continue;

          medicineRefundTotals.set(
            medicineId,
            (medicineRefundTotals.get(medicineId) || 0) +
              (Number(item.quantity) || 0)
          );
        }
      }
      const paymentTransaction = await Transaction.findOne({
        target_class: 'order',
        target_id: order._id,
        transaction_type: 'pay',
      })
        .sort({ createdAt: -1 })
        .session(session);

      const fallbackCurrency = await Currency.findOne({ code: 'PKR' })
        .select('_id')
        .session(session);

      // Create refund transaction
      const refundTransaction = await Transaction.create(
        [
          {
            target_class: 'order',
            target_id: order._id,
            total_bill: Number(
              order.total_after_applying_coupon || order.total
            ),
            transaction_type: 'refund',
            payment_method: paymentTransaction?.payment_method || 'Stripe-Card',
            refund_amount: totalRefundAmount,
            currency: paymentTransaction?.currency || fallbackCurrency?._id,
            payment_status: 'successful',
            refunded_item_ids: allocations.flatMap(allocation =>
              allocation.allocated_items.map(item => item.order_item_id)
            ),
            device_details: 'customer-refund-request',
            country: paymentTransaction?.country || 'PK',
            ipAddress: paymentTransaction?.ipAddress,
          },
        ],
        { session }
      );

      // Update refund request status
      refundRequest.status = 'completed';
      refundRequest.completed_at = new Date();
      await refundRequest.save({ session });

      // Update order refund status
      const effectiveOrderTotal = Number(
        order.total_after_applying_coupon || order.total || 0
      );
      order.refund_status =
        totalRefundAmount >= effectiveOrderTotal
          ? 'refunded'
          : 'partially_refunded';
      await order.save({ session });

      for (const [
        medicineId,
        refundedQuantity,
      ] of medicineRefundTotals.entries()) {
        await Medicine.updateOne(
          { _id: medicineId },
          { $inc: { refunds_count: refundedQuantity } },
          { session }
        );
      }

      await session.commitTransaction();

      // Send completion notification to customer
      this._notifyRefundCompletionToCustomer(
        refundRequest,
        order,
        totalRefundAmount,
        paymentTransaction
      );

      return {
        refund_request: refundRequest,
        refund_transaction: refundTransaction[0],
        total_refund_amount: totalRefundAmount,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ==================== BRANCH ADMIN OPERATIONS ====================

  /**
   * Get allocated refunds for a branch
   */
  async getBranchAllocations(branchId, filters = {}) {
    const query = { branch_id: branchId };

    if (filters.status) {
      query.status = filters.status;
    }

    return await BranchRefundAllocation.find(query)
      .populate('customer_id', 'fullName name email phone')
      .populate('order_id', 'status created_at')
      .populate(
        'allocated_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .populate('refund_request_id', 'reason')
      .sort({ allocated_at: -1 })
      .lean();
  }

  /**
   * Accept and mark allocation as completed by branch admin
   */
  async completeAllocation(allocationId, branchAdminId, notes = '') {
    const session = await BranchRefundAllocation.startSession();
    session.startTransaction();

    try {
      const allocation =
        await BranchRefundAllocation.findById(allocationId).session(session);
      if (!allocation) {
        throw new Error('ALLOCATION_NOT_FOUND');
      }

      if (
        allocation.status !== 'allocated' &&
        allocation.status !== 'accepted'
      ) {
        throw new Error('INVALID_ALLOCATION_STATUS');
      }

      // Restore stock for allocated items
      for (const item of allocation.allocated_items) {
        const orderItem = await OrderItem.findById(item.order_item_id)
          .select('medicine_id')
          .session(session);

        if (!orderItem?.medicine_id) {
          continue;
        }

        const stockRecord = await StockInHand.findOne({
          medicine_id: orderItem.medicine_id,
          branch_id: allocation.branch_id,
        }).session(session);

        if (stockRecord) {
          stockRecord.quantity += item.quantity;
          await stockRecord.save({ session });
        }
      }

      // Update allocation status
      allocation.status = 'completed';
      allocation.completed_by = branchAdminId;
      allocation.completed_at = new Date();
      allocation.branch_admin_notes = notes;

      await allocation.save({ session });

      await session.commitTransaction();

      return allocation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ==================== NOTIFICATION HELPERS ====================

  async _notifyRefundRequestSubmitted(refundRequest, order) {
    try {
      const customer = await Customer.findById(
        refundRequest.customer_id
      ).lean();

      // Send customer confirmation
      if (customer && customer.email) {
        await sendRefundRequestSubmissionEmail(
          customer.email,
          customer.fullName || customer.name || 'Valued Customer',
          String(order._id),
          refundRequest.total_requested_refund_amount
        );
      }

      // Send SMS to customer
      if (customer && customer.phone) {
        const sms = `Your refund request for order #${String(order._id)} has been submitted. Our admin team will review it shortly.`;
        await notificationService.sendSMS(customer.phone, sms);
      }

      // TODO: Send notification to super admin dashboard
    } catch (error) {
      console.error('Error sending refund submission notification:', error);
    }
  }

  async _notifyRefundAllocation(refundRequest, allocations) {
    try {
      // Notify branch admins for their allocations
      for (let i = 0; i < allocations.length; i++) {
        // TODO: Send notification to branch admin dashboard
        // const allocation = allocations[i];
        // await notifyBranchAdmin(allocation.branch_id, allocation);
      }
    } catch (error) {
      console.error('Error sending refund allocation notifications:', error);
    }
  }

  async _notifyRefundRequestRejected(refundRequest) {
    try {
      const customer = await Customer.findById(
        refundRequest.customer_id
      ).lean();
      if (customer && customer.email) {
        // TODO: Send rejection email to customer
      }
    } catch (error) {
      console.error('Error sending refund rejection notification:', error);
    }
  }

  async _notifyRefundCompletionToCustomer(
    refundRequest,
    order,
    refundAmount,
    paymentTransaction
  ) {
    try {
      const customer = await Customer.findById(
        refundRequest.customer_id
      ).lean();
      if (customer && customer.email) {
        await sendRefundCompletionNotificationToCustomer(
          customer.email,
          customer.fullName || customer.name || 'Valued Customer',
          String(order._id),
          refundAmount,
          paymentTransaction?.payment_method || 'original_payment_method'
        );
      }

      // Send SMS to customer
      if (customer && customer.phone) {
        const sms = `Your refund of PKR ${refundAmount} for order #${String(order._id)} has been processed. You will receive it within 5-7 business days.`;
        await notificationService.sendSMS(customer.phone, sms);
      }
    } catch (error) {
      console.error('Error sending refund completion notification:', error);
    }
  }
}

export default new CustomerRefundRequestService();
