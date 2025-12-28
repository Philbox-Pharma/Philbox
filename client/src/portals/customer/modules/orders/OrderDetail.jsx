import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaSpinner,
    FaMapMarkerAlt,
    FaCreditCard,
    FaFileDownload,
    FaPhoneAlt,
    FaRedo,
    FaTimes,
    FaExternalLinkAlt
} from 'react-icons/fa';
import ContactSupportModal from '../../../../shared/components/Modal/ContactSupportModal';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Mock orders database
    const ordersDatabase = {
        'ORD-2024-001': {
            id: 'ORD-2024-001',
            date: '2024-01-20',
            status: 'delivered',
            items: [
                { id: 1, name: 'Panadol Extra', generic: 'Paracetamol 500mg', quantity: 2, price: 150, image: 'https://via.placeholder.com/80x80?text=Panadol' },
                { id: 2, name: 'Augmentin 625mg', generic: 'Amoxicillin', quantity: 1, price: 850, image: 'https://via.placeholder.com/80x80?text=Augmentin' },
            ],
            subtotal: 1150,
            deliveryFee: 0,
            discount: 50,
            total: 1100,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Paid',
            address: { fullName: 'John Doe', phone: '03001234567', street: 'House 12, Street 5', city: 'Lahore', province: 'Punjab', zipCode: '54000' },
            tracking: { number: 'TRK987654321', carrier: 'TCS Express', estimatedDelivery: '2024-01-23', trackingUrl: 'https://www.tcs.com.pk/track' },
            deliveryDate: '2024-01-23',
            timeline: [
                { status: 'Order Placed', date: '2024-01-20', time: '10:30 AM', completed: true },
                { status: 'Payment Confirmed', date: '2024-01-20', time: '10:35 AM', completed: true },
                { status: 'Processing', date: '2024-01-20', time: '02:00 PM', completed: true },
                { status: 'Shipped', date: '2024-01-21', time: '09:00 AM', completed: true },
                { status: 'Out for Delivery', date: '2024-01-23', time: '08:00 AM', completed: true },
                { status: 'Delivered', date: '2024-01-23', time: '02:30 PM', completed: true },
            ],
        },
        'ORD-2024-002': {
            id: 'ORD-2024-002',
            date: '2024-01-22',
            status: 'shipped',
            items: [
                { id: 3, name: 'Centrum Multivitamin', generic: 'Multivitamins', quantity: 1, price: 1200, image: 'https://via.placeholder.com/80x80?text=Centrum' },
            ],
            subtotal: 1200,
            deliveryFee: 150,
            discount: 0,
            total: 1350,
            paymentMethod: 'JazzCash',
            paymentStatus: 'Paid',
            address: { fullName: 'John Doe', phone: '03001234567', street: 'House 12, Street 5', city: 'Lahore', province: 'Punjab', zipCode: '54000' },
            tracking: { number: 'TRK123456789', carrier: 'TCS Express', estimatedDelivery: '2024-01-25', trackingUrl: 'https://www.tcs.com.pk/track' },
            timeline: [
                { status: 'Order Placed', date: '2024-01-22', time: '10:30 AM', completed: true },
                { status: 'Payment Confirmed', date: '2024-01-22', time: '10:35 AM', completed: true },
                { status: 'Processing', date: '2024-01-22', time: '02:00 PM', completed: true },
                { status: 'Shipped', date: '2024-01-23', time: '09:00 AM', completed: true },
                { status: 'Out for Delivery', date: '', time: '', completed: false },
                { status: 'Delivered', date: '', time: '', completed: false },
            ],
        },
        'ORD-2024-003': {
            id: 'ORD-2024-003',
            date: '2024-01-24',
            status: 'processing',
            items: [
                { id: 4, name: 'Glucophage 500mg', generic: 'Metformin', quantity: 2, price: 320, image: 'https://via.placeholder.com/80x80?text=Glucophage' },
                { id: 5, name: 'Lipitor 20mg', generic: 'Atorvastatin', quantity: 1, price: 650, image: 'https://via.placeholder.com/80x80?text=Lipitor' },
            ],
            subtotal: 1290,
            deliveryFee: 150,
            discount: 0,
            total: 1440,
            paymentMethod: 'Credit Card',
            paymentStatus: 'Paid',
            address: { fullName: 'John Doe', phone: '03001234567', street: 'House 12, Street 5', city: 'Lahore', province: 'Punjab', zipCode: '54000' },
            tracking: null,
            timeline: [
                { status: 'Order Placed', date: '2024-01-24', time: '11:00 AM', completed: true },
                { status: 'Payment Confirmed', date: '2024-01-24', time: '11:05 AM', completed: true },
                { status: 'Processing', date: '2024-01-24', time: '03:00 PM', completed: true },
                { status: 'Shipped', date: '', time: '', completed: false },
                { status: 'Out for Delivery', date: '', time: '', completed: false },
                { status: 'Delivered', date: '', time: '', completed: false },
            ],
        },
        'ORD-2024-004': {
            id: 'ORD-2024-004',
            date: '2024-01-25',
            status: 'pending',
            items: [
                { id: 6, name: 'Voltral 50mg', generic: 'Diclofenac Sodium', quantity: 3, price: 220, image: 'https://via.placeholder.com/80x80?text=Voltral' },
            ],
            subtotal: 660,
            deliveryFee: 150,
            discount: 0,
            total: 810,
            paymentMethod: 'EasyPaisa',
            paymentStatus: 'Pending',
            address: { fullName: 'John Doe', phone: '03001234567', street: 'House 12, Street 5', city: 'Lahore', province: 'Punjab', zipCode: '54000' },
            tracking: null,
            timeline: [
                { status: 'Order Placed', date: '2024-01-25', time: '09:00 AM', completed: true },
                { status: 'Payment Confirmed', date: '', time: '', completed: false },
                { status: 'Processing', date: '', time: '', completed: false },
                { status: 'Shipped', date: '', time: '', completed: false },
                { status: 'Out for Delivery', date: '', time: '', completed: false },
                { status: 'Delivered', date: '', time: '', completed: false },
            ],
        },
        'ORD-2024-005': {
            id: 'ORD-2024-005',
            date: '2024-01-18',
            status: 'cancelled',
            items: [
                { id: 7, name: 'Dermazole Cream', generic: 'Ketoconazole 2%', quantity: 1, price: 350, image: 'https://via.placeholder.com/80x80?text=Dermazole' },
            ],
            subtotal: 350,
            deliveryFee: 150,
            discount: 0,
            total: 500,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Refunded',
            cancelReason: 'Customer requested cancellation',
            address: { fullName: 'John Doe', phone: '03001234567', street: 'House 12, Street 5', city: 'Lahore', province: 'Punjab', zipCode: '54000' },
            tracking: null,
            timeline: [
                { status: 'Order Placed', date: '2024-01-18', time: '10:00 AM', completed: true },
                { status: 'Cancelled', date: '2024-01-18', time: '11:30 AM', completed: true },
            ],
        },
    };

    // Get order from mock database
    const order = ordersDatabase[id];

    // Order not found
    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
                <Link to="/orders" className="btn-primary inline-block px-6 py-3">
                    View All Orders
                </Link>
            </div>
        );
    }

    // Status config
    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
        processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: FaSpinner },
        shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: FaTruck },
        delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className={status === 'processing' ? 'animate-spin' : ''} />
                {config.label}
            </span>
        );
    };

    // Cancel Order Handler
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please select a reason for cancellation');
            return;
        }

        setCancelLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert('Order cancelled successfully!');
            setShowCancelModal(false);
            navigate('/orders');
        } catch (err) {
            alert('Failed to cancel order. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    // Download Invoice Handler
    const handleDownloadInvoice = () => {
        // Simulate invoice download
        alert(`Downloading invoice for ${order.id}...`);
        // In real app: generate PDF or call API
    };

    // Reorder Handler
    const handleReorder = () => {
        // In real app: add items to cart and navigate
        alert('Items added to cart!');
        navigate('/cart');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link
                to="/orders"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
            >
                <FaArrowLeft />
                Back to Orders
            </Link>

            {/* Order Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{order.id}</h1>
                        <p className="text-gray-500 mt-1">Placed on {order.date}</p>
                    </div>
                    <StatusBadge status={order.status} />
                </div>

                {/* Tracking Info */}
                {order.status === 'shipped' && order.tracking && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Tracking Number</p>
                                <p className="text-lg font-bold text-purple-700">{order.tracking.number}</p>
                                <p className="text-sm text-purple-600 mt-1">
                                    via {order.tracking.carrier} • Est. Delivery: {order.tracking.estimatedDelivery}
                                </p>
                            </div>

                        </div>
                    </div>
                )}

                {/* Cancelled Reason */}
                {order.status === 'cancelled' && order.cancelReason && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                            <span className="font-medium">Cancellation Reason:</span> {order.cancelReason}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <Link to={`/medicines/${item.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500">{item.generic}</p>
                                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">Rs. {item.price * item.quantity}</p>
                                        <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h2>
                        <div className="relative">
                            {order.timeline.map((step, index) => (
                                <div key={index} className="flex gap-4 pb-6 last:pb-0">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        {index !== order.timeline.length - 1 && (
                                            <div className={`w-0.5 flex-1 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {step.status}
                                        </p>
                                        {step.completed && step.date && (
                                            <p className="text-sm text-gray-500">{step.date} at {step.time}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">Rs. {order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-medium">{order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>- Rs. {order.discount}</span>
                                </div>
                            )}
                            <hr />
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold text-gray-800">Total</span>
                                <span className="font-bold text-blue-600">Rs. {order.total}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <FaCreditCard className="text-gray-400" />
                                <span className="text-gray-600">{order.paymentMethod}</span>
                                <span className={`ml-auto px-2 py-0.5 text-xs rounded ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                    order.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
                        <div className="flex gap-3">
                            <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">{order.address.fullName}</p>
                                <p className="text-sm text-gray-600 mt-1">{order.address.phone}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {order.address.street}, {order.address.city}, {order.address.province} - {order.address.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
                        <div className="space-y-3">
                            {/* Download Invoice - Only for delivered */}
                            {order.status === 'delivered' && (
                                <button
                                    onClick={handleDownloadInvoice}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <FaFileDownload />
                                    Download Invoice
                                </button>
                            )}

                            {/* Reorder */}
                            <button
                                onClick={handleReorder}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaRedo />
                                Reorder Items
                            </button>

                            {/* Common - Contact Support */}
                            <button
                                onClick={() => setShowContactModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaPhoneAlt />
                                Contact Support
                            </button>

                            {/* Cancel Order - Only for pending/processing */}
                            {(order.status === 'pending' || order.status === 'processing') && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <FaTimesCircle />
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Cancel Order</h3>
                            <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-4">
                            Are you sure you want to cancel order <strong>{order.id}</strong>? This action cannot be undone.
                        </p>

                        <div className="mb-4">
                            <label className="input-label">Reason for cancellation *</label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select a reason</option>
                                <option value="Changed my mind">Changed my mind</option>
                                <option value="Found better price elsewhere">Found better price elsewhere</option>
                                <option value="Ordered by mistake">Ordered by mistake</option>
                                <option value="Delivery time too long">Delivery time too long</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelLoading || !cancelReason}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Support Modal - Reusable Component */}
            <ContactSupportModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
            />
        </div>
    );
}
