import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';
import catalogService from '../../../../core/api/customer/catalog.service';
import cartService from '../../../../core/api/customer/cart.service';

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [availability, setAvailability] = useState({ inStock: false });
  const [relatedMedicines, setRelatedMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review form states (MOCK - no backend reviews API)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  // Mock reviews (no backend reviews API)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'Ahmed K.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Very effective medicine. Works quickly and reliably!',
    },
    {
      id: 2,
      user: 'Sara M.',
      rating: 4,
      date: '2024-01-10',
      comment: 'Good quality product. Fast delivery by PhilBox.',
    },
    {
      id: 3,
      user: 'Ali R.',
      rating: 5,
      date: '2024-01-05',
      comment: 'Trusted brand. I always order from PhilBox for genuine medicines.',
    },
  ]);

  // Fetch medicine detail from API
  useEffect(() => {
    const fetchMedicine = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await catalogService.getMedicineDetail(id);
        const data = response.data?.data || {};
        setMedicine(data.medicine || null);
        setAvailability(data.availability || { inStock: false });

        // Also fetch related medicines
        try {
          const relatedRes = await catalogService.getRelatedMedicines(id);
          const relatedData = relatedRes.data?.data || {};
          setRelatedMedicines(relatedData.medicines || []);
        } catch {
          setRelatedMedicines([]);
        }
      } catch (err) {
        console.error('Failed to fetch medicine detail:', err);
        setError('Medicine not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  // Helpers
  const getName = () => medicine?.Name || medicine?.alias_name || 'Medicine';
  const getGeneric = () => medicine?.alias_name || medicine?.mgs || '';
  const getBrand = () => {
    if (typeof medicine?.manufacturer === 'object' && medicine?.manufacturer?.name) return medicine.manufacturer.name;
    return '';
  };
  const getImage = (index = 0) => {
    if (medicine?.img_urls && medicine.img_urls.length > index) return medicine.img_urls[index];
    return 'https://via.placeholder.com/400x400?text=Medicine';
  };
  const getPrice = () => medicine?.sale_price || medicine?.unit_price || 0;
  const getClassName = () => {
    if (typeof medicine?.class === 'object' && medicine?.class?.name) return medicine.class.name;
    return '';
  };

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Handle add to cart via API
  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      await cartService.addToCart(medicine._id, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2500);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    try {
      await cartService.addToCart(medicine._id, quantity);
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Handle review submit (MOCK - stored locally only)
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewRating === 0) { alert('Please select a rating'); return; }
    if (!reviewComment.trim()) { alert('Please write a comment'); return; }
    if (!reviewerName.trim()) { alert('Please enter your name'); return; }

    const newReview = {
      id: Date.now(),
      user: reviewerName,
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: reviewComment,
    };

    setReviews([newReview, ...reviews]);
    setReviewRating(0);
    setReviewComment('');
    setReviewerName('');
    setShowReviewForm(false);
    alert('Thank you for your review!');
  };

  // Render stars
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));

  // Interactive stars for review
  const renderInteractiveStars = () =>
    [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`cursor-pointer text-2xl transition-colors ${
          i < (hoverRating || reviewRating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setReviewRating(i + 1)}
      />
    ));

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error / not found state
  if (error || !medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">💊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Medicine Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The medicine you're looking for doesn't exist."}</p>
        <Link
          to="/medicines"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      {/* Back Button */}
      <Link
        to="/medicines"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
      >
        <FaChevronLeft />
        <span>Back to Medicines</span>
      </Link>

      {/* Main Product Section */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="relative">
              <img
                src={getImage(0)}
                alt={getName()}
                className="w-full h-80 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=Medicine';
                }}
              />
              {medicine.prescription_required && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">
                  Prescription Required
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {medicine.img_urls && medicine.img_urls.length > 1 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                {medicine.img_urls.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${getName()} ${index + 1}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 hover:border-blue-500 cursor-pointer"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Img';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {getName()}
                </h1>
                <p className="text-gray-500 mt-1">{getGeneric()}</p>
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

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {getBrand() && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {getBrand()}
                </span>
              )}
              {getClassName() && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {getClassName()}
                </span>
              )}
              {medicine.dosage_form && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {medicine.dosage_form}
                </span>
              )}
              {medicine.mgs && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {medicine.mgs}
                </span>
              )}
            </div>

            {/* Mock Rating */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex">{renderStars(4.5)}</div>
              <span className="text-gray-600">4.5</span>
              <span className="text-gray-400">({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  Rs. {getPrice()}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              {availability.inStock ? (
                <span className="text-green-600 font-medium">✓ In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                  >
                    <FaPlus className="text-gray-600" />
                  </button>
                </div>
                <span className="text-gray-500">
                  Total:{' '}
                  <span className="font-bold text-gray-800">
                    Rs. {getPrice() * quantity}
                  </span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
              <button
                onClick={handleAddToCart}
                disabled={!availability.inStock || cartLoading}
                className={`w-full flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  cartSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {cartSuccess ? (
                  <>
                    <FaCheckCircle />
                    Added!
                  </>
                ) : cartLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!availability.inStock}
                className="w-full flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t">
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
          {['description', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Product Description
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {medicine.description || 'No description available for this medicine.'}
              </p>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Product Details
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {getBrand() && (
                      <li>
                        <span className="font-medium">Brand:</span> {getBrand()}
                      </li>
                    )}
                    {getClassName() && (
                      <li>
                        <span className="font-medium">Class:</span> {getClassName()}
                      </li>
                    )}
                    {medicine.dosage_form && (
                      <li>
                        <span className="font-medium">Dosage Form:</span>{' '}
                        {medicine.dosage_form}
                      </li>
                    )}
                    {medicine.mgs && (
                      <li>
                        <span className="font-medium">Strength:</span>{' '}
                        {medicine.mgs}
                      </li>
                    )}
                    <li>
                      <span className="font-medium">Prescription:</span>{' '}
                      {medicine.prescription_required ? 'Required' : 'Not Required (OTC)'}
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    ⚠️ Important Information
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Do not exceed the stated dose</li>
                    <li>• Keep out of reach of children</li>
                    <li>• Store in a cool, dry place</li>
                    <li>• Consult doctor if pregnant or breastfeeding</li>
                    {medicine.prescription_required && (
                      <li>• This medicine requires a valid prescription</li>
                    )}
                  </ul>
                </div>
              </div>
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
                    <h4 className="text-lg font-semibold text-gray-800">
                      Write Your Review
                    </h4>
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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderInteractiveStars()}</div>
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
                    <div key={review.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-blue-600 font-medium">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{review.user}</p>
                            <div className="flex text-sm">{renderStars(review.rating)}</div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mt-2">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedMedicines.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedMedicines.map((med) => (
              <Link
                key={med._id}
                to={`/medicines/${med._id}`}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <img
                  src={
                    med.img_urls && med.img_urls.length > 0
                      ? med.img_urls[0]
                      : 'https://via.placeholder.com/200x200?text=Medicine'
                  }
                  alt={med.Name || 'Medicine'}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=Medicine';
                  }}
                />
                <h3 className="font-medium text-gray-800 line-clamp-1">{med.Name || med.alias_name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{med.alias_name || med.mgs || ''}</p>
                {med.dosage_form && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {med.dosage_form}
                  </span>
                )}
                <p className="text-blue-600 font-bold mt-2">
                  Rs. {med.sale_price || med.unit_price || 0}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
