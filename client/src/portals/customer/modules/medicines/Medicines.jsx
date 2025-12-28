import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaShoppingCart, FaTimes, FaChevronDown } from 'react-icons/fa';

export default function Medicines() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [search, setSearch] = useState(searchQuery);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        priceRange: '',
        prescriptionRequired: '',
    });

    // Mock data - baad mein API se aayega
    const categories = [
        'All Categories',
        'Pain Relief',
        'Antibiotics',
        'Vitamins',
        'Diabetes',
        'Heart Health',
        'Skin Care',
        'Digestive Health',
    ];

    const brands = ['All Brands', 'GSK', 'Pfizer', 'Abbott', 'Sanofi', 'Novartis'];

    const priceRanges = [
        { label: 'All Prices', value: '' },
        { label: 'Under Rs. 500', value: '0-500' },
        { label: 'Rs. 500 - Rs. 1000', value: '500-1000' },
        { label: 'Rs. 1000 - Rs. 2000', value: '1000-2000' },
        { label: 'Above Rs. 2000', value: '2000+' },
    ];

    const medicines = [
        {
            id: 1,
            name: 'Panadol Extra',
            generic: 'Paracetamol 500mg',
            brand: 'GSK',
            price: 150,
            originalPrice: 180,
            image: 'https://via.placeholder.com/200x200?text=Panadol',
            category: 'Pain Relief',
            prescriptionRequired: false,
            inStock: true,
            rating: 4.5,
            reviews: 128,
        },
        {
            id: 2,
            name: 'Augmentin 625mg',
            generic: 'Amoxicillin + Clavulanic Acid',
            brand: 'GSK',
            price: 850,
            originalPrice: 950,
            image: 'https://via.placeholder.com/200x200?text=Augmentin',
            category: 'Antibiotics',
            prescriptionRequired: true,
            inStock: true,
            rating: 4.8,
            reviews: 256,
        },
        {
            id: 3,
            name: 'Centrum Multivitamin',
            generic: 'Multivitamins & Minerals',
            brand: 'Pfizer',
            price: 1200,
            originalPrice: 1400,
            image: 'https://via.placeholder.com/200x200?text=Centrum',
            category: 'Vitamins',
            prescriptionRequired: false,
            inStock: true,
            rating: 4.6,
            reviews: 89,
        },
        {
            id: 4,
            name: 'Glucophage 500mg',
            generic: 'Metformin',
            brand: 'Sanofi',
            price: 320,
            originalPrice: 380,
            image: 'https://via.placeholder.com/200x200?text=Glucophage',
            category: 'Diabetes',
            prescriptionRequired: true,
            inStock: false,
            rating: 4.7,
            reviews: 312,
        },
        {
            id: 5,
            name: 'Lipitor 20mg',
            generic: 'Atorvastatin',
            brand: 'Pfizer',
            price: 650,
            originalPrice: 750,
            image: 'https://via.placeholder.com/200x200?text=Lipitor',
            category: 'Heart Health',
            prescriptionRequired: true,
            inStock: true,
            rating: 4.4,
            reviews: 178,
        },
        {
            id: 6,
            name: 'Voltral 50mg',
            generic: 'Diclofenac Sodium',
            brand: 'Novartis',
            price: 220,
            originalPrice: 280,
            image: 'https://via.placeholder.com/200x200?text=Voltral',
            category: 'Pain Relief',
            prescriptionRequired: false,
            inStock: true,
            rating: 4.3,
            reviews: 95,
        },
        {
            id: 7,
            name: 'Omeprazole 20mg',
            generic: 'Omeprazole',
            brand: 'Abbott',
            price: 180,
            originalPrice: 220,
            image: 'https://via.placeholder.com/200x200?text=Omeprazole',
            category: 'Digestive Health',
            prescriptionRequired: false,
            inStock: true,
            rating: 4.5,
            reviews: 203,
        },
        {
            id: 8,
            name: 'Dermazole Cream',
            generic: 'Ketoconazole 2%',
            brand: 'Abbott',
            price: 350,
            originalPrice: 400,
            image: 'https://via.placeholder.com/200x200?text=Dermazole',
            category: 'Skin Care',
            prescriptionRequired: false,
            inStock: true,
            rating: 4.2,
            reviews: 67,
        },
    ];

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
            [key]: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            priceRange: '',
            prescriptionRequired: '',
        });
        setSearch('');
        setSearchParams({});
    };

    // Add to cart
    const handleAddToCart = (medicine) => {
        // TODO: Implement cart functionality
        alert(`${medicine.name} added to cart!`);
    };

    // Filter medicines based on selected filters
    const filteredMedicines = medicines.filter(med => {
        if (filters.category && filters.category !== 'All Categories' && med.category !== filters.category) return false;
        if (filters.brand && filters.brand !== 'All Brands' && med.brand !== filters.brand) return false;
        if (filters.prescriptionRequired === 'yes' && !med.prescriptionRequired) return false;
        if (filters.prescriptionRequired === 'no' && med.prescriptionRequired) return false;
        if (searchQuery && !med.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !med.generic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

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

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <FaFilter />
                        <span>Filters</span>
                        <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
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
                                    {brands.map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
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
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
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
                    Showing <span className="font-semibold">{filteredMedicines.length}</span> medicines
                    {searchQuery && <span> for "<span className="font-semibold">{searchQuery}</span>"</span>}
                </p>
            </div>

            {/* Medicines Grid */}
            {filteredMedicines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMedicines.map((medicine) => (
                        <div
                            key={medicine.id}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Medicine Image */}
                            <Link to={`/medicines/${medicine.id}`}>
                                <div className="relative">
                                    <img
                                        src={medicine.image}
                                        alt={medicine.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    {/* Prescription Badge */}
                                    {medicine.prescriptionRequired && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                            Rx Required
                                        </span>
                                    )}
                                    {/* Discount Badge */}
                                    {medicine.originalPrice > medicine.price && (
                                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            {Math.round((1 - medicine.price / medicine.originalPrice) * 100)}% OFF
                                        </span>
                                    )}
                                    {/* Out of Stock Overlay */}
                                    {!medicine.inStock && (
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
                                <Link to={`/medicines/${medicine.id}`}>
                                    <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                        {medicine.name}
                                    </h3>
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">{medicine.generic}</p>
                                <p className="text-xs text-gray-400 mt-1">{medicine.brand}</p>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-sm text-gray-600">{medicine.rating}</span>
                                    <span className="text-xs text-gray-400">({medicine.reviews} reviews)</span>
                                </div>

                                {/* Price & Add to Cart */}
                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <span className="text-lg font-bold text-blue-600">
                                            Rs. {medicine.price}
                                        </span>
                                        {medicine.originalPrice > medicine.price && (
                                            <span className="text-sm text-gray-400 line-through ml-2">
                                                Rs. {medicine.originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(medicine)}
                                        disabled={!medicine.inStock}
                                        className={`p-2 rounded-lg transition-colors ${medicine.inStock
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <FaShoppingCart />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">💊</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No medicines found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <button
                        onClick={clearFilters}
                        className="btn-primary inline-block px-6 py-2"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
