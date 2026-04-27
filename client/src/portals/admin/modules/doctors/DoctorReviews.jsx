// src/portals/admin/modules/doctors/DoctorReviews.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaStar,
  FaUserMd,
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import { doctorApi } from '../../../../core/api/admin/adminApi';

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <FaStar
          key={star}
          className={`text-sm ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

// Review Card
const ReviewCard = ({ review }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
        {review.patient_id?.fullName?.charAt(0) || 'P'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-800 truncate">
              {review.patient_id?.fullName || 'Anonymous Patient'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <StarRating rating={review.rating || 0} />
        </div>

        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.comment || 'No comment provided.'}
          </p>
        </div>

        {review.appointment_id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Related to appointment on{' '}
              {review.appointment_id.appointment_date
                ? new Date(
                    review.appointment_id.appointment_date
                  ).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Loading Skeleton
const ReviewSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function DoctorReviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [filters, setFilters] = useState({
    rating: '',
  });
  const limit = 12;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await doctorApi.getDoctorReviews(id, {
        page,
        limit,
        ...filters,
      });

      setReviews(response.data?.list || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalReviews(response.data?.total || 0);
      setAverageRating(response.data?.averageRating || 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [id, page, filters]);

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [fetchReviews]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ rating: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <Link
          to={`/admin/doctors/${id}`}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
        >
          <FaArrowLeft />
          Back to Doctor Details
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaStar />
          Doctor Reviews
        </h1>
        <p className="text-white/80 mt-1">
          View patient reviews and ratings for this doctor
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Rating Filter */}
          <select
            value={filters.rating}
            onChange={e => handleFilterChange('rating', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars & Above</option>
            <option value="3">3 Stars & Above</option>
            <option value="2">2 Stars & Above</option>
            <option value="1">1 Star & Above</option>
          </select>

          {/* Clear Filters */}
          {filters.rating && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalReviews}</p>
          <p className="text-sm text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <FaStar className="text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-600">
              {averageRating.toFixed(1)}
            </p>
          </div>
          <p className="text-sm text-gray-500">Average Rating</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.rating >= 4).length}
          </p>
          <p className="text-sm text-gray-500">Positive Reviews (4+ stars)</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => <ReviewSkeleton key={i} />)
          : reviews.length > 0
            ? reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))
            : !error && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
                  <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No reviews found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    This doctor has not received any reviews yet.
                  </p>
                </div>
              )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft />
          </button>

          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
