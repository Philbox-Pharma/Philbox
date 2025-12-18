import sendResponse from '../../../../../utils/sendResponse.js';
import branchService from '../services/branch.service.js';

/* ======================================================
   CREATE BRANCH
====================================================== */
export const createBranch = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendResponse(res, 400, 'Request body is required');
    }

    const branch = await branchService.createBranch(req.body, req);

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
    const result = await branchService.listBranches(req.query, req);

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
    const branch = await branchService.getBranchById(id, req);

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
    const branch = await branchService.updateBranch(id, req.body, req);

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
   TOGGLE BRANCH STATUS
====================================================== */
export const toggleBranchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await branchService.toggleBranchStatus(id, req);

    return sendResponse(res, 200, 'Branch status toggled successfully', branch);
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   ASSIGN ADMINS TO BRANCH
====================================================== */
export const assignAdminsToBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { under_administration_of } = req.body;

    if (!under_administration_of || !Array.isArray(under_administration_of)) {
      return sendResponse(
        res,
        400,
        'under_administration_of must be an array of admin IDs'
      );
    }

    const branch = await branchService.assignAdminsToBranch(
      id,
      under_administration_of,
      req
    );

    return sendResponse(
      res,
      200,
      'Admins assigned to branch successfully',
      branch
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    if (err.message === 'INVALID_ADMIN_IDS') {
      return sendResponse(res, 400, 'One or more admin IDs are invalid');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   ASSIGN SALESPERSONS TO BRANCH
====================================================== */
export const assignSalespersonsToBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { salespersons_assigned } = req.body;

    if (!salespersons_assigned || !Array.isArray(salespersons_assigned)) {
      return sendResponse(
        res,
        400,
        'salespersons_assigned must be an array of salesperson IDs'
      );
    }

    const branch = await branchService.assignSalespersonsToBranch(
      id,
      salespersons_assigned,
      req
    );

    return sendResponse(
      res,
      200,
      'Salespersons assigned to branch successfully',
      branch
    );
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    if (err.message === 'INVALID_SALESPERSON_IDS') {
      return sendResponse(res, 400, 'One or more salesperson IDs are invalid');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   GET BRANCH STATISTICS
====================================================== */
export const getBranchStatistics = async (req, res) => {
  try {
    const statistics = await branchService.getBranchStatistics();

    return sendResponse(
      res,
      200,
      'Branch statistics fetched successfully',
      statistics
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

/* ======================================================
   GET BRANCH PERFORMANCE METRICS
====================================================== */
export const getBranchPerformanceMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, period } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (period) options.period = period;

    const metrics = await branchService.getBranchPerformanceMetrics(
      id,
      options
    );

    return sendResponse(
      res,
      200,
      'Branch performance metrics fetched successfully',
      metrics
    );
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
    await branchService.deleteBranch(id, req);

    return sendResponse(res, 200, 'Branch deleted successfully');
  } catch (err) {
    console.error(err);

    if (err.message === 'BRANCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Branch not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err);
  }
};
