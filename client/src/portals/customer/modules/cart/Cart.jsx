import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaArrowLeft,
  FaPills,
} from 'react-icons/fa';
import cartService from '../../../../core/api/customer/cart.service';

export default function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  // Fetch cart data from API
  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartData(response.data?.data || response.data || null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    try {
      const response = await cartService.updateCartItem(itemId, newQuantity);
      setCartData(response.data?.data || response.data || null);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) return;
    setRemovingItemId(itemId);
    try {
      const response = await cartService.removeFromCart(itemId);
      setCartData(response.data?.data || response.data || null);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemovingItemId(null);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    try {
      const response = await cartService.clearCart();
      setCartData(response.data?.data || response.data || null);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const items = cartData?.items || [];
  const summary = cartData?.summary || {
    uniqueItems: 0,
    itemCount: 0,
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
  };
  const checkout = cartData?.checkout || { canProceed: false, message: 'Your cart is empty' };

  // Empty cart
  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Shopping Cart
        </h1>
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShoppingCart className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added any medicines to your cart yet.
          </p>
          <Link
            to="/medicines"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPills />
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Shopping Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {summary.uniqueItems} item{summary.uniqueItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/medicines"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FaArrowLeft />
            Continue Shopping
          </Link>
          <button
            onClick={handleClearCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <FaTrash />
            Clear Cart
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.itemId}
              className={`bg-white rounded-xl shadow-sm border p-4 transition-opacity ${
                removingItemId === item.itemId ? 'opacity-50' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Medicine Image */}
                <Link to={`/medicines/${item.medicineId}`}>
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/100x100?text=Medicine'}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Medicine';
                    }}
                  />
                </Link>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/medicines/${item.medicineId}`}
                        className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.aliasName && (
                        <p className="text-sm text-gray-500 line-clamp-1">{item.aliasName}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.dosageForm && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {item.dosageForm}
                          </span>
                        )}
                        {item.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                        {item.prescriptionRequired && (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                            Rx Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.itemId)}
                      disabled={removingItemId === item.itemId}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItemId === item.itemId}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">
                        {updatingItemId === item.itemId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                        disabled={updatingItemId === item.itemId}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Rs. {item.unitPrice} × {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        Rs. {item.subtotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({summary.itemCount} items)
                </span>
                <span className="font-medium">Rs. {summary.subtotal}</span>
              </div>

              {summary.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax ({(summary.taxRate * 100).toFixed(0)}%)
                  </span>
                  <span className="font-medium">Rs. {summary.taxAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-blue-600">Rs. {summary.total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={!checkout.canProceed}
              className="w-full mt-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Proceed to Checkout
            </button>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                🔒 Secure checkout. Your data is protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
