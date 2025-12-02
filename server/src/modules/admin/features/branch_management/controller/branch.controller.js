import sendResponse from '../../../../../utils/sendResponse.js';
import branchService from '../services/branch.service.js';

/* ======================================================
   CREATE BRANCH
====================================================== */
export const createBranch = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendResponse(res, 400, 'Request body is required' + req.body);
    }

    const branch = await branchService.createBranch(req.body);

    return sendResponse(res, 201, 'Branch created successfully', branch);
  } catch (err) {
    console.error(err);

    if (err.message === 'INVALID_DATA') {
      return sendResponse(res, 400, 'Invalid data provided');
    }

    if (err.message === 'BRANCH_NAME_REQUIRED') {
      return sendResponse(res, 400, 'Branch name is required');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   READ: LIST ALL BRANCHES
====================================================== */
export const listBranches = async (req, res) => {
  try {
    const result = await branchService.listBranches(req.query);

    return sendResponse(res, 200, 'Branches fetched successfully', result);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   READ: SINGLE BRANCH BY ID
====================================================== */
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await branchService.getBranchById(id);

    return sendResponse(res, 200, 'Branch fetched successfully', branch);
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   UPDATE BRANCH
====================================================== */
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await branchService.updateBranch(id, req.body);

    return sendResponse(res, 200, 'Branch updated successfully', branch);
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   DELETE BRANCH
====================================================== */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await branchService.deleteBranch(id);

    return sendResponse(res, 200, 'Branch deleted successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
