import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBoxes,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaTimes,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPills,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { salespersonInventoryApi } from '../../../../core/api/salesperson/inventory.service';
import { branchApi } from '../../../../core/api/admin/adminApi';
import { useAuth } from '../../../../shared/context/AuthContext';

// ==========================================
// ADD/EDIT MEDICINE MODAL
// ==========================================
function MedicineModal({ isOpen, onClose, onSave, medicine, branchId, availableBranches = [], branchMap = {}, branchesLoading = false }) {
  const [form, setForm] = useState({
    Name: '',
    alias_name: '',
    medicine_category: '',
    sale_price: '',
    purchase_price: '',
    pack_unit: '',
    quantity: '',
    packQty: '',
    stockValue: '',
    branch_id: branchId || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (medicine) {
      setForm({
        Name: medicine.Name || medicine.name || '',
        alias_name: medicine.alias_name || '',
        medicine_category: medicine.medicine_category || medicine.category || '',
        sale_price: medicine.sale_price !== undefined ? medicine.sale_price : (medicine.unit_price || medicine.price || ''),
        purchase_price: medicine.purchase_price || '',
        pack_unit: medicine.pack_unit || '',
        quantity: medicine.stock?.quantity !== undefined ? medicine.stock.quantity : (medicine.quantity || ''),
        packQty: medicine.stock?.packQty !== undefined ? medicine.stock.packQty : (medicine.packQty || ''),
        stockValue: medicine.stock?.stockValue !== undefined ? medicine.stock.stockValue : (medicine.stockValue || ''),
        branch_id: medicine.branch_id?._id || medicine.branch_id || branchId || '',
      });
    } else {
      setForm({
        Name: '',
        alias_name: '',
        medicine_category: '',
        sale_price: '',
        purchase_price: '',
        pack_unit: '',
        quantity: '',
        packQty: '',
        stockValue: '',
        branch_id: branchId || '',
      });
    }
  }, [medicine, branchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Convert numeric fields from string to proper numbers
    const payload = {
      ...form,
      sale_price: form.sale_price !== '' ? Number(form.sale_price) : undefined,
      purchase_price: form.purchase_price !== '' ? Number(form.purchase_price) : undefined,
      pack_unit: form.pack_unit !== '' ? Number(form.pack_unit) : undefined,
      quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
      packQty: form.packQty !== '' ? Number(form.packQty) : undefined,
      stockValue: form.stockValue !== '' ? Number(form.stockValue) : undefined,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      // Ensure we display detailed validation errors from backend's 'error' field
      const data = err.response?.data;
      let errorMsg = data?.message || err.message || 'Failed to save medicine';
      
      if (data?.error) {
        if (Array.isArray(data.error)) {
          errorMsg += ':\n• ' + data.error.join('\n• ');
        } else {
          errorMsg += ':\n' + data.error;
        }
      }
      
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaPills className="text-blue-500" />
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Branch *</label>
              {branchesLoading ? (
                <div className="flex items-center gap-2 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading branches...
                </div>
              ) : availableBranches.length > 0 ? (
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select Branch</option>
                  {availableBranches.map((b, idx) => {
                    const bId = b?._id || b;
                    const bName = b?.name || branchMap[bId] || `Branch ${idx + 1}`;
                    const bCode = b?.code;
                    const displayName = bCode ? `${bName} (${bCode})` : bName;
                    return <option key={bId} value={bId}>{displayName}</option>;
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste Branch ID..."
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Medicine Name *</label>
              <input
                type="text"
                value={form.Name}
                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Panadol"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Alias Name</label>
              <input
                type="text"
                value={form.alias_name}
                onChange={(e) => setForm({ ...form, alias_name: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Category</label>
              <input
                type="text"
                value={form.medicine_category}
                onChange={(e) => setForm({ ...form, medicine_category: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Analgesic"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Sale Price (PKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Purchase Price (PKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Quantity</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Pack Unit</label>
              <input
                type="number"
                min="0"
                value={form.pack_unit}
                onChange={(e) => setForm({ ...form, pack_unit: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Pack Qty</label>
              <input
                type="number"
                min="0"
                value={form.packQty}
                onChange={(e) => setForm({ ...form, packQty: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Stock Value</label>
              <input
                type="number"
                min="0"
                value={form.stockValue}
                onChange={(e) => setForm({ ...form, stockValue: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Saving...
                </>
              ) : (
                <>{medicine ? 'Update' : 'Add Medicine'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MEDICINE DETAIL MODAL
// ==========================================
function MedicineDetailModal({ isOpen, onClose, medicineId, branchId }) {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !medicineId) return;
    setLoading(true);
    salespersonInventoryApi.getMedicineDetails(medicineId, branchId)
      .then(res => {
        setMedicine(res.data || res);
      })
      .catch(err => {
        console.error('Failed to fetch medicine details:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, medicineId, branchId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaEye className="text-indigo-500" />
            Medicine Details
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
          ) : medicine ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800">{medicine.Name || medicine.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{medicine.alias_name || 'N/A'} • {medicine.form || 'Tablet'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{medicine.medicine_category || medicine.category?.name || (typeof medicine.category === 'string' ? medicine.category : null) || 'General'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Unit Price</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">Rs. {medicine.sale_price || medicine.price || '0'}</p>
                </div>
                <div className={`rounded-lg p-3 border ${(medicine.quantity || medicine.quantity_in_stock || 0) < (medicine.reorder_level || 10) ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Stock</p>
                  <p className={`text-lg font-black mt-1 ${(medicine.quantity || medicine.quantity_in_stock || 0) < (medicine.reorder_level || 10) ? 'text-red-600' : 'text-green-600'}`}>
                    {medicine.quantity || medicine.quantity_in_stock || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reorder Level</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{medicine.reorder_level || 10}</p>
                </div>
              </div>

              {medicine.description && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-700">{medicine.description}</p>
                </div>
              )}

              {medicine.requires_prescription && (
                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <FaExclamationTriangle size={12} />
                  Requires Prescription
                </div>
              )}

              {/* Audit Logs */}
              {medicine.auditLogs && medicine.auditLogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Audit Logs</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {medicine.auditLogs.map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-600">{log.action || log.type}</span>
                        <span className="text-gray-400">{new Date(log.created_at || log.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Medicine not found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN INVENTORY MANAGEMENT
// ==========================================
export default function InventoryManagement() {
  const { user } = useAuth();
  
  // Salespersons manage an array of branches
  const availableBranches = React.useMemo(() => {
    return user?.branches_to_be_managed || [];
  }, [user?.branches_to_be_managed]);

  const defaultBranchId = availableBranches.length > 0 
    ? (availableBranches[0]?._id || availableBranches[0]) 
    : (user?.branch_id?._id || user?.branch_id || '');

  const [currentBranchId] = useState(defaultBranchId);
  const [branchMap, setBranchMap] = useState({});
  const [apiBranches, setApiBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  useEffect(() => {
    // Always fetch managed branches from backend — don't gate on user object
    const fetchBranchNames = async () => {
      setBranchesLoading(true);
      const map = {};

      // 1. Seed map from whatever is already in user object (may be empty)
      availableBranches.forEach(b => {
        if (b?._id && b?.name) map[b._id] = b.name;
      });

      // 2. Always call the backend — this is the authoritative source
      try {
        const response = await branchApi.getAll(1, 100, { status: 'Active' });
        const branches = response.data?.branches || [];
        if (Array.isArray(branches) && branches.length > 0) {
          setApiBranches(branches);
          branches.forEach(b => {
            if (b?._id && b?.name) {
              map[b._id] = b.name;
            }
          });
        } else if (availableBranches.length > 0) {
          // Fallback: use whatever the user object had
          setApiBranches(availableBranches);
        }
      } catch (err) {
        console.warn('Failed to fetch managed branches from backend.', err);
        // Fallback to user-object branches on error
        if (availableBranches.length > 0) {
          setApiBranches(availableBranches);
        }
      }

      // 3. Last resort: primary branch from user object
      if (user?.branch_id?._id && user.branch_id.name) {
        map[user.branch_id._id] = user.branch_id.name;
      }

      setBranchMap(map);
      setBranchesLoading(false);
    };

    fetchBranchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Run once on mount — intentionally avoid re-running when user object changes

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewingMedicineId, setViewingMedicineId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      
      if (currentBranchId) params.branch_id = currentBranchId;
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;

      const res = await salespersonInventoryApi.listInventory(params);
      
      // Handle the triple nesting: res(response body).data(success wrapper).data(actual payload)
      const payload = res.data?.data;
      const parsedMedicines = payload?.medicines || [];
      const pagination = payload?.pagination;
      
      const parsedTotalPages = pagination?.totalPages || pagination?.pages || 1;
      const parsedTotalCount = pagination?.total || 0;

      setMedicines(parsedMedicines);
      setTotalPages(parsedTotalPages);
      setTotalCount(parsedTotalCount);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(err.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryFilter, sortBy, sortOrder, currentBranchId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddMedicine = async (formData) => {
    // branch_id is now selected safely in the MedicineModal and emitted via formData
    await salespersonInventoryApi.createMedicine(formData);
    fetchInventory();
  };

  const handleEditMedicine = async (formData) => {
    if (!editingMedicine) return;
    const id = editingMedicine._id;
    await salespersonInventoryApi.updateMedicine(id, formData);
    setEditingMedicine(null);
    fetchInventory();
  };

  const handleDeleteMedicine = async (id) => {
    try {
      await salespersonInventoryApi.softDeleteMedicine(id, currentBranchId);
      setDeleteConfirm(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <FaSortAmountUp size={10} className="text-blue-500" /> : <FaSortAmountDown size={10} className="text-blue-500" />;
  };

  return (
    <div className="space-y-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBoxes className="text-blue-500" />
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage medicines and stock levels • {totalCount} total items
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <FaPlus size={12} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search all medicines overall..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" size={12} />
            <input
              type="text"
              className="w-36 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category..."
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && medicines.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th onClick={() => toggleSort('Name')} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none">
                    <span className="flex items-center gap-1">Medicine <SortIcon field="Name" /></span>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Form</th>
                  <th onClick={() => toggleSort('sale_price')} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none">
                    <span className="flex items-center gap-1">Price <SortIcon field="sale_price" /></span>
                  </th>
                  <th onClick={() => toggleSort('quantity')} className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none">
                    <span className="flex items-center justify-center gap-1">Stock <SortIcon field="quantity" /></span>
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => {
                  const stock = med.stock?.quantity || 0;
                  const isLow = med.isLowStock || false;
                  const isCritical = med.isCritical || false;

                  return (
                    <tr key={med._id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-100 text-red-600' : isLow ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            <FaPills size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{med.Name || med.name}</p>
                            <p className="text-xs text-gray-400">{med.alias_name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{med.medicine_category || med.category_name || med.category?.name || (typeof med.category === 'string' ? med.category : null) || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{med.pack_unit ? `${med.pack_unit} Pack (${med.packQty})` : 'Tablet'}</td>
                      <td className="px-5 py-3.5 text-gray-800 font-medium">Rs. {med.sale_price || med.price || '0'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-lg font-bold ${isCritical ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-green-600'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            <FaExclamationTriangle size={10} /> Critical
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <FaCheckCircle size={10} /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewingMedicineId(med._id)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View Details">
                            <FaEye size={14} />
                          </button>
                          <button onClick={() => setEditingMedicine(med)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <FaEdit size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(med)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <FaTrashAlt size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && medicines.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBoxes className="text-3xl text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Medicines Found</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            {searchQuery || categoryFilter
              ? 'No medicines match your filters. Try adjusting your search.'
              : 'Start by adding your first medicine to the inventory.'
            }
          </p>
          {!searchQuery && !categoryFilter && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
            >
              <FaPlus size={12} /> Add First Medicine
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <FaChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === pageNum
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Add Modal */}
      <MedicineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMedicine}
        medicine={null}
        branchId={currentBranchId}
        availableBranches={apiBranches.length > 0 ? apiBranches : availableBranches}
        branchMap={branchMap}
        branchesLoading={branchesLoading}
      />

      {/* Edit Modal */}
      <MedicineModal
        isOpen={!!editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSave={handleEditMedicine}
        medicine={editingMedicine}
        branchId={currentBranchId}
        availableBranches={apiBranches.length > 0 ? apiBranches : availableBranches}
        branchMap={branchMap}
        branchesLoading={branchesLoading}
      />

      {/* Detail Modal */}
      <MedicineDetailModal
        isOpen={!!viewingMedicineId}
        onClose={() => setViewingMedicineId(null)}
        medicineId={viewingMedicineId}
        branchId={currentBranchId}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrashAlt className="text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Medicine?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirm.Name || deleteConfirm.name}</span>? This action will mark it as unavailable.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={() => handleDeleteMedicine(deleteConfirm._id)} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
