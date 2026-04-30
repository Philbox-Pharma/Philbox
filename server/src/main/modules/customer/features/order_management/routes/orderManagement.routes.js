import express from 'express';
import orderManagementController from '../controller/orderManagement.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  rbacMiddleware,
  roleMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

/**
 * @route   GET /api/customer/order-management/orders
 * @desc    Get all orders for current customer
 * @query   status, page, limit, dateFrom, dateTo
 * @access  Private (Customer)
 */
router.get(
  '/orders',
  rbacMiddleware(['read_checkout']),
  orderManagementController.getOrders
);

/**
 * @route   GET /api/customer/order-management/orders/:orderId
 * @desc    Get detailed information for one customer order
 * @access  Private (Customer)
 */
router.get(
  '/orders/:orderId',
  rbacMiddleware(['read_checkout']),
  orderManagementController.getOrderDetails
);

/**
 * @route   GET /api/customer/order-management/orders/:orderId/invoice
 * @desc    Download invoice PDF for a customer order
 * @access  Private (Customer)
 */
router.get(
  '/orders/:orderId/invoice',
  rbacMiddleware(['read_checkout']),
  orderManagementController.downloadInvoice
);

/**
 * @route   POST /api/customer/order-management/orders/:orderId/cancel
 * @desc    Request cancellation for a customer order before completion
 * @body    cancellation_reason (optional)
 * @access  Private (Customer)
 */
router.post(
  '/orders/:orderId/cancel',
  rbacMiddleware(['create_checkout']),
  orderManagementController.cancelOrder
);

/**
 * @route   POST /api/customer/order-management/orders/:orderId/reorder
 * @desc    Reorder the same items from a previous order
 * @access  Private (Customer)
 */
router.post(
  '/orders/:orderId/reorder',
  rbacMiddleware(['create_checkout']),
  orderManagementController.reorderOrder
);

/**
 * @route   POST /api/customer/order-management/orders/:orderId/review
 * @desc    Create a review for a completed order
 * @body    rating, message
 * @access  Private (Customer)
 */
router.post(
  '/orders/:orderId/review',
  rbacMiddleware(['create_checkout']),
  orderManagementController.createOrderReview
);

export default router;
