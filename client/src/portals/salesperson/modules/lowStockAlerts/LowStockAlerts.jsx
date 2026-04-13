import { useState, useEffect, useCallback } from 'react';
import {
  FaExclamationTriangle,
  FaCheck,
  FaCog,
  FaSearch,
  FaBuilding,
  FaBoxes,
  FaTimes,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { salespersonAlertsApi } from '../../../../core/api/salesperson/alerts.service';
import { useAuth } from '../../../../shared/context/AuthContext';

import { salespersonInventoryApi } from '../../../../core/api/salesperson/inventory.service';

// ==========================================
// LOW STOCK CARD
// ==========================================
function AlertCard({ alert, onResolve, onUpdateThreshold, branchMap = {} }) {
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [newThreshold, setNewThreshold] = useState(alert.threshold || 10);
  const [resolving, setResolving] = useState(false);

  const isCritical = alert.isCritical || alert.currentStock < 5;
  const isResolved = false; // Backend only returns active ones anyway

  const handleResolve = async () => {
    setResolving(true);
    await onResolve(alert.stockId);
    setResolving(false);
  };

  const handleSaveThreshold = async () => {
    await onUpdateThreshold(alert.medicineId, newThreshold);
    setEditingThreshold(false);
  };

  return (
    <div
      className={`relative bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        isResolved ? 'border-gray-200 opacity-60' : isCritical ? 'border-red-200' : 'border-orange-200'
      }`}
    >
      {/* Decorative accent */}
      {!isResolved && (
        <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-gradient-to-br -z-0 ${isCritical ? 'from-red-50 to-red-100' : 'from-orange-50 to-orange-100'}`}></div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
            isResolved ? 'bg-gray-100 border-gray-200 text-gray-400' : isCritical ? 'bg-red-100 border-red-200 text-red-600' : 'bg-orange-100 border-orange-200 text-orange-600'
          }`}>
            <FaExclamationTriangle size={18} className={!isResolved && isCritical ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
              {alert.medicineName || 'Unknown Medicine'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Available Unit • Managed Stock
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
          isResolved ? 'bg-gray-100 text-gray-600' : isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {isResolved ? 'Resolved' : isCritical ? 'Critical' : 'Low Stock'}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between mb-4 mt-2">
        <div className="text-center flex-1 border-r border-gray-200">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
          <p className={`text-2xl font-black ${isResolved ? 'text-gray-600' : isCritical ? 'text-red-600' : 'text-orange-600'}`}>
            {alert.currentStock}
          </p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Threshold</p>
          {editingThreshold ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="1"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-16 border border-blue-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button onClick={handleSaveThreshold} className="text-green-600 hover:text-green-700 p-1 bg-green-50 rounded hover:bg-green-100"><FaCheck size={12} /></button>
              <button onClick={() => setEditingThreshold(false)} className="text-red-500 hover:text-red-600 p-1 bg-red-50 rounded hover:bg-red-100"><FaTimes size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => !isResolved && setEditingThreshold(true)}>
              <p className="text-2xl font-bold text-gray-700">{alert.threshold || 10}</p>
              {!isResolved && <FaCog size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <FaBuilding /> Branch: <span className="font-semibold text-gray-600 truncate max-w-[100px]" title={alert.branchId}>{branchMap[alert.branchId] || alert.branchId || 'Main Branch'}</span>
        </p>
        
        {!isResolved ? (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-all shadow-sm border border-green-200 disabled:opacity-50"
          >
            <FaCheck size={12} /> {resolving ? 'Resolving...' : 'Mark Resolved'}
          </button>
        ) : (
          <p className="text-xs text-gray-400 italic">Resolved on {new Date(alert.updated_at).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function LowStockAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branchMap, setBranchMap] = useState({});

  // Discover Branch Names
  useEffect(() => {
    const discoverNames = async () => {
      const map = {};
      const branches = user?.branches_to_be_managed || [];
      branches.forEach(b => { if (b?._id && b?.name) map[b._id] = b.name; });

      try {
        const res = await salespersonInventoryApi.getManagedBranches();
        const apiBranches = res.data?.data?.branches || res.data?.branches || [];
        if (Array.isArray(apiBranches)) {
           apiBranches.forEach(b => {
             if (b?._id && b?.name) {
               map[b._id] = b.name;
             }
           });
        }
      } catch { /* silent fallback */ }
      setBranchMap(map);
    };
    if (user) discoverNames();
  }, [user]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page,
        limit,
      };

      const res = await salespersonAlertsApi.getLowStockAlerts(filters);
      const result = res.data?.data?.data;
      setAlerts(result?.alerts || []);
      
      const total = result?.pagination?.total || 0;
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolveAlert = async (stockId) => {
    try {
      await salespersonAlertsApi.resolveLowStockAlert(stockId);
      // Since only active alerts are shown, refresh the list after resolving
      setTimeout(fetchAlerts, 1000); 
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve alert');
    }
  };

  const handleUpdateThreshold = async (medicineId, threshold) => {
    try {
      await salespersonAlertsApi.updateThreshold(medicineId, Number(threshold));
      // Update locally
      setAlerts(prev => prev.map(a => a.medicineId === medicineId ? { ...a, threshold: threshold } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update threshold');
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery) return true;
    const name = a.medicine_id?.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxes className="text-orange-500" />
            Inventory Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage low stock and critical inventory alerts
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Search affected medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      {error && !loading && (
        <div className="alert-error mx-auto max-w-lg">{error}</div>
      )}

      {/* Grid */}
      {!loading && !error && filteredAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.stockId}
              alert={alert}
              onResolve={handleResolveAlert}
              onUpdateThreshold={handleUpdateThreshold}
              branchMap={branchMap}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAlerts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-3xl text-green-500" />
          </div>
           <h2 className="text-xl font-bold text-gray-800 mb-2">Inventory Looks Good!</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
             You have 0 active low stock alerts right now. We'll notify you when medicine stocks run low.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                page === pageNum
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
