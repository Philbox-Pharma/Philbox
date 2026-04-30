import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import {
  getPendingRefundRequests,
  approveAndAllocateRefund,
  rejectRefundRequest,
  processFinalRefundToCustomer,
} from '../controller/customerRefundManagement.controller.js';

const router = express.Router();

// All routes require super admin authentication
router.use(authenticate);
router.use(isSuperAdmin);

// Get all pending refund requests
router.get('/requests/pending', getPendingRefundRequests);

// Approve and allocate refund to branches
router.post(
  '/requests/:requestId/approve-and-allocate',
  approveAndAllocateRefund
);

// Reject a refund request
router.post('/requests/:requestId/reject', rejectRefundRequest);

// Process final refund to customer (after all branches complete)
router.post(
  '/requests/:requestId/process-refund',
  processFinalRefundToCustomer
);

export default router;
