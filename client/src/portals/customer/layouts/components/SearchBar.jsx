import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHistory, FaTimes, FaTrash } from 'react-icons/fa';
import searchHistoryService from '../../../../core/api/customer/searchHistory.service';

export default function SearchBar({ isMobile = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await searchHistoryService.getHistory();
      setSearchHistory(response.data?.history || response.data || []);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    }
  };

  const handleSearch = async (e, queryOverride) => {
    if (e) e.preventDefault();
    const finalQuery = queryOverride || searchQuery;
    if (finalQuery.trim()) {
      try {
        await searchHistoryService.saveSearch(finalQuery);
        fetchHistory(); // refresh history quietly
      } catch (error) {
        console.error('Failed to save search history', error);
      }
      setShowDropdown(false);
      navigate(`/medicines?search=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleClearHistoryItem = async (e, id) => {
    e.stopPropagation();
    try {
      await searchHistoryService.deleteSearch(id);
      setSearchHistory(searchHistory.filter(item => item._id !== id));
    } catch (error) {
      console.error('Failed to delete search history item:', error);
    }
  };

  const handleClearAllHistory = async e => {
    e.stopPropagation();
    try {
      await searchHistoryService.clearAllHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return (
    <div
      className={`relative w-full ${isMobile ? '' : 'hidden md:flex flex-1 max-w-xl mx-8'}`}
      ref={dropdownRef}
    >
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search medicines, healthcare products..."
          className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-4 bg-blue-500 text-white rounded-r-full hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <FaSearch />
        </button>
      </form>

      {/* History Dropdown */}
      {showDropdown && searchHistory.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaHistory className="text-gray-400" />
              Recent Searches
            </span>
            <button
              onClick={handleClearAllHistory}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <FaTrash size={10} />
              Clear All
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {searchHistory.map(item => (
              <li
                key={item._id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors group"
                onClick={() => {
                  setSearchQuery(item.query);
                  handleSearch(null, item.query);
                }}
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <FaHistory className="text-gray-400 text-sm" />
                  <span className="text-sm">{item.query}</span>
                </div>
                <button
                  onClick={e => handleClearHistoryItem(e, item._id)}
                  className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from history"
                >
                  <FaTimes size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
