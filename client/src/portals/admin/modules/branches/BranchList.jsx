// src/portals/admin/modules/branches/BranchList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCodeBranch,
  FaDownload,
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import DataTable from '../../../../shared/components/DataTable/DataTable';
import ConfirmModal from '../../../../shared/components/Modal/ConfirmModal';
import { branchApi } from '../../../../core/api/admin/adminApi';

export default function BranchList() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );
  const [pagination, setPagination] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [deleteModal, setDeleteModal] = useState({ open: false, branch: null });
  const [toggleModal, setToggleModal] = useState({ open: false, branch: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch branches
  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;

      const response = await branchApi.getAll(page, limit, filters);
      if (response.success || response.status === 200) {
        setBranches(response.data?.branches || []);
        const pageData = response.data?.pagination;
        if (pageData) {
          setPagination({
            ...pageData,
            totalPages: pageData.pages || pageData.totalPages,
            hasNextPage:
              pageData.page < (pageData.pages || pageData.totalPages),
            hasPrevPage: pageData.page > 1,
          });
        }
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchBranches();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Toggle Status
  const handleToggleStatus = async () => {
    if (!toggleModal.branch) return;
    setActionLoading(true);
    try {
      const response = await branchApi.toggleStatus(toggleModal.branch._id);
      if (response.success || response.status === 200) {
        // Update local state instantly without refresh
        const newStatus =
          response.data?.status ||
          (toggleModal.branch.status === 'Active' ? 'Inactive' : 'Active');

        setBranches(prev =>
          prev.map(b =>
            b._id === toggleModal.branch._id ? { ...b, status: newStatus } : b
          )
        );

        setSuccessMessage(
          `Branch ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`
        );
        setToggleModal({ open: false, branch: null });
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Branch
  const handleDelete = async () => {
    if (!deleteModal.branch) return;
    setActionLoading(true);
    try {
      const response = await branchApi.delete(deleteModal.branch._id);
      if (response.success || response.status === 200) {
        setSuccessMessage('Branch deleted successfully!');
        setDeleteModal({ open: false, branch: null });
        fetchBranches(); // Refresh list after delete
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      label: 'Branch Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a365d]/10 flex items-center justify-center">
            <FaCodeBranch className="text-[#1a365d]" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value, row) => {
        // Priority: value -> row.phone -> row.contact_number
        const phoneVal = value || row.phone || row.contact_number;

        // Explicit check for empty string
        const displayPhone =
          phoneVal && phoneVal.trim() !== '' ? phoneVal : 'Not set';

        return (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone className="text-xs text-gray-400" />
            <span>{displayPhone}</span>
          </div>
        );
      },
    },
    {
      key: 'address',
      label: 'Location',
      render: (_, row) => {
        // Address can be populated object or ID string
        const addr =
          typeof row.address === 'object'
            ? row.address
            : typeof row.address_id === 'object'
              ? row.address_id
              : {};

        // Build full address string
        const parts = [addr.street, addr.town, addr.city, addr.province].filter(
          Boolean
        ); // Remove empty/null values

        const fullAddress =
          parts.length > 0 ? parts.join(', ') : 'Location not set';

        return (
          <div
            className="flex items-center gap-2 text-gray-600 max-w-xs"
            title={fullAddress}
          >
            <FaMapMarkerAlt className="text-xs text-gray-400 flex-shrink-0" />
            <span className="truncate">{fullAddress}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: value => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: value =>
        value ? new Date(value).toLocaleDateString('en-PK') : '-',
    },
  ];

  const renderActions = row => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={e => {
          e.stopPropagation();
          navigate(`/admin/branches/${row._id}`);
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        title="View"
      >
        <FaEye />
      </button>
      <button
        onClick={e => {
          e.stopPropagation();
          navigate(`/admin/branches/${row._id}/edit`);
        }}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
        title="Edit"
      >
        <FaEdit />
      </button>

      {/* Toggle Button Fix: Active shows green toggle (on), Inactive shows gray toggle (off) */}
      <button
        onClick={e => {
          e.stopPropagation();
          setToggleModal({ open: true, branch: row });
        }}
        className={`p-2 rounded-lg transition-colors ${
          row.status === 'Active'
            ? 'text-green-600 hover:bg-green-50'
            : 'text-gray-400 hover:bg-gray-100'
        }`}
        title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
      >
        {row.status === 'Active' ? (
          <FaToggleOn className="text-xl" />
        ) : (
          <FaToggleOff className="text-xl" />
        )}
      </button>

      <button
        onClick={e => {
          e.stopPropagation();
          setDeleteModal({ open: true, branch: row });
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Branch Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all pharmacy branches</p>
        </div>
        <Link
          to="/admin/branches/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors shadow-lg"
        >
          <FaPlus /> <span>Add Branch</span>
        </Link>
      </div>

      {/* Success Msg */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700"
        >
          <FaCheckCircle /> <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <FaDownload /> Export
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={branches}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        actions={renderActions}
        emptyMessage="No branches found."
        onRowClick={row => navigate(`/admin/branches/${row._id}`)}
      />

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, branch: null })}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={`Delete "${deleteModal.branch?.name}"?`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* Toggle Modal - Dynamic Text/Color */}
      <ConfirmModal
        isOpen={toggleModal.open}
        onClose={() => setToggleModal({ open: false, branch: null })}
        onConfirm={handleToggleStatus}
        title={
          toggleModal.branch?.status === 'Active'
            ? 'Deactivate Branch'
            : 'Activate Branch'
        }
        message={`Are you sure you want to ${toggleModal.branch?.status === 'Active' ? 'deactivate' : 'activate'} "${toggleModal.branch?.name}"?`}
        confirmText={
          toggleModal.branch?.status === 'Active' ? 'Deactivate' : 'Activate'
        }
        type={toggleModal.branch?.status === 'Active' ? 'warning' : 'success'}
        loading={actionLoading}
      />
    </div>
  );
}
