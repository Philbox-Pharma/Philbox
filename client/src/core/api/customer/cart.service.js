import apiClient from '../client';

const cartService = {
  // Get the current user's cart contents
  // Response: { items: [...], summary: { uniqueItems, itemCount, subtotal, taxRate, taxAmount, total }, checkout: { canProceed, message } }
  getCart: () => {
    return apiClient.get('/customer/cart');
  },

  // Get cart count only
  getCartCount: () => {
    return apiClient.get('/customer/cart/count');
  },

  // Add an item to the cart
  // Body: { medicineId, quantity }
  addToCart: (medicineId, quantity = 1) => {
    return apiClient.post('/customer/cart/items', { medicineId, quantity });
  },

  // Update cart item quantity
  // PATCH /customer/cart/items/:itemId
  updateCartItem: (itemId, quantity) => {
    return apiClient.patch(`/customer/cart/items/${itemId}`, { itemId, quantity });
  },

  // Remove an item from the cart
  // DELETE /customer/cart/items/:itemId
  removeFromCart: (itemId) => {
    return apiClient.delete(`/customer/cart/items/${itemId}`);
  },

  // Clear the entire cart
  clearCart: () => {
    return apiClient.delete('/customer/cart/clear');
  },
};

export default cartService;
