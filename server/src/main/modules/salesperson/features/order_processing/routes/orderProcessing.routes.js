import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import {
  getPendingOrdersForProcessing,
  getAllPendingOrdersForSalesperson,
  getCancellationRequestsForSalesperson,
  getOrderDetailsForProcessing,
  searchOrders,
  markOrderAsPacked,
  markOrderAsReadyForDelivery,
  approveCancellationRequest,
  rejectCancellationRequest,
  viewPrescription,
  allowPrescriptionForCart,
} from '../controller/orderProcessing.controller.js';

const router = express.Router();

/**
 * All routes require salesperson authentication and role access.
 * The RBAC checks below keep read and write actions separated.
 */
router.use(authenticate);
router.use(roleMiddleware(['salesperson']));

/**
 * @route   GET /api/salesperson/order-processing/processing
 * @desc    Get orders that require processing, including prescription-backed or multi-branch orders
 * @path    processing
 * @access  Private (Salesperson) - read_order_processing
 */
router.get(
  '/processing',
  rbacMiddleware(['read_order_processing']),
  getPendingOrdersForProcessing
);

/**
 * @route   GET /api/salesperson/order-processing/pending
 * @desc    Get all pending orders assigned to the salesperson queue
 * @path    pending
 * @access  Private (Salesperson) - read_order_processing
 */
router.get(
  '/pending',
  rbacMiddleware(['read_order_processing']),
  getAllPendingOrdersForSalesperson
);

/**
 * @route   GET /api/salesperson/order-processing/cancellation-requests
 * @desc    Get cancellation requests waiting for salesperson review
 * @path    cancellation-requests
 * @access  Private (Salesperson) - read_order_processing
 */
router.get(
  '/cancellation-requests',
  rbacMiddleware(['read_order_processing']),
  getCancellationRequestsForSalesperson
);

/**
 * @route   GET /api/salesperson/order-processing/search
 * @desc    Search orders within the salesperson order-processing workflow
 * @path    search
 * @access  Private (Salesperson) - read_order_processing
 */
router.get('/search', rbacMiddleware(['read_order_processing']), searchOrders);

/**
 * @route   GET /api/salesperson/order-processing/:orderId
 * @desc    Get order details for processing and review
 * @path    :orderId
 * @access  Private (Salesperson) - read_order_processing
 */
router.get(
  '/:orderId',
  rbacMiddleware(['read_order_processing']),
  getOrderDetailsForProcessing
);

/**
 * @route   GET /api/salesperson/order-processing/:orderId/prescription/:orderItemId
 * @desc    View the prescription attached to a specific order item
 * @path    :orderId/prescription/:orderItemId
 * @access  Private (Salesperson) - read_order_processing
 */
router.get(
  '/:orderId/prescription/:orderItemId',
  rbacMiddleware(['read_order_processing']),
  viewPrescription
);

/**
 * @route   POST /api/salesperson/order-processing/uploaded-prescriptions/:prescriptionId/allow
 * @desc    Save an allow payload for an uploaded prescription
 * @path    uploaded-prescriptions/:prescriptionId/allow
 * @access  Private (Salesperson) - update_order_processing
 */
router.post(
  '/uploaded-prescriptions/:prescriptionId/allow',
  rbacMiddleware(['update_order_processing']),
  allowPrescriptionForCart
);

/**
 * @route   POST /api/salesperson/order-processing/:orderId/mark-packed
 * @desc    Mark an order as packed
 * @path    :orderId/mark-packed
 * @access  Private (Salesperson) - update_order_processing
 */
router.post(
  '/:orderId/mark-packed',
  rbacMiddleware(['update_order_processing']),
  markOrderAsPacked
);

/**
 * @route   POST /api/salesperson/order-processing/:orderId/mark-ready-delivery
 * @desc    Mark an order as ready for delivery
 * @path    :orderId/mark-ready-delivery
 * @access  Private (Salesperson) - update_order_processing
 */
router.post(
  '/:orderId/mark-ready-delivery',
  rbacMiddleware(['update_order_processing']),
  markOrderAsReadyForDelivery
);

/**
 * @route   POST /api/salesperson/order-processing/:orderId/cancel-approve
 * @desc    Approve a cancellation request for an order
 * @path    :orderId/cancel-approve
 * @access  Private (Salesperson) - update_order_processing
 */
router.post(
  '/:orderId/cancel-approve',
  rbacMiddleware(['update_order_processing']),
  approveCancellationRequest
);

/**
 * @route   POST /api/salesperson/order-processing/:orderId/cancel-reject
 * @desc    Reject a cancellation request for an order
 * @path    :orderId/cancel-reject
 * @access  Private (Salesperson) - update_order_processing
 */
router.post(
  '/:orderId/cancel-reject',
  rbacMiddleware(['update_order_processing']),
  rejectCancellationRequest
);

export default router;
