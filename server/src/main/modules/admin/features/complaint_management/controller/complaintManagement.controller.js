import sendResponse from '../../../../../utils/sendResponse.js';
import complaintManagementService from '../service/complaintManagement.service.js';

const getAdmin = req => req.admin || req.user || null;

export const listComplaints = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const result = await complaintManagementService.listComplaints(
      admin,
      req.query
    );
    return sendResponse(res, 200, 'Complaints fetched successfully', result);
  } catch (error) {
    console.error('Error in listComplaints:', error);
    return sendResponse(
      res,
      500,
      'Failed to fetch complaints',
      null,
      error.message
    );
  }
};

export const getComplaintDetails = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const complaint = await complaintManagementService.getComplaintById(
      admin,
      req.params.complaintId
    );

    return sendResponse(
      res,
      200,
      'Complaint details fetched successfully',
      complaint
    );
  } catch (error) {
    console.error('Error in getComplaintDetails:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to fetch complaint details',
      null,
      error.message
    );
  }
};

export const addAdminMessage = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const message = String(req.body?.message || '').trim();
    if (!message) return sendResponse(res, 400, 'Message is required');

    const complaint = await complaintManagementService.addAdminMessage(
      admin,
      req.params.complaintId,
      { message },
      req.files || [],
      req
    );

    return sendResponse(res, 200, 'Reply sent successfully', complaint);
  } catch (error) {
    console.error('Error in addAdminMessage:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }
    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 400, 'Failed to upload message attachments');
    }

    return sendResponse(res, 500, 'Failed to send reply', null, error.message);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const status = String(req.body?.status || '').trim();
    if (!status) return sendResponse(res, 400, 'Status is required');

    const complaint = await complaintManagementService.updateComplaintStatus(
      admin,
      req.params.complaintId,
      {
        status,
        resolution_note: req.body?.resolution_note,
      },
      req
    );

    return sendResponse(
      res,
      200,
      'Complaint status updated successfully',
      complaint
    );
  } catch (error) {
    console.error('Error in updateComplaintStatus:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }
    if (error.message === 'INVALID_STATUS') {
      return sendResponse(
        res,
        400,
        'Invalid status. Use pending, in-progress, in_progress, resolved, or closed'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to update complaint status',
      null,
      error.message
    );
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const assigneeAdminId = String(req.body?.assignee_admin_id || '').trim();
    if (!assigneeAdminId) {
      return sendResponse(res, 400, 'assignee_admin_id is required');
    }

    const complaint = await complaintManagementService.assignComplaint(
      admin,
      req.params.complaintId,
      { assignee_admin_id: assigneeAdminId },
      req
    );

    return sendResponse(res, 200, 'Complaint assigned successfully', complaint);
  } catch (error) {
    console.error('Error in assignComplaint:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }
    if (error.message === 'ASSIGNEE_NOT_FOUND') {
      return sendResponse(res, 404, 'Assignee admin not found');
    }
    if (error.message === 'ASSIGNEE_OUTSIDE_BRANCH_SCOPE') {
      return sendResponse(
        res,
        403,
        'Assignee is outside your branch management scope'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to assign complaint',
      null,
      error.message
    );
  }
};

export const exportComplaintsReport = async (req, res) => {
  try {
    const admin = getAdmin(req);
    if (!admin) return sendResponse(res, 401, 'Unauthorized');

    const data = await complaintManagementService.exportComplaintsReport(
      admin,
      req.query,
      req
    );

    return sendResponse(
      res,
      200,
      'Complaints report exported successfully',
      data
    );
  } catch (error) {
    console.error('Error in exportComplaintsReport:', error);
    return sendResponse(
      res,
      500,
      'Failed to export complaints report',
      null,
      error.message
    );
  }
};
