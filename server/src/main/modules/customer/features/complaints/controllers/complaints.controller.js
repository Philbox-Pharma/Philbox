import sendResponse from '../../../../../utils/sendResponse.js';
import complaintsService from '../service/complaints.service.js';
import {
  createComplaintSchema,
  listComplaintsSchema,
  complaintIdParamSchema,
  addComplaintMessageSchema,
  rateComplaintResolutionSchema,
} from '../../../../../dto/customer/complaints.dto.js';

const getCustomerId = req =>
  req.customer?.id ||
  req.customer?._id ||
  req.user?.id ||
  req.session?.customerId;

export const createComplaint = async (req, res) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) return sendResponse(res, 401, 'Unauthorized');

    const { error, value } = createComplaintSchema.validate(req.body);
    if (error) return sendResponse(res, 400, error.details[0].message);

    const complaint = await complaintsService.createComplaint(
      customerId,
      value,
      req.files || [],
      req
    );

    return sendResponse(
      res,
      201,
      'Complaint registered successfully',
      complaint
    );
  } catch (error) {
    console.error('Error in createComplaint:', error);

    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return sendResponse(res, 404, 'Customer not found');
    }
    if (error.message === 'CUSTOMER_ADDRESS_REQUIRED') {
      return sendResponse(
        res,
        400,
        'Customer address is required to register a complaint'
      );
    }
    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 400, 'Failed to upload supporting documents');
    }

    return sendResponse(
      res,
      500,
      'Failed to register complaint',
      null,
      error.message
    );
  }
};

export const listMyComplaints = async (req, res) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) return sendResponse(res, 401, 'Unauthorized');

    const { error, value } = listComplaintsSchema.validate(req.query);
    if (error) return sendResponse(res, 400, error.details[0].message);

    const result = await complaintsService.listMyComplaints(customerId, value);
    return sendResponse(res, 200, 'Complaints fetched successfully', result);
  } catch (error) {
    console.error('Error in listMyComplaints:', error);
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
    const customerId = getCustomerId(req);
    if (!customerId) return sendResponse(res, 401, 'Unauthorized');

    const { error, value } = complaintIdParamSchema.validate(req.params);
    if (error) return sendResponse(res, 400, error.details[0].message);

    const complaint = await complaintsService.getComplaintById(
      customerId,
      value.complaintId
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

export const addComplaintMessage = async (req, res) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) return sendResponse(res, 401, 'Unauthorized');

    const paramValidation = complaintIdParamSchema.validate(req.params);
    if (paramValidation.error) {
      return sendResponse(res, 400, paramValidation.error.details[0].message);
    }

    const bodyValidation = addComplaintMessageSchema.validate(req.body);
    if (bodyValidation.error) {
      return sendResponse(res, 400, bodyValidation.error.details[0].message);
    }

    const complaint = await complaintsService.addComplaintMessage(
      customerId,
      paramValidation.value.complaintId,
      bodyValidation.value,
      req.files || [],
      req
    );

    return sendResponse(res, 200, 'Message sent successfully', complaint);
  } catch (error) {
    console.error('Error in addComplaintMessage:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }
    if (error.message === 'FILE_UPLOAD_FAILED') {
      return sendResponse(res, 400, 'Failed to upload message attachments');
    }

    return sendResponse(
      res,
      500,
      'Failed to send message',
      null,
      error.message
    );
  }
};

export const rateComplaintResolution = async (req, res) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) return sendResponse(res, 401, 'Unauthorized');

    const paramValidation = complaintIdParamSchema.validate(req.params);
    if (paramValidation.error) {
      return sendResponse(res, 400, paramValidation.error.details[0].message);
    }

    const bodyValidation = rateComplaintResolutionSchema.validate(req.body);
    if (bodyValidation.error) {
      return sendResponse(res, 400, bodyValidation.error.details[0].message);
    }

    const complaint = await complaintsService.rateComplaintResolution(
      customerId,
      paramValidation.value.complaintId,
      bodyValidation.value,
      req
    );

    return sendResponse(
      res,
      200,
      'Complaint resolution rated successfully',
      complaint
    );
  } catch (error) {
    console.error('Error in rateComplaintResolution:', error);

    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return sendResponse(res, 404, 'Complaint not found');
    }
    if (error.message === 'COMPLAINT_NOT_RESOLVED') {
      return sendResponse(
        res,
        409,
        'Complaint must be resolved before rating resolution'
      );
    }
    if (error.message === 'COMPLAINT_ALREADY_RATED') {
      return sendResponse(res, 409, 'Complaint resolution is already rated');
    }

    return sendResponse(
      res,
      500,
      'Failed to rate complaint resolution',
      null,
      error.message
    );
  }
};
