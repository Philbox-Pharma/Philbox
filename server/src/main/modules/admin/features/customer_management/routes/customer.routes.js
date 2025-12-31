import express from 'express';
import customerController from '../controller/customer.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  getCustomersDTO,
  toggleCustomerStatusDTO,
  getCustomerMetricsDTO,
} from '../../../../../dto/admin/customer.dto.js';

const router = express.Router();

/**
 * @route   GET /api/super-admin/customers/metrics/analytics
 * @desc    Get customer metrics and analytics
 * @access  Private (Super Admin / Branch Admin)
 */
router.get(
  '/metrics/analytics',
  authenticate,
  validate(getCustomerMetricsDTO, 'query'),
  customerController.getCustomerMetrics
);

/**
 * @route   GET /api/super-admin/customers
 * @desc    Get all customers with filters and pagination
 * @access  Private (Super Admin / Branch Admin)
 */
router.get(
  '/',
  authenticate,
  validate(getCustomersDTO, 'query'),
  customerController.getCustomers
);

/**
 * @route   GET /api/super-admin/customers/:id
 * @desc    Get single customer details with orders, reviews, complaints
 * @access  Private (Super Admin / Branch Admin)
 */
router.get('/:id', authenticate, customerController.getCustomerById);

/**
 * @route   PATCH /api/super-admin/customers/:id/status
 * @desc    Toggle customer account status (activate/deactivate)
 * @access  Private (Super Admin / Branch Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  validate(toggleCustomerStatusDTO, 'body'),
  customerController.toggleCustomerStatus
);

export default router;
