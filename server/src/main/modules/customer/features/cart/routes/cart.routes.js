import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  rbacMiddleware,
  roleMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import cartController from '../controllers/cart.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

/**
 * @route   GET /api/customer/cart
 * @desc    Get current customer's cart details
 * @access  Private (Customer only)
 */
router.get(
  '/',
  rbacMiddleware(['read_cart']),
  cartController.getCart.bind(cartController)
);

/**
 * @route   GET /api/customer/cart/count
 * @desc    Get current customer's cart item count
 * @access  Private (Customer only)
 */
router.get(
  '/count',
  rbacMiddleware(['read_cart']),
  cartController.getCartCount.bind(cartController)
);

/**
 * @route   POST /api/customer/cart/items
 * @desc    Add an item to current customer's cart
 * @access  Private (Customer only)
 */
router.post(
  '/items',
  rbacMiddleware(['create_cart']),
  cartController.addToCart.bind(cartController)
);

/**
 * @route   PATCH /api/customer/cart/items/:itemId
 * @desc    Update quantity/details of a cart item
 * @access  Private (Customer only)
 */
router.patch(
  '/items/:itemId',
  rbacMiddleware(['update_cart']),
  cartController.updateCartItem.bind(cartController)
);

/**
 * @route   DELETE /api/customer/cart/items/:itemId
 * @desc    Remove a specific item from cart
 * @access  Private (Customer only)
 */
router.delete(
  '/items/:itemId',
  rbacMiddleware(['delete_cart']),
  cartController.removeCartItem.bind(cartController)
);

/**
 * @route   DELETE /api/customer/cart/clear
 * @desc    Remove all items from current customer's cart
 * @access  Private (Customer only)
 */
router.delete(
  '/clear',
  rbacMiddleware(['delete_cart']),
  cartController.clearCart.bind(cartController)
);

export default router;
