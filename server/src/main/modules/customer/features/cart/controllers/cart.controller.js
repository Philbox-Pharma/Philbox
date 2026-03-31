import sendResponse from '../../../../../utils/sendResponse.js';
import cartService from '../service/cart.service.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from '../../../../../dto/customer/cart.dto.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerCartController {
  async getCart(req, res) {
    try {
      const customerId = req.user?.id;
      const cart = await cartService.getCart(customerId);
      return sendResponse(res, 200, 'Cart fetched successfully', cart);
    } catch (error) {
      console.error('Error in getCart:', error);
      return sendResponse(
        res,
        500,
        'Failed to fetch cart',
        null,
        error.message
      );
    }
  }

  async getCartCount(req, res) {
    try {
      const customerId = req.user?.id;
      const result = await cartService.getCartCount(customerId);
      return sendResponse(res, 200, 'Cart count fetched successfully', result);
    } catch (error) {
      console.error('Error in getCartCount:', error);
      return sendResponse(
        res,
        500,
        'Failed to fetch cart count',
        null,
        error.message
      );
    }
  }

  async addToCart(req, res) {
    try {
      const customerId = req.user?.id;
      const { error, value } = addToCartSchema.validate(req.body);
      if (error) {
        return sendResponse(res, 400, error.details[0].message);
      }

      const cart = await cartService.addToCart(customerId, value);
      const responseMessage = cart.message || 'Item added to cart';

      await logCustomerActivity(
        req,
        'ADDED_TO_CART',
        `Added medicine ${value.medicineId} to cart. ${responseMessage}`,
        'carts'
      );

      return sendResponse(res, 200, responseMessage, cart);
    } catch (error) {
      console.error('Error in addToCart:', error);

      if (error.message === 'MEDICINE_NOT_AVAILABLE') {
        return sendResponse(res, 404, 'Medicine not found or unavailable');
      }
      if (error.message === 'NO_STOCK_ANY_BRANCH') {
        return sendResponse(res, 409, 'Medicine is out of stock right now');
      }
      if (error.message === 'NO_STOCK_IN_CUSTOMER_CITY') {
        return sendResponse(res, 409, 'Medicine is not available in your city');
      }
      if (error.message === 'CUSTOMER_CITY_NOT_AVAILABLE') {
        return sendResponse(res, 400, 'Customer city is required');
      }
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }

      return sendResponse(
        res,
        500,
        'Failed to add item to cart',
        null,
        error.message
      );
    }
  }

  async updateCartItem(req, res) {
    try {
      const customerId = req.user?.id;
      const { error, value } = updateCartItemSchema.validate({
        itemId: req.params.itemId,
        quantity: req.body.quantity,
      });

      if (error) {
        return sendResponse(res, 400, error.details[0].message);
      }

      const cart = await cartService.updateCartItem(
        customerId,
        value.itemId,
        value.quantity
      );

      await logCustomerActivity(
        req,
        'UPDATED_CART_ITEM',
        `Updated cart item ${value.itemId} quantity to ${value.quantity}`,
        'carts'
      );

      return sendResponse(res, 200, 'Cart item updated successfully', cart);
    } catch (error) {
      console.error('Error in updateCartItem:', error);

      if (error.message === 'CART_ITEM_NOT_FOUND') {
        return sendResponse(res, 404, 'Cart item not found');
      }

      return sendResponse(
        res,
        500,
        'Failed to update cart item',
        null,
        error.message
      );
    }
  }

  async removeCartItem(req, res) {
    try {
      const customerId = req.user?.id;
      const { error, value } = removeCartItemSchema.validate({
        itemId: req.params.itemId,
      });

      if (error) {
        return sendResponse(res, 400, error.details[0].message);
      }

      const cart = await cartService.removeCartItem(customerId, value.itemId);

      await logCustomerActivity(
        req,
        'REMOVED_CART_ITEM',
        `Removed cart item ${value.itemId}`,
        'carts'
      );

      return sendResponse(res, 200, 'Cart item removed successfully', cart);
    } catch (error) {
      console.error('Error in removeCartItem:', error);

      if (error.message === 'CART_ITEM_NOT_FOUND') {
        return sendResponse(res, 404, 'Cart item not found');
      }

      return sendResponse(
        res,
        500,
        'Failed to remove cart item',
        null,
        error.message
      );
    }
  }

  async clearCart(req, res) {
    try {
      const customerId = req.user?.id;
      const cart = await cartService.clearCart(customerId);

      await logCustomerActivity(
        req,
        'CLEARED_CART',
        'Cleared all cart items',
        'carts'
      );

      return sendResponse(res, 200, 'Cart cleared successfully', cart);
    } catch (error) {
      console.error('Error in clearCart:', error);
      return sendResponse(
        res,
        500,
        'Failed to clear cart',
        null,
        error.message
      );
    }
  }
}

export default new CustomerCartController();
