import { useState, useEffect, useCallback } from 'react';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaFilter,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaSmile,
  FaMeh,
  FaFrown,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaComments,
  FaChartBar,
  FaSearch,
} from 'react-icons/fa';
import { doctorReviewsApi } from '../../../../core/api/doctor/reviews.service';

// ==========================================
// STAR RATING DISPLAY
// ==========================================
function StarRating({ rating, size = 16, showValue = false }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} size={size} className="text-yellow-400" />);
  }
  if (hasHalf) {
    stars.push(<FaStarHalfAlt key="half" size={size} className="text-yellow-400" />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} size={size} className="text-yellow-400" />);
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// ==========================================
// SENTIMENT BADGE
// ==========================================
function SentimentBadge({ sentiment }) {
  const config = {
    positive: {
      icon: FaSmile,
      label: 'Positive',
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    negative: {
      icon: FaFrown,
      label: 'Negative',
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    neutral: {
      icon: FaMeh,
      label: 'Neutral',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
    },
  };

  const c = config[sentiment] || config.neutral;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <Icon size={11} /> {c.label}
    </span>
  );
}

// ==========================================
// RATING DISTRIBUTION BAR
// ==========================================
function RatingDistribution({ distribution, totalReviews }) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 w-3">{star}</span>
            <FaStar size={11} className="text-yellow-400" />
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-7 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// SINGLE REVIEW CARD
// ==========================================
function ReviewCard({ review }) {
  const customer = review.customer_id || {};
  const date = new Date(review.created_at);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : <FaUser size={14} />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              {customer.fullName || 'Anonymous Patient'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <FaClock size={10} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <SentimentBadge sentiment={review.sentiment} />
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size={14} />
      </div>

      {/* Review Text */}
      <p className="text-sm text-gray-700 leading-relaxed">{review.message}</p>
    </div>
  );
}

// ==========================================
// RATING FILTER PILLS
// ==========================================
function RatingFilterPills({ selected, onChange }) {
  const options = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selected === opt.value
              ? 'bg-yellow-400 text-yellow-900 border-yellow-400 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
          }`}
        >
          {opt.value && <FaStar className="inline mr-1" size={10} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// MAIN PATIENT FEEDBACK PAGE
// ==========================================
export default function PatientFeedback() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filters
  const [ratingFilter, setRatingFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ==========================================
  // FETCH STATS
  // ==========================================
  const fetchStats = useCallback(async () => {
    try {
      const response = await doctorReviewsApi.getReviewStats();
      const data = response.data || {};
      setStats({
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        distribution: data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentimentBreakdown: data.sentimentBreakdown || { positive: 0, negative: 0, neutral: 0 },
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // If stats endpoint doesn't exist, we'll calculate from reviews
    }
  }, []);

  // ==========================================
  // FETCH REVIEWS
  // ==========================================
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        page,
        limit,
        ...(ratingFilter && { rating: ratingFilter }),
        ...(sentimentFilter && { sentiment: sentimentFilter }),
        ...(dateFrom && { start_date: dateFrom }),
        ...(dateTo && { end_date: dateTo }),
      };

      const response = await doctorReviewsApi.getReviews(filters);
      const data = response.data || {};

      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);

      // If stats endpoint failed, compute from all reviews
      if (stats.totalReviews === 0 && data.reviews?.length > 0) {
        const allReviews = data.reviews;
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const sent = { positive: 0, negative: 0, neutral: 0 };
        allReviews.forEach(r => {
          dist[r.rating] = (dist[r.rating] || 0) + 1;
          sent[r.sentiment] = (sent[r.sentiment] || 0) + 1;
        });
        setStats({
          averageRating: avg,
          totalReviews: data.totalCount || allReviews.length,
          distribution: dist,
          sentimentBreakdown: sent,
        });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter, sentimentFilter, dateFrom, dateTo, stats.totalReviews]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleRatingFilter = (val) => {
    setRatingFilter(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setRatingFilter('');
    setSentimentFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = ratingFilter || sentimentFilter || dateFrom || dateTo;
  const totalSentiment = stats.sentimentBreakdown.positive + stats.sentimentBreakdown.negative + stats.sentimentBreakdown.neutral;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaComments className="text-blue-500" />
                Patient Feedback
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">See what your patients are saying about your services</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary !w-auto px-4 flex items-center gap-1.5 text-sm ${showFilters ? '!bg-blue-50 !text-blue-600 !border-blue-200' : ''}`}
            >
              <FaFilter size={12} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Error */}
        {error && (
          <div className="alert-warning mb-6 flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ==========================================
            TOP SECTION: Stats Overview
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Average Rating Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall Rating</h3>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-5xl font-bold text-gray-800">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
              </span>
              <div className="text-left">
                <StarRating rating={stats.averageRating} size={18} />
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="pt-4 border-t border-gray-100">
              <RatingDistribution distribution={stats.distribution} totalReviews={stats.totalReviews} />
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <FaChartBar size={12} /> Sentiment Analysis
            </h3>
            <div className="space-y-4">
              {/* Positive */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm text-green-700">
                    <FaSmile size={14} /> Positive
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    {stats.sentimentBreakdown.positive}
                    {totalSentiment > 0 && (
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({Math.round((stats.sentimentBreakdown.positive / totalSentiment) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: totalSentiment > 0 ? `${(stats.sentimentBreakdown.positive / totalSentiment) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Neutral */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FaMeh size={14} /> Neutral
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    {stats.sentimentBreakdown.neutral}
                    {totalSentiment > 0 && (
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({Math.round((stats.sentimentBreakdown.neutral / totalSentiment) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full transition-all duration-700"
                    style={{ width: totalSentiment > 0 ? `${(stats.sentimentBreakdown.neutral / totalSentiment) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Negative */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm text-red-700">
                    <FaFrown size={14} /> Negative
                  </span>
                  <span className="text-sm font-semibold text-red-700">
                    {stats.sentimentBreakdown.negative}
                    {totalSentiment > 0 && (
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({Math.round((stats.sentimentBreakdown.negative / totalSentiment) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: totalSentiment > 0 ? `${(stats.sentimentBreakdown.negative / totalSentiment) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaStar className="text-yellow-500 text-lg" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalReviews}</p>
                <p className="text-xs text-gray-500">Total Reviews</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaSmile className="text-green-500 text-lg" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.sentimentBreakdown.positive}</p>
                <p className="text-xs text-gray-500">Happy Patients</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaComments className="text-blue-500 text-lg" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.distribution[5] || 0}
                </p>
                <p className="text-xs text-gray-500">5-Star Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            FILTER PANEL
        ========================================== */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 animate-fadeIn shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Date Range */}
              <div>
                <label className="input-label">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="input-field"
                />
              </div>

              {/* Sentiment */}
              <div>
                <label className="input-label">Sentiment</label>
                <select
                  value={sentimentFilter}
                  onChange={(e) => { setSentimentFilter(e.target.value); setPage(1); }}
                  className="input-field"
                >
                  <option value="">All Sentiments</option>
                  <option value="positive">😊 Positive</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="negative">😞 Negative</option>
                </select>
              </div>
            </div>

            {/* Rating Filter Pills */}
            <div className="pt-3 border-t border-gray-100">
              <label className="input-label mb-2">Filter by Rating</label>
              <RatingFilterPills selected={ratingFilter} onChange={handleRatingFilter} />
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary !w-auto px-4 text-sm flex items-center gap-1.5"
                >
                  <FaTimes size={12} /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            REVIEWS LIST
        ========================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaComments className="text-blue-400" size={16} />
              Patient Reviews
            </h2>
            {!loading && reviews.length > 0 && (
              <span className="text-sm text-gray-500">
                Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          )}

          {/* Reviews List */}
          {!loading && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaComments className="text-3xl text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Reviews Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {hasActiveFilters
                  ? 'No reviews match your current filters. Try adjusting your search criteria.'
                  : 'Patient reviews will appear here once they leave feedback after appointments.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary !w-auto px-5 mt-4 text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            PAGINATION
        ========================================== */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Read-only Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FaSearch size={10} /> Reviews are read-only. Patients leave feedback after consultations.
          </p>
        </div>
      </div>
    </div>
  );
}
