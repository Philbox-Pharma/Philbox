import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getBranchAllocations,
  completeAllocation,
  getAllocationDetails,
  updateAllocationStatus,
} from '../controller/refundAllocation.controller.js';

const router = express.Router();

const authorizeBranchAdmin = (req, res, next) => {
  if (!req.admin || req.admin.category !== 'branch-admin') {
    return res.status(403).json({
      status: 403,
      message: 'Access denied: Branch-admin only',
    });
  }

  const managedBranches = req.admin.branches_managed || [];
  if (!managedBranches.length) {
    return res.status(403).json({
      status: 403,
      message: 'No branch assigned to this branch admin',
    });
  }

  req.branchId = String(managedBranches[0]);
  return next();
};

router.use(authenticate);
router.use(authorizeBranchAdmin);

router.get('/', getBranchAllocations);
router.get('/:allocationId', getAllocationDetails);
router.post('/:allocationId/complete', completeAllocation);
router.patch('/:allocationId/status', updateAllocationStatus);

export default router;
