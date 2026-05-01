import refundAllocationService from '../service/refundAllocation.service.js';
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

export const getBranchAllocations = async (req, res) => {
  try {
    const branchId = req.branchId;
    const {
      status,
      sortBy = 'allocated_at',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (status) {
      filters.status = status;
    }

    let allocations = await refundAllocationService.getBranchAllocations(
      branchId,
      filters
    );

    const sortOrder = order === 'desc' ? -1 : 1;
    allocations.sort((a, b) => {
      if (sortBy === 'allocated_at') {
        return (
          (new Date(a.allocated_at) - new Date(b.allocated_at)) * sortOrder
        );
      }
      if (sortBy === 'amount') {
        return (
          (a.total_allocation_amount - b.total_allocation_amount) * sortOrder
        );
      }
      return 0;
    });

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedAllocations = allocations.slice(
      startIdx,
      startIdx + limitNum
    );

    return sendResponse(
      res,
      200,
      true,
      'Branch allocations retrieved successfully.',
      {
        allocations: paginatedAllocations,
        total_count: allocations.length,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(allocations.length / limitNum),
      }
    );
  } catch (error) {
    console.error('Error fetching branch allocations:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching allocations.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const getAllocationDetails = async (req, res) => {
  try {
    const branchId = req.branchId;
    const { allocationId } = req.params;

    const allocation = await refundAllocationService.getAllocationDetails(
      allocationId,
      branchId
    );

    return sendResponse(
      res,
      200,
      true,
      'Allocation details retrieved successfully.',
      allocation
    );
  } catch (error) {
    if (error.message === 'INVALID_ALLOCATION_ID') {
      return sendResponse(
        res,
        400,
        false,
        'Invalid allocation ID.',
        null,
        'INVALID_ALLOCATION_ID'
      );
    }
    if (error.message === 'ALLOCATION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Allocation not found.',
        null,
        'ALLOCATION_NOT_FOUND'
      );
    }
    if (error.message === 'ACCESS_DENIED') {
      return sendResponse(
        res,
        403,
        false,
        'This allocation does not belong to your branch.',
        null,
        'ACCESS_DENIED'
      );
    }

    console.error('Error fetching allocation details:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while fetching allocation details.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const completeAllocation = async (req, res) => {
  try {
    const branchId = req.branchId;
    const branchAdminId = req.admin?.id;
    const { allocationId } = req.params;
    const { notes } = req.body;

    const completedAllocation =
      await refundAllocationService.completeAllocation(
        allocationId,
        branchId,
        branchAdminId,
        notes
      );

    return sendResponse(res, 200, true, 'Allocation completed successfully.', {
      allocation_id: completedAllocation._id,
      status: completedAllocation.status,
      total_refund_amount: completedAllocation.total_allocation_amount,
      items_refunded: completedAllocation.allocated_items.length,
      completed_at: completedAllocation.completed_at,
    });
  } catch (error) {
    if (error.message === 'INVALID_ALLOCATION_ID') {
      return sendResponse(
        res,
        400,
        false,
        'Invalid allocation ID.',
        null,
        'INVALID_ALLOCATION_ID'
      );
    }
    if (error.message === 'ALLOCATION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Allocation not found.',
        null,
        'ALLOCATION_NOT_FOUND'
      );
    }
    if (error.message === 'ACCESS_DENIED') {
      return sendResponse(
        res,
        403,
        false,
        'This allocation does not belong to your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'INVALID_ALLOCATION_STATUS') {
      return sendResponse(
        res,
        400,
        false,
        'Allocation cannot be completed in its current status.',
        null,
        'INVALID_ALLOCATION_STATUS'
      );
    }

    console.error('Error completing allocation:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while completing the allocation.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};

export const updateAllocationStatus = async (req, res) => {
  try {
    const branchId = req.branchId;
    const branchAdminId = req.admin?.id;
    const { allocationId } = req.params;
    const { status, notes } = req.body;

    const updatedAllocation =
      await refundAllocationService.updateAllocationStatus(
        allocationId,
        branchId,
        branchAdminId,
        status,
        notes
      );

    return sendResponse(
      res,
      200,
      true,
      'Allocation status updated successfully.',
      {
        allocation_id: updatedAllocation._id,
        status: updatedAllocation.status,
        accepted_at: updatedAllocation.accepted_at,
        completed_at: updatedAllocation.completed_at,
        branch_admin_notes: updatedAllocation.branch_admin_notes,
      }
    );
  } catch (error) {
    if (error.message === 'INVALID_ALLOCATION_ID') {
      return sendResponse(
        res,
        400,
        false,
        'Invalid allocation ID.',
        null,
        'INVALID_ALLOCATION_ID'
      );
    }
    if (error.message === 'INVALID_STATUS') {
      return sendResponse(
        res,
        400,
        false,
        'Invalid status. Allowed: accepted, processing, completed.',
        null,
        'INVALID_STATUS'
      );
    }
    if (error.message === 'ALLOCATION_NOT_FOUND') {
      return sendResponse(
        res,
        404,
        false,
        'Allocation not found.',
        null,
        'ALLOCATION_NOT_FOUND'
      );
    }
    if (error.message === 'ACCESS_DENIED') {
      return sendResponse(
        res,
        403,
        false,
        'This allocation does not belong to your branch.',
        null,
        'ACCESS_DENIED'
      );
    }
    if (error.message === 'INVALID_ALLOCATION_STATUS') {
      return sendResponse(
        res,
        400,
        false,
        'Allocation cannot be completed in its current status.',
        null,
        'INVALID_ALLOCATION_STATUS'
      );
    }

    console.error('Error updating allocation status:', error);
    return sendResponse(
      res,
      500,
      false,
      'An error occurred while updating allocation status.',
      null,
      'INTERNAL_SERVER_ERROR'
    );
  }
};
