import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
} from 'react-icons/fa';
import catalogService from '../../../../core/api/customer/catalog.service';
import cartService from '../../../../core/api/customer/cart.service';

export default function Medicines() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    prescriptionRequired: '',
    sortBy: 'name',
  });

  // Data states
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMedicines: 0,
    itemsPerPage: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [cartSuccessId, setCartSuccessId] = useState(null);

  // Filter options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getBrands(),
        ]);
        setCategoryOptions(catRes.data?.data?.categories || catRes.data?.data || []);
        setBrandOptions(brandRes.data?.data?.brands || brandRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch medicines when filters/search/page change
  const fetchMedicines = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      let response;

      if (searchQuery) {
        // Use search endpoint
        response = await catalogService.searchMedicines(searchQuery, {
          category: filters.category || undefined,
          brand: filters.brand || undefined,
          prescriptionStatus: filters.prescriptionRequired || undefined,
          sortBy: filters.sortBy || undefined,
          page,
          limit: 20,
        });
      } else {
        // Use browse endpoint
        response = await catalogService.browseMedicines({
          category: filters.category || undefined,
          brand: filters.brand || undefined,
          prescriptionStatus: filters.prescriptionRequired || undefined,
          sortBy: filters.sortBy || undefined,
          page,
          limit: 20,
        });
      }

      const data = response.data?.data || {};
      setMedicines(data.medicines || []);
      setPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalMedicines: 0,
        itemsPerPage: 20,
      });
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      setMedicines([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchMedicines(1);
  }, [fetchMedicines]);

  // Sync internal search state with URL search param
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      prescriptionRequired: '',
      sortBy: 'name',
    });
    setSearch('');
    setSearchParams({});
  };

  // Add to cart via API
  const handleAddToCart = async (medicine) => {
    setCartLoadingId(medicine._id);
    try {
      await cartService.addToCart(medicine._id, 1);
      setCartSuccessId(medicine._id);
      setTimeout(() => setCartSuccessId(null), 2000);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const msg = error.response?.data?.message || 'Failed to add to cart';
      alert(msg);
    } finally {
      setCartLoadingId(null);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMedicines(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to get display name
  const getMedicineName = (med) => med.Name || med.alias_name || 'Unnamed Medicine';
  const getMedicineGeneric = (med) => med.alias_name || med.mgs || '';
  const getMedicineBrand = (med) => {
    if (typeof med.manufacturer === 'object' && med.manufacturer?.name) return med.manufacturer.name;
    return '';
  };
  const getMedicineImage = (med) => {
    if (med.img_urls && med.img_urls.length > 0) return med.img_urls[0];
    return 'https://via.placeholder.com/200x200?text=Medicine';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Browse Medicines
        </h1>
        <p className="text-gray-500 mt-1">
          Find and order medicines from our wide collection
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines by name or generic..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price_low_to_high">Price: Low to High</option>
            <option value="price_high_to_low">Price: High to Low</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaFilter />
            <span>Filters</span>
            <FaChevronDown
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((cat, i) => (
                    <option key={i} value={typeof cat === 'string' ? cat : cat.name || cat}>
                      {typeof cat === 'string' ? cat : cat.name || cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Brands</option>
                  {brandOptions.map((brand, i) => (
                    <option key={i} value={typeof brand === 'string' ? brand : brand.name || brand}>
                      {typeof brand === 'string' ? brand : brand.name || brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prescription Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Required
                </label>
                <select
                  value={filters.prescriptionRequired}
                  onChange={(e) => handleFilterChange('prescriptionRequired', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All</option>
                  <option value="prescription_required">Yes</option>
                  <option value="OTC">No (OTC)</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <FaTimes />
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing{' '}
          <span className="font-semibold">{medicines.length}</span> of{' '}
          <span className="font-semibold">{pagination.totalMedicines}</span>{' '}
          medicines
          {searchQuery && (
            <span>
              {' '}for "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : medicines.length > 0 ? (
        <>
          {/* Medicines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Medicine Image */}
                <Link to={`/medicines/${medicine._id}`}>
                  <div className="relative">
                    <img
                      src={getMedicineImage(medicine)}
                      alt={getMedicineName(medicine)}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Medicine';
                      }}
                    />
                    {/* Prescription Badge */}
                    {medicine.prescription_required && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Rx Required
                      </span>
                    )}
                    {/* Out of Stock Overlay */}
                    {!medicine.is_available && !medicine.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Medicine Info */}
                <div className="p-4">
                  <Link to={`/medicines/${medicine._id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                      {getMedicineName(medicine)}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {getMedicineGeneric(medicine)}
                  </p>
                  {getMedicineBrand(medicine) && (
                    <p className="text-xs text-gray-400 mt-1">{getMedicineBrand(medicine)}</p>
                  )}

                  {/* Dosage & Form */}
                  {(medicine.dosage_form || medicine.mgs) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {medicine.dosage_form && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {medicine.dosage_form}
                        </span>
                      )}
                      {medicine.mgs && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {medicine.mgs}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        Rs. {medicine.sale_price || medicine.unit_price || 0}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(medicine)}
                      disabled={cartLoadingId === medicine._id}
                      className={`p-2 rounded-lg transition-all ${
                        cartSuccessId === medicine._id
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } ${cartLoadingId === medicine._id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {cartSuccessId === medicine._id ? (
                        <FaCheckCircle />
                      ) : cartLoadingId === medicine._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaShoppingCart />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft size={12} />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No medicines found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
