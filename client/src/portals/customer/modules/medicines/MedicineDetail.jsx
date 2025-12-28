import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FaShoppingCart,
    FaHeart,
    FaRegHeart,
    FaMinus,
    FaPlus,
    FaStar,
    FaShieldAlt,
    FaTruck,
    FaUndo,
    FaChevronLeft,
    FaTimes
} from 'react-icons/fa';

export default function MedicineDetail() {
    const { id } = useParams();

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    // Review form states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewerName, setReviewerName] = useState('');

    // Reviews state (ab dynamic hai)
    const [reviews, setReviews] = useState([
        {
            id: 1,
            user: 'Ahmed K.',
            rating: 5,
            date: '2024-01-15',
            comment: 'Very effective for headaches. Works within 30 minutes!',
        },
        {
            id: 2,
            user: 'Sara M.',
            rating: 4,
            date: '2024-01-10',
            comment: 'Good medicine, but a bit pricey compared to generic alternatives.',
        },
        {
            id: 3,
            user: 'Ali R.',
            rating: 5,
            date: '2024-01-05',
            comment: 'My go-to medicine for fever and body pain. Highly recommended!',
        },
    ]);

    // Mock data - baad mein API se aayega based on id
    const medicine = {
        id: 1,
        name: 'Panadol Extra',
        generic: 'Paracetamol 500mg + Caffeine 65mg',
        brand: 'GSK (GlaxoSmithKline)',
        price: 150,
        originalPrice: 180,
        image: 'https://via.placeholder.com/400x400?text=Panadol',
        images: [
            'https://via.placeholder.com/400x400?text=Panadol+1',
            'https://via.placeholder.com/400x400?text=Panadol+2',
            'https://via.placeholder.com/400x400?text=Panadol+3',
        ],
        category: 'Pain Relief',
        prescriptionRequired: false,
        inStock: true,
        stockCount: 50,
        rating: 4.5,
        reviews: 128,
        dosageForm: 'Tablet',
        packSize: '24 Tablets',
        manufacturer: 'GlaxoSmithKline Pakistan',
        description: `Panadol Extra provides fast and effective relief from pain and fever. It contains Paracetamol 500mg combined with Caffeine 65mg, which enhances the pain-relieving effect of paracetamol.

    Suitable for headaches, migraines, toothache, period pain, cold and flu symptoms, and general aches and pains.`,
        usage: `Adults and children over 12 years: Take 1-2 tablets every 4-6 hours as needed.

    Do not take more than 8 tablets in 24 hours.
    Do not take with other paracetamol-containing products.`,
        sideEffects: `Common side effects may include:
    • Nausea
    • Allergic reactions (rare)

    If you experience any severe side effects, stop taking the medicine and consult your doctor immediately.`,
        warnings: `• Do not exceed the stated dose
    • Keep out of reach of children
    • Not suitable for children under 12 years
    • Consult doctor if pregnant or breastfeeding
    • Avoid if allergic to paracetamol or caffeine`,
    };

    const relatedMedicines = [
        {
            id: 2,
            name: 'Disprin',
            generic: 'Aspirin 300mg',
            price: 80,
            image: 'https://via.placeholder.com/200x200?text=Disprin',
            rating: 4.2,
        },
        {
            id: 3,
            name: 'Brufen 400mg',
            generic: 'Ibuprofen',
            price: 120,
            image: 'https://via.placeholder.com/200x200?text=Brufen',
            rating: 4.4,
        },
        {
            id: 4,
            name: 'Ponstan',
            generic: 'Mefenamic Acid',
            price: 180,
            image: 'https://via.placeholder.com/200x200?text=Ponstan',
            rating: 4.3,
        },
    ];

    // Handle quantity change
    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        if (quantity < medicine.stockCount) setQuantity(quantity + 1);
    };

    // Handle add to cart
    const handleAddToCart = () => {
        alert(`Added ${quantity} x ${medicine.name} to cart!`);
    };

    // Handle buy now
    const handleBuyNow = () => {
        alert(`Proceeding to checkout with ${quantity} x ${medicine.name}`);
    };

    // Handle review submit
    const handleSubmitReview = (e) => {
        e.preventDefault();

        if (reviewRating === 0) {
            alert('Please select a rating');
            return;
        }

        if (!reviewComment.trim()) {
            alert('Please write a comment');
            return;
        }

        if (!reviewerName.trim()) {
            alert('Please enter your name');
            return;
        }

        const newReview = {
            id: Date.now(),
            user: reviewerName,
            rating: reviewRating,
            date: new Date().toISOString().split('T')[0],
            comment: reviewComment,
        };

        setReviews([newReview, ...reviews]);

        // Reset form
        setReviewRating(0);
        setReviewComment('');
        setReviewerName('');
        setShowReviewForm(false);

        alert('Thank you for your review!');
    };

    // Render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    // Render interactive stars for review form
    const renderInteractiveStars = () => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`cursor-pointer text-2xl transition-colors ${i < (hoverRating || reviewRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                    }`}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setReviewRating(i + 1)}
            />
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link
                to="/medicines"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
            >
                <FaChevronLeft />
                <span>Back to Medicines</span>
            </Link>

            {/* Main Product Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div>
                        <div className="relative">
                            <img
                                src={medicine.image}
                                alt={medicine.name}
                                className="w-full h-80 object-cover rounded-lg"
                            />
                            {medicine.prescriptionRequired && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">
                                    Prescription Required
                                </span>
                            )}
                            {medicine.originalPrice > medicine.price && (
                                <span className="absolute top-4 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded">
                                    {Math.round((1 - medicine.price / medicine.originalPrice) * 100)}% OFF
                                </span>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex gap-3 mt-4">
                            {medicine.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${medicine.name} ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {medicine.name}
                                </h1>
                                <p className="text-gray-500 mt-1">{medicine.generic}</p>
                            </div>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="p-2 text-2xl"
                            >
                                {isFavorite ? (
                                    <FaHeart className="text-red-500" />
                                ) : (
                                    <FaRegHeart className="text-gray-400 hover:text-red-500" />
                                )}
                            </button>
                        </div>

                        {/* Brand & Category */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {medicine.brand}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                {medicine.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                {medicine.dosageForm}
                            </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex">{renderStars(medicine.rating)}</div>
                            <span className="text-gray-600">{medicine.rating}</span>
                            <span className="text-gray-400">({reviews.length} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="mt-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-blue-600">
                                    Rs. {medicine.price}
                                </span>
                                {medicine.originalPrice > medicine.price && (
                                    <span className="text-xl text-gray-400 line-through">
                                        Rs. {medicine.originalPrice}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Pack Size: {medicine.packSize}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="mt-4">
                            {medicine.inStock ? (
                                <span className="text-green-600 font-medium">
                                    ✓ In Stock ({medicine.stockCount} available)
                                </span>
                            ) : (
                                <span className="text-red-600 font-medium">
                                    ✗ Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={decreaseQuantity}
                                        className="p-3 hover:bg-gray-100 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <FaMinus className="text-gray-600" />
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={increaseQuantity}
                                        className="p-3 hover:bg-gray-100 transition-colors"
                                        disabled={quantity >= medicine.stockCount}
                                    >
                                        <FaPlus className="text-gray-600" />
                                    </button>
                                </div>
                                <span className="text-gray-500">
                                    Total: <span className="font-bold text-gray-800">Rs. {medicine.price * quantity}</span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleAddToCart}
                                disabled={!medicine.inStock}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <FaShoppingCart />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={!medicine.inStock}
                                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
                            <div className="flex flex-col items-center text-center">
                                <FaShieldAlt className="text-2xl text-blue-500 mb-2" />
                                <span className="text-xs text-gray-600">100% Genuine</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <FaTruck className="text-2xl text-blue-500 mb-2" />
                                <span className="text-xs text-gray-600">Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <FaUndo className="text-2xl text-blue-500 mb-2" />
                                <span className="text-xs text-gray-600">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-xl shadow-sm border mb-8">
                {/* Tab Headers */}
                <div className="flex border-b overflow-x-auto">
                    {['description', 'usage', 'side-effects', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'description' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h3>
                            <p className="text-gray-600 whitespace-pre-line">{medicine.description}</p>

                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-2">Product Details</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li><span className="font-medium">Brand:</span> {medicine.brand}</li>
                                        <li><span className="font-medium">Manufacturer:</span> {medicine.manufacturer}</li>
                                        <li><span className="font-medium">Dosage Form:</span> {medicine.dosageForm}</li>
                                        <li><span className="font-medium">Pack Size:</span> {medicine.packSize}</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-2">⚠️ Warnings</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{medicine.warnings}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usage' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Use</h3>
                            <p className="text-gray-600 whitespace-pre-line">{medicine.usage}</p>
                        </div>
                    )}

                    {activeTab === 'side-effects' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Side Effects</h3>
                            <p className="text-gray-600 whitespace-pre-line">{medicine.sideEffects}</p>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Customer Reviews ({reviews.length})
                                </h3>
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                >
                                    Write a Review
                                </button>
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">Write Your Review</h4>
                                        <button
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewRating(0);
                                                setReviewComment('');
                                                setReviewerName('');
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitReview}>
                                        {/* Name Input */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={reviewerName}
                                                onChange={(e) => setReviewerName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Rating
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {renderInteractiveStars()}
                                                </div>
                                                {reviewRating > 0 && (
                                                    <span className="text-gray-600 ml-2">
                                                        {reviewRating === 1 && 'Poor'}
                                                        {reviewRating === 2 && 'Fair'}
                                                        {reviewRating === 3 && 'Good'}
                                                        {reviewRating === 4 && 'Very Good'}
                                                        {reviewRating === 5 && 'Excellent'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comment */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Review
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Share your experience with this medicine..."
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                Submit Review
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowReviewForm(false);
                                                    setReviewRating(0);
                                                    setReviewComment('');
                                                    setReviewerName('');
                                                }}
                                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No reviews yet. Be the first to review this product!</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {review.user.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{review.user}</p>
                                                        <div className="flex text-sm">{renderStars(review.rating)}</div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-400">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600 mt-2">{review.comment}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Related Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {relatedMedicines.map((med) => (
                        <Link
                            key={med.id}
                            to={`/medicines/${med.id}`}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <img
                                src={med.image}
                                alt={med.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <h3 className="font-medium text-gray-800">{med.name}</h3>
                            <p className="text-sm text-gray-500">{med.generic}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <FaStar className="text-yellow-400" />
                                <span className="text-sm text-gray-600">{med.rating}</span>
                            </div>
                            <p className="text-blue-600 font-bold mt-2">Rs. {med.price}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
