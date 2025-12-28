import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaCreditCard,
    FaMoneyBillWave,
    FaMobileAlt,
    FaUpload,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaEdit,
    FaFilePrescription,
    FaPills,
    FaExclamationTriangle,
    FaTimes
} from 'react-icons/fa';

export default function Checkout() {
    const _navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Address, 2: Payment & Prescription, 3: Review
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Address State
    const [address, setAddress] = useState({
        fullName: 'John Doe',
        phone: '03001234567',
        street: 'House 12, Street 5, Block B',
        city: 'Lahore',
        province: 'Punjab',
        zipCode: '54000',
    });

    const [editingAddress, setEditingAddress] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('');

    // Prescription State - Enhanced
    const [prescriptionSource, setPrescriptionSource] = useState(''); // 'existing' or 'upload'
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [uploadedPrescription, setUploadedPrescription] = useState(null);

    // Mock cart data
    const cartItems = [
        {
            id: 1,
            name: 'Panadol Extra',
            genericName: 'Paracetamol',
            price: 150,
            quantity: 2,
            image: 'https://via.placeholder.com/60x60?text=P',
            prescriptionRequired: false,
        },
        {
            id: 2,
            name: 'Augmentin 625mg',
            genericName: 'Amoxicillin + Clavulanic Acid',
            price: 850,
            quantity: 1,
            image: 'https://via.placeholder.com/60x60?text=A',
            prescriptionRequired: true,
        },
        {
            id: 3,
            name: 'Lipitor 20mg',
            genericName: 'Atorvastatin',
            price: 1200,
            quantity: 1,
            image: 'https://via.placeholder.com/60x60?text=L',
            prescriptionRequired: true,
        },
    ];

    // Mock existing prescriptions (from doctor appointments)
    const existingPrescriptions = [
        {
            id: 'PRX-001',
            doctor: 'Dr. Ahmed Khan',
            date: '2024-01-20',
            diagnosis: 'Hypertension',
            medicines: ['Amlodipine 5mg', 'Aspirin 75mg'],
            status: 'active',
        },
        {
            id: 'PRX-002',
            doctor: 'Dr. Fatima Noor',
            date: '2024-01-15',
            diagnosis: 'Iron Deficiency',
            medicines: ['Ferrous Sulfate 200mg', 'Vitamin C 500mg'],
            status: 'active',
        },
    ];

    // Calculate totals
    const prescriptionRequired = cartItems.some(item => item.prescriptionRequired);
    const rxItems = cartItems.filter(item => item.prescriptionRequired);
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 2000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    // Payment methods
    const paymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', icon: FaMoneyBillWave, description: 'Pay when you receive' },
        { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, description: 'Visa, Mastercard' },
        { id: 'jazzcash', name: 'JazzCash', icon: FaMobileAlt, description: 'Mobile wallet' },
        { id: 'easypaisa', name: 'EasyPaisa', icon: FaMobileAlt, description: 'Mobile wallet' },
    ];

    // Handle address change
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    // Handle prescription upload
    const handlePrescriptionUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }
            setUploadedPrescription(file);
            setPrescriptionSource('upload');
            setSelectedPrescription(null);
        }
    };

    // Handle existing prescription selection
    const handleSelectExistingPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        setPrescriptionSource('existing');
        setUploadedPrescription(null);
    };

    // Clear prescription selection
    const clearPrescriptionSelection = () => {
        setPrescriptionSource('');
        setSelectedPrescription(null);
        setUploadedPrescription(null);
    };

    // Handle place order
    const handlePlaceOrder = async () => {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setLoading(false);
        setOrderPlaced(true);
    };

    // Validate step
    const canProceed = () => {
        if (step === 1) {
            return address.fullName && address.phone && address.street && address.city;
        }
        if (step === 2) {
            if (!paymentMethod) return false;
            if (prescriptionRequired) {
                // Must have either existing prescription selected OR uploaded file
                if (!selectedPrescription && !uploadedPrescription) return false;
            }
            return true;
        }
        return true;
    };

    // Get prescription display info
    const getPrescriptionInfo = () => {
        if (selectedPrescription) {
            return {
                type: 'Digital Prescription',
                detail: `${selectedPrescription.id} - ${selectedPrescription.doctor}`,
            };
        }
        if (uploadedPrescription) {
            return {
                type: 'Uploaded Prescription',
                detail: uploadedPrescription.name,
            };
        }
        return null;
    };

    // Order Placed Success Screen
    if (orderPlaced) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-4xl text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500 mb-2">Your order #ORD-2024-001 has been confirmed.</p>
                <p className="text-gray-500 mb-8">You will receive an email confirmation shortly.</p>

                {prescriptionRequired && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <FaFilePrescription className="text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Prescription Under Review</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Your prescription will be verified by our pharmacist before dispatch.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="text-lg font-semibold text-gray-800">2-3 Business Days</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/orders" className="btn-primary px-6 py-3">
                        View Orders
                    </Link>
                    <Link to="/medicines" className="btn-secondary px-6 py-3">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
            >
                <FaArrowLeft />
                Back to Cart
            </Link>

            {/* Page Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                {[
                    { num: 1, label: 'Address' },
                    { num: 2, label: prescriptionRequired ? 'Payment & Rx' : 'Payment' },
                    { num: 3, label: 'Review' }
                ].map((s, index) => (
                    <div key={s.num} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${step >= s.num
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {s.num}
                        </div>
                        <span
                            className={`ml-2 text-sm hidden sm:block ${step >= s.num ? 'text-blue-600 font-medium' : 'text-gray-500'
                                }`}
                        >
                            {s.label}
                        </span>
                        {index < 2 && (
                            <div
                                className={`w-12 sm:w-24 h-1 mx-2 ${step > s.num ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Step 1: Address */}
                    {step === 1 && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Delivery Address
                            </h2>

                            {!editingAddress ? (
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <FaMapMarkerAlt className="text-blue-500 mt-1" />
                                            <div>
                                                <p className="font-medium text-gray-800">{address.fullName}</p>
                                                <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {address.street}, {address.city}, {address.province} - {address.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditingAddress(true)}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <FaEdit />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={address.fullName}
                                                onChange={handleAddressChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={address.phone}
                                                onChange={handleAddressChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="input-label">Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={address.street}
                                            onChange={handleAddressChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="input-label">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={address.city}
                                                onChange={handleAddressChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Province</label>
                                            <input
                                                type="text"
                                                name="province"
                                                value={address.province}
                                                onChange={handleAddressChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Zip Code</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={address.zipCode}
                                                onChange={handleAddressChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setEditingAddress(false)}
                                        className="btn-primary"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Payment & Prescription */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Prescription Section - Show only if required */}
                            {prescriptionRequired && (
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaFilePrescription className="text-orange-500" />
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Prescription Required
                                        </h2>
                                    </div>

                                    {/* Warning Banner */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <FaExclamationTriangle className="text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-orange-800">
                                                    The following items require a valid prescription:
                                                </p>
                                                <ul className="text-sm text-orange-700 mt-1 list-disc list-inside">
                                                    {rxItems.map(item => (
                                                        <li key={item.id}>{item.name} ({item.genericName})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prescription Options */}
                                    <div className="space-y-4">
                                        {/* Option 1: Select Existing Digital Prescription */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Option 1: Use a digital prescription from your doctor
                                            </p>

                                            {existingPrescriptions.length > 0 ? (
                                                <div className="space-y-2">
                                                    {existingPrescriptions.map((prx) => (
                                                        <div
                                                            key={prx.id}
                                                            onClick={() => handleSelectExistingPrescription(prx)}
                                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedPrescription?.id === prx.id
                                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPrescription?.id === prx.id
                                                                        ? 'border-blue-500 bg-blue-500'
                                                                        : 'border-gray-300'
                                                                        }`}>
                                                                        {selectedPrescription?.id === prx.id && (
                                                                            <FaCheckCircle className="text-white text-xs" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-800">{prx.doctor}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {prx.date} • {prx.diagnosis}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                                    {prx.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">
                                                    No digital prescriptions available. Please upload a prescription.
                                                </p>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3">
                                            <hr className="flex-1 border-gray-200" />
                                            <span className="text-sm text-gray-400">OR</span>
                                            <hr className="flex-1 border-gray-200" />
                                        </div>

                                        {/* Option 2: Upload Prescription */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Option 2: Upload a new prescription
                                            </p>

                                            {uploadedPrescription ? (
                                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FaCheckCircle className="text-green-500" />
                                                        <div>
                                                            <p className="font-medium text-green-800">{uploadedPrescription.name}</p>
                                                            <p className="text-sm text-green-600">
                                                                {(uploadedPrescription.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setUploadedPrescription(null);
                                                            if (prescriptionSource === 'upload') {
                                                                setPrescriptionSource('');
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${prescriptionSource === 'existing'
                                                    ? 'border-gray-200 bg-gray-50 opacity-60'
                                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                                    }`}>
                                                    <FaUpload className="text-2xl text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-600">Click to upload prescription</span>
                                                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                                                    <input
                                                        type="file"
                                                        onChange={handlePrescriptionUpload}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Clear Selection */}
                                        {(selectedPrescription || uploadedPrescription) && (
                                            <button
                                                onClick={clearPrescriptionSelection}
                                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                                            >
                                                Clear selection
                                            </button>
                                        )}
                                    </div>

                                    {/* Info Note */}
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note:</strong> Your prescription will be verified by our licensed pharmacist before your order is dispatched. This usually takes 1-2 hours during business hours.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Payment Method
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === method.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === method.id
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    <method.icon />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{method.name}</p>
                                                    <p className="text-xs text-gray-500">{method.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6">
                            {/* Order Items */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Order Items
                                </h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    {item.prescriptionRequired && (
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                            Rx
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-800">
                                                Rs. {item.price * item.quantity}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Address Summary */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Delivery Address</h2>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <FaMapMarkerAlt className="text-blue-500 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-800">{address.fullName}</p>
                                        <p className="text-gray-600 text-sm">{address.phone}</p>
                                        <p className="text-gray-600 text-sm">
                                            {address.street}, {address.city}, {address.province} - {address.zipCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Summary */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-gray-800">
                                    {paymentMethods.find(m => m.id === paymentMethod)?.name}
                                </p>
                            </div>

                            {/* Prescription Summary */}
                            {prescriptionRequired && getPrescriptionInfo() && (
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800">Prescription</h2>
                                        <button
                                            onClick={() => setStep(2)}
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaFilePrescription className="text-green-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">{getPrescriptionInfo().type}</p>
                                            <p className="text-sm text-gray-600">{getPrescriptionInfo().detail}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="btn-secondary px-6 py-3"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="btn-primary px-6 py-3 ml-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="btn-primary px-8 py-3 ml-auto"
                            >
                                {loading ? 'Placing Order...' : `Pay Rs. ${total} & Place Order`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

                        {/* Items */}
                        <div className="space-y-3 mb-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1">
                                        {item.name} × {item.quantity}
                                        {item.prescriptionRequired && (
                                            <FaPills className="text-orange-500" size={12} />
                                        )}
                                    </span>
                                    <span className="font-medium">Rs. {item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="my-4" />

                        {/* Totals */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">Rs. {subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery</span>
                                {deliveryFee === 0 ? (
                                    <span className="text-green-600 font-medium">FREE</span>
                                ) : (
                                    <span className="font-medium">Rs. {deliveryFee}</span>
                                )}
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Total</span>
                            <span className="text-xl font-bold text-blue-600">Rs. {total}</span>
                        </div>

                        {/* Prescription Note */}
                        {prescriptionRequired && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-orange-700 flex items-start gap-2">
                                    <FaFilePrescription className="mt-0.5 flex-shrink-0" />
                                    <span>This order contains prescription medicines and requires a valid prescription.</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
