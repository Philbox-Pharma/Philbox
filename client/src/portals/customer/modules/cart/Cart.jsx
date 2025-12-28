import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';

export default function Cart() {
    const navigate = useNavigate();

    // Mock cart data - baad mein Context/API se aayega
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Panadol Extra',
            generic: 'Paracetamol 500mg',
            price: 150,
            quantity: 2,
            image: 'https://via.placeholder.com/100x100?text=Panadol',
            inStock: true,
            stockCount: 50,
        },
        {
            id: 2,
            name: 'Augmentin 625mg',
            generic: 'Amoxicillin + Clavulanic Acid',
            price: 850,
            quantity: 1,
            image: 'https://via.placeholder.com/100x100?text=Augmentin',
            inStock: true,
            stockCount: 25,
            prescriptionRequired: true,
        },
        {
            id: 3,
            name: 'Centrum Multivitamin',
            generic: 'Multivitamins & Minerals',
            price: 1200,
            quantity: 1,
            image: 'https://via.placeholder.com/100x100?text=Centrum',
            inStock: true,
            stockCount: 15,
        },
    ]);

    // Update quantity
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.min(newQuantity, item.stockCount) }
                    : item
            )
        );
    };

    // Remove item
    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    // Clear cart
    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear the cart?')) {
            setCartItems([]);
        }
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 2000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    // Check if prescription required
    const prescriptionRequired = cartItems.some(item => item.prescriptionRequired);

    // Handle checkout
    const handleCheckout = () => {
        navigate('/checkout');
    };

    // Empty cart view
    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaShoppingBag className="text-4xl text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added any medicines yet.</p>
                    <Link to="/medicines" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                        <FaArrowLeft />
                        Browse Medicines
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Shopping Cart</h1>
                    <p className="text-gray-500 mt-1">{cartItems.length} items in your cart</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`p-4 md:p-6 flex gap-4 ${index !== cartItems.length - 1 ? 'border-b' : ''
                                    }`}
                            >
                                {/* Product Image */}
                                <Link to={`/medicines/${item.id}`}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                                    />
                                </Link>

                                {/* Product Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <div>
                                            <Link
                                                to={`/medicines/${item.id}`}
                                                className="font-semibold text-gray-800 hover:text-blue-600"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{item.generic}</p>
                                            {item.prescriptionRequired && (
                                                <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                                    Prescription Required
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    {/* Price & Quantity */}
                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus className="text-gray-600 text-sm" />
                                            </button>
                                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                                disabled={item.quantity >= item.stockCount}
                                            >
                                                <FaPlus className="text-gray-600 text-sm" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">Rs. {item.price * item.quantity}</p>
                                            <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Continue Shopping */}
                    <Link
                        to="/medicines"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
                    >
                        <FaArrowLeft />
                        Continue Shopping
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

                        {/* Summary Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                                <span className="font-medium">Rs. {subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                {deliveryFee === 0 ? (
                                    <span className="text-green-600 font-medium">FREE</span>
                                ) : (
                                    <span className="font-medium">Rs. {deliveryFee}</span>
                                )}
                            </div>
                            {deliveryFee === 0 && (
                                <p className="text-xs text-green-600">
                                    ✓ Free delivery on orders above Rs. 2000
                                </p>
                            )}
                            {deliveryFee > 0 && (
                                <p className="text-xs text-gray-500">
                                    Add Rs. {2000 - subtotal} more for free delivery
                                </p>
                            )}
                        </div>

                        <hr className="my-4" />

                        {/* Total */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-semibold text-gray-800">Total</span>
                            <span className="text-xl font-bold text-blue-600">Rs. {total}</span>
                        </div>

                        {/* Prescription Warning */}
                        {prescriptionRequired && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ Some items require a prescription. You'll need to upload it during checkout.
                                </p>
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            Proceed to Checkout
                        </button>

                        {/* Trust Badges */}
                        <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">🔒 Secure Payment</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">📦 Fast Delivery</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
