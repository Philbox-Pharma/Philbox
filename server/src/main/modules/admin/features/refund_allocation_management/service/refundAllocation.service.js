import mongoose from 'mongoose';
import BranchRefundAllocation from '../../../../../models/BranchRefundAllocation.js';
import OrderItem from '../../../../../models/OrderItem.js';
import StockInHand from '../../../../../models/StockInHand.js';

class RefundAllocationService {
  async getBranchAllocations(branchId, filters = {}) {
    const query = { branch_id: branchId };

    if (filters.status) {
      query.status = filters.status;
    }

    return BranchRefundAllocation.find(query)
      .populate('customer_id', 'fullName name email phone')
      .populate('order_id', 'status created_at')
      .populate(
        'allocated_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .populate('refund_request_id', 'reason status')
      .sort({ allocated_at: -1 })
      .lean();
  }

  async getAllocationDetails(allocationId, branchId) {
    if (!mongoose.Types.ObjectId.isValid(allocationId)) {
      throw new Error('INVALID_ALLOCATION_ID');
    }

    const allocation = await BranchRefundAllocation.findById(allocationId)
      .populate('customer_id', 'fullName name email phone')
      .populate('order_id', 'status created_at')
      .populate(
        'allocated_items.order_item_id',
        'medicine_name quantity price subtotal'
      )
      .populate('refund_request_id', 'reason status')
      .lean();

    if (!allocation) {
      throw new Error('ALLOCATION_NOT_FOUND');
    }

    if (allocation.branch_id.toString() !== branchId) {
      throw new Error('ACCESS_DENIED');
    }

    return allocation;
  }

  async completeAllocation(allocationId, branchId, branchAdminId, notes = '') {
    if (!mongoose.Types.ObjectId.isValid(allocationId)) {
      throw new Error('INVALID_ALLOCATION_ID');
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const allocation =
        await BranchRefundAllocation.findById(allocationId).session(session);

      if (!allocation) {
        throw new Error('ALLOCATION_NOT_FOUND');
      }

      if (allocation.branch_id.toString() !== branchId) {
        throw new Error('ACCESS_DENIED');
      }

      if (!['allocated', 'accepted'].includes(allocation.status)) {
        throw new Error('INVALID_ALLOCATION_STATUS');
      }

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

  async updateAllocationStatus(
    allocationId,
    branchId,
    branchAdminId,
    status,
    notes = ''
  ) {
    if (!mongoose.Types.ObjectId.isValid(allocationId)) {
      throw new Error('INVALID_ALLOCATION_ID');
    }

    const allowedStatuses = ['accepted', 'processing', 'completed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('INVALID_STATUS');
    }

    if (status === 'completed') {
      return this.completeAllocation(
        allocationId,
        branchId,
        branchAdminId,
        notes
      );
    }

    const allocation = await BranchRefundAllocation.findById(allocationId);
    if (!allocation) {
      throw new Error('ALLOCATION_NOT_FOUND');
    }

    if (allocation.branch_id.toString() !== branchId) {
      throw new Error('ACCESS_DENIED');
    }

    allocation.status = status;
    allocation.branch_admin_notes = notes || allocation.branch_admin_notes;

    if (status === 'accepted') {
      allocation.accepted_by = branchAdminId;
      allocation.accepted_at = new Date();
    }

    await allocation.save();
    return allocation;
  }
}

export default new RefundAllocationService();
