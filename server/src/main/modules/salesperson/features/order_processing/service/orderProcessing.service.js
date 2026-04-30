import mongoose from 'mongoose';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Medicine from '../../../../../models/Medicine.js';
import Branch from '../../../../../models/Branch.js';
import PrescriptionUploadedByCustomer from '../../../../../models/PrescriptionUploadedByCustomer.js';
import { sendEmail } from '../../../../../utils/sendEmail.js';
import notificationService from '../../../../../utils/notificationService.js';
import { emitToSalesperson } from '../../../../../config/socket.config.js';
import customerOrderManagementService from '../../../../customer/features/order_management/service/orderManagement.service.js';

class SalespersonOrderProcessingService {
  /**
   * Determine if an order requires processing
   * Orders requiring processing:
   * 1. Has items that require prescription (prescription_required = true)
   * 2. Has items from multiple branches
   */
  async shouldOrderBeProcessed(orderId) {
    const order = await Order.findById(orderId)
      .populate({
        path: 'order_items',
        populate: {
          path: 'medicine_id',
          select: 'prescription_required Name',
        },
      })
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Check if any item requires prescription
    const hasPrescriptionRequiredItems = order.order_items.some(
      item => item.medicine_id?.prescription_required === true
    );

    // Check if items are from multiple branches
    const branches = new Set(
      order.order_items.map(item => item.branch_id?.toString())
    );
    const isMultiBranch = branches.size > 1;

    return hasPrescriptionRequiredItems || isMultiBranch;
  }

  /**
   * Get orders for a salesperson to process
   * Filtered by orders that need processing and assigned to their branch
   */
  async getPendingOrdersForSalesperson(branchId, salespersonId, filters = {}) {
    const query = {
      branch_id: branchId,
      status: 'pending',
      salesperson_id: salespersonId,
      cancellation_request_status: { $ne: 'requested' },
    };

    // Apply additional filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.customerId) {
      query.customer_id = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.created_at = {};
      if (filters.dateFrom) {
        query.created_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.created_at.$lte = new Date(filters.dateTo);
      }
    }

    // Fetch orders
    let orders = await Order.find(query)
      .populate('customer_id', 'fullName phone email address')
      .populate('order_items')
      .populate('branch_id', 'branch_name branch_code')
      .sort({ created_at: -1 })
      .lean();

    // Populate medicine details for each order item
    orders = await Promise.all(
      orders.map(async order => {
        order.order_items = await Promise.all(
          order.order_items.map(async item => {
            const medicine = await Medicine.findById(item.medicine_id).select(
              'Name prescription_required category'
            );
            return {
              ...item,
              medicine_details: medicine,
            };
          })
        );
        return order;
      })
    );

    // Filter orders that need processing (has prescription items OR multi-branch items)
    const ordersNeedingProcessing = await Promise.all(
      orders.map(async order => {
        const shouldProcess = await this.shouldOrderBeProcessed(order._id);
        return shouldProcess ? order : null;
      })
    );

