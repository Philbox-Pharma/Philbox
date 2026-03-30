import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import cartController from '../controllers/cart.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));
router.get('/count', cartController.getCartCount.bind(cartController));
router.post('/items', cartController.addToCart.bind(cartController));
router.patch(
  '/items/:itemId',
  cartController.updateCartItem.bind(cartController)
);
router.delete(
  '/items/:itemId',
  cartController.removeCartItem.bind(cartController)
);
router.delete('/clear', cartController.clearCart.bind(cartController));

export default router;
