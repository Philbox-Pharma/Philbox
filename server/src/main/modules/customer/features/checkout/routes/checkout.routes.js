import express from 'express';
import checkoutController from '../controller/checkout.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  rbacMiddleware,
  roleMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

/**
 * @route   GET /api/customer/checkout/summary
 * @desc    Get checkout summary for current customer
 * @query   address_id, coupon_code, delivery_google_map_link
 * @access  Private (Customer)
 */
router.get(
  '/summary',
  rbacMiddleware(['read_checkout']),
  checkoutController.getCheckoutSummary
);

/**
 * @route   POST /api/customer/checkout/prescription
 * @desc    Upload prescription for order
 * @body    file (multipart), notes (string)
 * @access  Private (Customer)
 */
router.post(
  '/prescription',
  rbacMiddleware(['create_checkout', 'create_prescriptions']),
  upload.single('prescription'),
  checkoutController.uploadPrescription
);

/**
 * @route   POST /api/customer/checkout/stripe/payment-method
 * @desc    Create a Stripe PaymentMethod from raw test card details
 * @body    card_number, exp_month, exp_year, cvc, cardholder_name
 * @access  Private (Customer)
 */
router.post(
  '/stripe/payment-method',
  rbacMiddleware(['create_checkout']),
  checkoutController.createStripeTestPaymentMethod
);

/**
 * @route   POST /api/customer/checkout/place-order
 * @desc    Place a new order
 * @body    address_id, delivery_google_map_link, coupon_code, payment_method,
 *          wallet_number, stripe_payment_method_id, prescription_id, notes, country
 * @access  Private (Customer)
 */
router.post(
  '/place-order',
  rbacMiddleware(['create_checkout', 'create_orders']),
  checkoutController.placeOrder
);

/**
 * @route   GET /api/customer/checkout/download-invoice/:orderId
 * @desc    Download invoice PDF for a completed customer order
 * @access  Private (Customer)
 */
router.get(
  '/download-invoice/:orderId',
  rbacMiddleware(['read_checkout']),
  checkoutController.downloadInvoice
);

export default router;
