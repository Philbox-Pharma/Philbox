import salespersonService from '../services/salesperson.service.js';
import sendResponse from '../../../../../../utils/sendResponse.js';

// ✅ Create Salesperson
export const createSalesperson = async (req, res) => {
  try {
    const result = await salespersonService.createSalesperson(req.body, req);
    return sendResponse(res, 201, 'Salesperson created successfully', result);
  } catch (err) {
    if (err.message === 'EMAIL_ALREADY_EXISTS')
      return sendResponse(res, 409, 'Email already exists');
    if (err.message === 'INVALID_BRANCH_IDS')
      return sendResponse(
        res,
        400,
        'One or more provided Branch IDs are invalid or do not exist'
      );
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ✅ Get All
export const getAllSalespersons = async (req, res) => {
  try {
    const result = await salespersonService.getAllSalespersons(req.query);
    return sendResponse(res, 200, 'Salespersons fetched successfully', result);
  } catch (err) {
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ✅ Get One
export const getSalespersonById = async (req, res) => {
  try {
    const result = await salespersonService.getSalespersonById(req.params.id);
    return sendResponse(res, 200, 'Salesperson details fetched', result);
  } catch (err) {
    if (err.message === 'SALESPERSON_NOT_FOUND')
      return sendResponse(res, 404, 'Salesperson not found');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ✅ Update
export const updateSalesperson = async (req, res) => {
  try {
    const result = await salespersonService.updateSalesperson(
      req.params.id,
      req.body,
      req
    );
    return sendResponse(res, 200, 'Salesperson updated successfully', result);
  } catch (err) {
    if (err.message === 'SALESPERSON_NOT_FOUND')
      return sendResponse(res, 404, 'Salesperson not found');
    if (err.message === 'INVALID_BRANCH_IDS')
      return sendResponse(res, 400, 'Invalid Branch IDs provided');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ✅ Change Status
export const changeStatus = async (req, res) => {
  try {
    const result = await salespersonService.changeStatus(
      req.params.id,
      req.body.status,
      req
    );
    return sendResponse(res, 200, 'Salesperson status updated', result);
  } catch (err) {
    if (err.message === 'SALESPERSON_NOT_FOUND')
      return sendResponse(res, 404, 'Salesperson not found');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

// ✅ Delete
export const deleteSalesperson = async (req, res) => {
  try {
    await salespersonService.deleteSalesperson(req.params.id, req);
    return sendResponse(res, 200, 'Salesperson deleted successfully');
  } catch (err) {
    if (err.message === 'SALESPERSON_NOT_FOUND')
      return sendResponse(res, 404, 'Salesperson not found');
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
