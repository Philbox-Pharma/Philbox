import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createCouponDTO,
  updateCouponDTO,
  validateCouponDTO,
} from '../../../../../dto/admin/coupon.dto.js';
import CouponController from '../controller/coupon.controller.js';

const router = express.Router();

/**
 * Admin Coupon Management Routes
 * Base: /api/admin/coupons
 */

// Apply authentication to all routes
router.use(authenticate);
router.use(isSuperAdmin);

/**
 * Create a new coupon
 * POST /api/admin/coupons
 */
router.post('/', validate(createCouponDTO), (req, res) =>
  CouponController.createCoupon(req, res)
);

/**
 * Get all coupons with optional filters
 * GET /api/admin/coupons?for=medicine&is_active=true&expired=false
 */
router.get('/', (req, res) => CouponController.getAllCoupons(req, res));

/**
 * Get coupon statistics
 * GET /api/admin/coupons/stats/overview
 */
router.get('/stats/overview', (req, res) =>
  CouponController.getCouponStats(req, res)
);

/**
 * Validate coupon for use
 * POST /api/admin/coupons/validate
 */
router.post('/validate', validate(validateCouponDTO), (req, res) =>
  CouponController.validateCoupon(req, res)
);

/**
 * Get coupon by code
 * GET /api/admin/coupons/code/:code
 */
router.get('/code/:code', (req, res) =>
  CouponController.getCouponByCode(req, res)
);

/**
 * Get coupon usage status by code
 * GET /api/admin/coupons/code/:code/usage
 */
router.get('/code/:code/usage', (req, res) =>
  CouponController.checkUsageByCode(req, res)
);

/**
 * Increment coupon usage counter by code
 * POST /api/admin/coupons/code/:code/increment-usage
 */
router.post('/code/:code/increment-usage', (req, res) =>
  CouponController.incrementUsageByCode(req, res)
);

/**
 * Reset coupon usage counter by code
 * POST /api/admin/coupons/code/:code/reset-usage
 */
router.post('/code/:code/reset-usage', (req, res) =>
  CouponController.resetUsageByCode(req, res)
);

/**
 * Update coupon by ID
 * PATCH /api/admin/coupons/:id
 */
router.patch('/:id', validate(updateCouponDTO), (req, res) =>
  CouponController.updateCoupon(req, res)
);

/**
 * Delete coupon by ID
 * DELETE /api/admin/coupons/:id
 */
router.delete('/:id', (req, res) => CouponController.deleteCoupon(req, res));

export default router;