    return ordersNeedingProcessing.filter(order => order !== null);
  }

  /**
   * Get all pending orders for a salesperson's branch
   * Includes all pending orders, even if they do not require processing
   */
  async getAllPendingOrdersForSalesperson(
    branchId,
    salespersonId,
    filters = {}
  ) {
    const query = {
      branch_id: branchId,
      status: 'pending',
      salesperson_id: salespersonId,
      cancellation_request_status: { $ne: 'requested' },
    };

    if (filters.customerId) {
      query.customer_id = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.created_at = {};
      if (filters.dateFrom) {
        query.created_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.created_at.$lte = new Date(filters.dateTo);
      }
    }

    const orders = await Order.find(query)
      .populate('customer_id', 'fullName phone email address')
      .populate('order_items')
      .populate('branch_id', 'branch_name branch_code')
      .sort({ created_at: -1 })
      .lean();

    return Promise.all(
      orders.map(async order => {
        order.order_items = await Promise.all(
          order.order_items.map(async item => {
            const medicine = await Medicine.findById(item.medicine_id).select(
              'Name prescription_required category'
            );
            return {
              ...item,
              medicine_details: medicine,
            };
          })
        );
        return order;
      })
    );
  }

  /**
   * Get order details for processing
   */
  async getOrderDetailsForProcessing(orderId, branchId, salespersonId = null) {
    const order = await Order.findById(orderId)
      .populate('customer_id', 'fullName phone email address')
      .populate({
        path: 'order_items',
        populate: [
          {
            path: 'medicine_id',
            select: 'Name prescription_required category mgs dosage_form',
          },
          {
            path: 'branch_id',
            select: 'branch_name branch_code city',
          },
        ],
      })
      .populate('branch_id', 'branch_name branch_code city')
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Verify order belongs to branch (if caller is branch admin)
    if (branchId && order.branch_id._id.toString() !== branchId) {
      throw new Error('ORDER_NOT_FROM_YOUR_BRANCH');
    }

    if (
      salespersonId &&
      order.salesperson_id &&
      order.salesperson_id.toString() !== salespersonId
    ) {
      throw new Error('ORDER_NOT_ASSIGNED_TO_YOU');
    }

    // Identify items with prescription requirements
    const itemsNeedingPrescription = order.order_items.filter(
      item => item.medicine_id?.prescription_required === true
    );

    // Identify multi-branch items
    const branches = new Set(
      order.order_items.map(item => item.branch_id._id.toString())
    );
    const isMultiBranch = branches.size > 1;

    return {
      ...order,
      processing_info: {
        items_needing_prescription: itemsNeedingPrescription,
        is_multi_branch: isMultiBranch,
        branch_count: branches.size,
        reason_for_processing: this._getProcessingReason(
          itemsNeedingPrescription,
          isMultiBranch
        ),
      },
    };
  }

  /**
   * Mark order as packed
   */
  async markOrderAsPacked(
    orderId,
    salespersonId,
    packingNotes = '',
    branchId = null
  ) {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      if (order.cancellation_request_status === 'requested') {
        throw new Error('ORDER_CANCELLATION_REQUEST_PENDING');
      }

      if (branchId && order.branch_id.toString() !== branchId) {
        throw new Error('ORDER_NOT_FROM_YOUR_BRANCH');
      }

      if (
        order.salesperson_id &&
        order.salesperson_id.toString() !== salespersonId
      ) {
        throw new Error('ORDER_NOT_ASSIGNED_TO_YOU');
      }

      // Update order status
      order.status = 'processing';
      order.salesperson_id = salespersonId;
      order.packing_notes = packingNotes;
      order.packed_at = new Date();

      await order.save({ session });
      await session.commitTransaction();

      await this._notifyBranchSalespersonsOrderUpdate(order, {
        event: 'order:status_updated',
        status: 'processing',
        statusLabel: 'Packed',
        salespersonId,
      });

      // Notify customer asynchronously
      this._notifyCustomerOrderStatusUpdate(order, 'Packed');

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Mark order as ready for delivery
   */
  async markOrderAsReadyForDelivery(orderId, salespersonId, branchId = null) {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      if (order.cancellation_request_status === 'requested') {
        throw new Error('ORDER_CANCELLATION_REQUEST_PENDING');
      }

      if (branchId && order.branch_id.toString() !== branchId) {
        throw new Error('ORDER_NOT_FROM_YOUR_BRANCH');
      }

      if (
        order.salesperson_id &&
        order.salesperson_id.toString() !== salespersonId
      ) {
        throw new Error('ORDER_NOT_ASSIGNED_TO_YOU');
      }

      if (order.status !== 'processing') {
        throw new Error('ORDER_NOT_IN_PROCESSING_STATE');
      }

      order.status = 'on-the-way';
      order.ready_for_delivery_at = new Date();

      await order.save({ session });
      await session.commitTransaction();

      await this._notifyBranchSalespersonsOrderUpdate(order, {
        event: 'order:status_updated',
        status: 'on-the-way',
        statusLabel: 'Ready for Delivery',
        salespersonId,
      });

      // Notify customer asynchronously
      this._notifyCustomerOrderStatusUpdate(order, 'Ready for Delivery');

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get prescription for an order item
   */
  async getPrescriptionForOrderItem(orderItemId) {
    const orderItem = await OrderItem.findById(orderItemId)
      .populate('medicine_id', 'Name prescription_required')
      .populate('order_id', 'customer_id')
      .lean();

    if (!orderItem) {
      throw new Error('ORDER_ITEM_NOT_FOUND');
    }

    if (!orderItem.prescription_file_url) {
      throw new Error('NO_PRESCRIPTION_FILE');
    }

    return {
      order_item_id: orderItem._id,
      medicine_name: orderItem.medicine_id?.Name,
      prescription_url: orderItem.prescription_file_url,
      order_reference: String(orderItem.order_id?._id || ''),
    };
  }

  /**
   * Search and filter orders for salesperson
   */
  async searchOrdersForSalesperson(
    branchId,
    salespersonId,
    searchQuery,
    filters = {}
  ) {
    const query = {
      branch_id: branchId,
      salesperson_id: salespersonId,
      status: { $in: ['pending', 'processing'] },
      cancellation_request_status: { $ne: 'requested' },
    };

    // Search by order number or customer name/phone
    if (searchQuery) {
      query.$or = [
        {
          _id: mongoose.Types.ObjectId.isValid(searchQuery)
            ? new mongoose.Types.ObjectId(searchQuery)
            : undefined,
        },
        { 'customer_id.fullName': { $regex: searchQuery, $options: 'i' } },
        { 'customer_id.phone': { $regex: searchQuery, $options: 'i' } },
      ].filter(clause => Object.values(clause)[0] !== undefined);
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.sortBy === 'newest') {
      // Default: newest first
    } else if (filters.sortBy === 'oldest') {
      // Oldest first
    }

    const orders = await Order.find(query)
      .populate('customer_id', 'fullName phone email')
      .populate('order_items')
      .populate('branch_id', 'branch_name')
      .sort({ created_at: -1 })
      .lean();

    // Filter to only orders needing processing
    const filteredOrders = await Promise.all(
      orders.map(async order => {
        const shouldProcess = await this.shouldOrderBeProcessed(order._id);
        return shouldProcess ? order : null;
      })
    );

    return filteredOrders.filter(order => order !== null);
  }

  async getCancellationRequestsForSalesperson(
    branchId,
    salespersonId,
    filters = {}
  ) {
    const query = {
      branch_id: branchId,
      salesperson_id: salespersonId,
      cancellation_request_status: 'requested',
    };

    if (filters.customerId) {
      query.customer_id = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.cancellation_requested_at = {};
      if (filters.dateFrom) {
        query.cancellation_requested_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.cancellation_requested_at.$lte = new Date(filters.dateTo);
      }
    }

    const orders = await Order.find(query)
      .populate('customer_id', 'fullName phone email address')
      .populate('order_items')
      .populate('branch_id', 'branch_name branch_code')
      .sort({ cancellation_requested_at: -1, created_at: -1 })
      .lean();

    return Promise.all(
      orders.map(async order => {
        order.order_items = await Promise.all(
          order.order_items.map(async item => {
            const medicine = await Medicine.findById(item.medicine_id).select(
              'Name prescription_required category'
            );
            return {
              ...item,
              medicine_details: medicine,
            };
          })
        );
        return order;
      })
    );
  }

  async approveCancellationRequest(
    orderId,
    salespersonId,
    branchId = null,
    approvalReason = ''
  ) {
    return customerOrderManagementService.approveCancellationRequest(
      orderId,
      salespersonId,
      branchId,
      approvalReason
    );
  }

  async rejectCancellationRequest(
    orderId,
    salespersonId,
    branchId = null,
    rejectionReason = ''
  ) {
    return customerOrderManagementService.rejectCancellationRequest(
      orderId,
      salespersonId,
      branchId,
      rejectionReason
    );
  }

  // ==================== HELPERS ====================

  _getProcessingReason(prescriptionItems, isMultiBranch) {
    const reasons = [];
    if (prescriptionItems.length > 0) {
      reasons.push(
        `${prescriptionItems.length} item(s) require prescription verification`
      );
    }
    if (isMultiBranch) {
      reasons.push('Order contains items from multiple branches');
    }
    return reasons.join(' AND ');
  }

  async _notifyCustomerOrderStatusUpdate(order, statusLabel) {
    try {
      const customer = await Order.findById(order._id)
        .populate('customer_id', 'email fullName phone')
        .lean();

      if (customer?.customer_id?.email) {
        const htmlContent = `
          <h2>Order Status Update</h2>
          <p>Dear ${customer.customer_id.fullName || customer.customer_id.name || 'Valued Customer'},</p>
          <p>Your order #${String(order._id)} is now <strong>${statusLabel.toLowerCase()}</strong>.</p>
          <p>Track your order in the Philbox app for more details.</p>
        `;
        await sendEmail(
          customer.customer_id.email,
          `Philbox - Order #${String(order._id)} Status Update`,
          htmlContent
        );
      }

      if (customer?.customer_id?.phone) {
        const sms = `Your order #${String(order._id)} is now ${statusLabel.toLowerCase()}. Track it in the Philbox app.`;
        await notificationService.sendSMS(customer.customer_id.phone, sms);
      }
    } catch (error) {
      console.error('Error sending order status notification:', error);
    }
  }

  _normalizeAllowPayload(payload = {}) {
    const rawItems = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.allowed_medicine_ids)
        ? payload.allowed_medicine_ids.map(item => ({
            medicine_id: item,
            quantity: 1,
          }))
        : [];

    const items = rawItems
      .map(item => {
        const medicineId = String(
          item?.medicine_id || item?.medicineId || item?.id || item || ''
        ).trim();

        if (!medicineId) {
          return null;
        }

        return {
          medicine_id: medicineId,
          quantity: Math.max(
            1,
            Number(item?.quantity || item?.quantity_allowed || 1) || 1
          ),
          medicine_name:
            String(item?.medicine_name || item?.name || '').trim() || null,
          notes: String(item?.notes || '').trim() || null,
        };
      })
      .filter(Boolean);

    return {
      can_add_to_cart: payload.can_add_to_cart !== false,
      notes: String(payload.notes || payload.review_notes || '').trim(),
      items,
    };
  }

  async allowPrescriptionForCart(
    prescriptionId,
    salespersonId,
    allowPayload = {},
    branchId = null
  ) {
    const prescription = await PrescriptionUploadedByCustomer.findById(
      prescriptionId
    )
      .populate('patient_id', 'fullName email phone')
      .populate('branch_id', 'name branch_name branch_code')
      .lean();

    if (!prescription) {
      throw new Error('PRESCRIPTION_NOT_FOUND');
    }

    if (branchId && prescription.branch_id && prescription.branch_id._id) {
      const prescriptionBranchId = prescription.branch_id._id.toString();
      if (prescriptionBranchId !== branchId) {
        throw new Error('PRESCRIPTION_NOT_FROM_YOUR_BRANCH');
      }
    }

    const assignedSalespersonId =
      prescription.salesperson_id?.toString?.() || null;
    if (assignedSalespersonId && assignedSalespersonId !== salespersonId) {
      throw new Error('PRESCRIPTION_NOT_ASSIGNED_TO_YOU');
    }

    const normalizedAllowPayload = this._normalizeAllowPayload(allowPayload);
    if (!normalizedAllowPayload.items.length) {
      throw new Error('ALLOW_PAYLOAD_REQUIRED');
    }

    const updatedPrescription =
      await PrescriptionUploadedByCustomer.findByIdAndUpdate(
        prescriptionId,
        {
          review_status: 'approved',
          reviewed_by_salesperson_id: salespersonId,
          reviewed_at: new Date(),
          review_notes: normalizedAllowPayload.notes || '',
          allow_payload: normalizedAllowPayload,
        },
        { new: true }
      )
        .populate('patient_id', 'fullName email phone')
        .populate('branch_id', 'name branch_name branch_code')
        .lean();

    return {
      prescription: {
        _id: updatedPrescription._id,
        source: 'uploaded',
        review_status: updatedPrescription.review_status,
        reviewed_at: updatedPrescription.reviewed_at,
        reviewed_by_salesperson_id:
          updatedPrescription.reviewed_by_salesperson_id || null,
        branch_id: updatedPrescription.branch_id || null,
        salesperson_id: updatedPrescription.salesperson_id || null,
        allow_payload: updatedPrescription.allow_payload || null,
        customer: updatedPrescription.patient_id
          ? {
              _id: updatedPrescription.patient_id._id,
              fullName: updatedPrescription.patient_id.fullName,
              email: updatedPrescription.patient_id.email,
              phone: updatedPrescription.patient_id.phone,
            }
          : null,
        branch: updatedPrescription.branch_id || null,
      },
    };
  }

  async _notifyBranchSalespersonsOrderUpdate(order, payload) {
    try {
      const branch = await Branch.findById(order.branch_id)
        .select('salespersons_assigned')
        .lean();

      const salespersonIds = order.salesperson_id
        ? [order.salesperson_id.toString()]
        : branch?.salespersons_assigned?.map(id => id.toString()) || [];

      const eventData = {
        order_id: order._id,
        order_reference: String(order._id),
        branch_id: order.branch_id?.toString?.() || String(order.branch_id),
        status: payload.status,
        status_label: payload.statusLabel,
        updated_by_salesperson_id: payload.salespersonId,
        updated_at: new Date(),
      };

      for (const salespersonId of salespersonIds) {
        emitToSalesperson(salespersonId, payload.event, eventData);
      }
    } catch (error) {
      console.error('Error notifying branch salespersons:', error);
    }
  }
}

export default new SalespersonOrderProcessingService();
