import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  rbacMiddleware,
  roleMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import {
  submitRefundRequest,
  getMyRefundRequests,
  getRefundRequestDetails,
} from '../controller/customerRefundRequest.controller.js';

const router = express.Router();

// All routes require customer authentication
router.use(authenticate);
router.use(roleMiddleware(['customer']));

// Submit a new refund request
router.post(
  '/',
  rbacMiddleware(['create_refund_requests']),
  submitRefundRequest
);

// Get all refund requests for the customer
router.get('/', rbacMiddleware(['read_refund_requests']), getMyRefundRequests);

// Get details of a specific refund request
router.get(
  '/:requestId',
  rbacMiddleware(['read_refund_requests']),
  getRefundRequestDetails
);

export default router;
