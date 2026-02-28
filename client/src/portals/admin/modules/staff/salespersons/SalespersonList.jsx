/* eslint-disable react-hooks/exhaustive-deps */

// src/portals/admin/modules/staff/salespersons/SalespersonList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaUserTie,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaBan,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCodeBranch,
  FaCalendar,
  FaExclamationTriangle,
} from 'react-icons/fa';
import DataTable from '../../../../../shared/components/DataTable/DataTable';
import ConfirmModal from '../../../../../shared/components/Modal/ConfirmModal';
import { staffService } from '../../../../../core/api/admin/staff.service';

export default function SalespersonList() {
  const _navigate = useNavigate(); // Not currently used
  const location = useLocation();
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false); // NEW: Track mock data
  const [pagination, setPagination] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear location state
  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch salespersons
  const fetchSalespersons = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    try {
      const filters = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;

      const response = await staffService.getSalespersons(page, limit, filters);

      if (response.status === 200 || response.data) {
        setSalespersons(response.data?.salespersons || []);
        setPagination(response.data?.pagination || null);
      } else {
        throw new Error(response.message || 'Failed to fetch salespersons');
      }
    } catch (err) {
      console.error('Failed to fetch salespersons:', err);
      setError(err.message || 'Failed to load salespersons');
      setUsingMockData(true);

      // Mock data - Only used when API fails
      setSalespersons([
        {
          _id: '1',
          fullName: 'Ali Raza',
          email: 'ali.raza@philbox.com',
          contactNumber: '+92-300-1111111',
          gender: 'Male',
          status: 'active',
          branches_to_be_managed: [{ _id: '1', name: 'Lahore Branch' }],
          address: { city: 'Lahore', province: 'Punjab' },
          created_at: '2025-01-01',
        },
        {
          _id: '2',
          fullName: 'Fatima Khan',
          email: 'fatima.khan@philbox.com',
          contactNumber: '+92-300-2222222',
          gender: 'Female',
          status: 'active',
          branches_to_be_managed: [{ _id: '2', name: 'Karachi Branch' }],
          address: { city: 'Karachi', province: 'Sindh' },
          created_at: '2025-01-05',
        },
        {
          _id: '3',
          fullName: 'Hassan Ali',
          email: 'hassan.ali@philbox.com',
          contactNumber: '+92-300-3333333',
          gender: 'Male',
          status: 'suspended',
          branches_to_be_managed: [],
          address: { city: 'Islamabad', province: 'Islamabad' },
          created_at: '2025-01-10',
        },
      ]);
      setPagination({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalespersons();
  }, [page, statusFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchSalespersons();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Delete
  const handleDeleteClick = person => {
    setSelectedPerson(person);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPerson) return;

    setDeleteLoading(true);
    try {
      const response = await staffService.deleteSalesperson(selectedPerson._id);
      if (response.status === 200 || response.data) {
        setSuccessMessage('Salesperson deleted successfully!');
        fetchSalespersons();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete salesperson');
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
      setSelectedPerson(null);
    }
  };

  // Get status badge styles
  const getStatusBadge = status => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  // Table columns
  const columns = [
    {
      key: 'fullName',
      label: 'Salesperson',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <FaUserTie className="text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Phone',
      render: value => value || <span className="text-gray-400">Not set</span>,
    },
    {
      key: 'branches_to_be_managed',
      label: 'Branch',
      render: value => {
        if (!value || value.length === 0) {
          return <span className="text-gray-400">Unassigned</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map(branch => (
              <span
                key={branch._id}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {branch.name}
              </span>
            ))}
            {value.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{value.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'address',
      label: 'Location',
      render: value => {
        if (!value) return <span className="text-gray-400">-</span>;
        return (
          `${value.city || ''}, ${value.province || ''}`.replace(
            /^, |, $/g,
            ''
          ) || '-'
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: value => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(value)}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: value =>
        new Date(value).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ];

  // Desktop Actions
  const renderActions = row => (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/admin/staff/salespersons/${row._id}`}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <FaEye />
      </Link>
      <Link
        to={`/admin/staff/salespersons/${row._id}/edit`}
        className="p-2 text-[#d69e2e] hover:bg-yellow-50 rounded-lg transition-colors"
        title="Edit"
      >
        <FaEdit />
      </Link>
      <button
        onClick={() => handleDeleteClick(row)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );

  // Mobile Card Render
  const mobileCardRender = row => (
    <div className="p-4">
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <FaUserTie className="text-orange-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{row.fullName}</h3>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(row.status)}`}
            >
              {row.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-2 text-sm">
        {/* Email */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaEnvelope className="text-gray-400 w-4 shrink-0" />
          <span className="truncate">{row.email}</span>
        </div>

        {/* Phone */}
        {row.contactNumber && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone className="text-gray-400 w-4 shrink-0" />
            <span>{row.contactNumber}</span>
          </div>
        )}

        {/* Location */}
        {row.address && (row.address.city || row.address.province) && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 w-4 shrink-0" />
            <span>
              {`${row.address.city || ''}, ${row.address.province || ''}`.replace(
                /^, |, $/g,
                ''
              )}
            </span>
          </div>
        )}

        {/* Branch */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaCodeBranch className="text-gray-400 w-4 shrink-0" />
          {row.branches_to_be_managed &&
          row.branches_to_be_managed.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.branches_to_be_managed.slice(0, 2).map(branch => (
                <span
                  key={branch._id}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {branch.name}
                </span>
              ))}
              {row.branches_to_be_managed.length > 2 && (
                <span className="text-gray-500 text-xs">
                  +{row.branches_to_be_managed.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Joined Date */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaCalendar className="text-gray-400 w-4 shrink-0" />
          <span>
            Joined{' '}
            {new Date(row.created_at).toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link
          to={`/admin/staff/salespersons/${row._id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <FaEye className="text-xs" />
          <span>View</span>
        </Link>
        <Link
          to={`/admin/staff/salespersons/${row._id}/edit`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#d69e2e] bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
        >
          <FaEdit className="text-xs" />
          <span>Edit</span>
        </Link>
        <button
          onClick={e => {
            e.stopPropagation();
            handleDeleteClick(row);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <FaTrash className="text-xs" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Salespersons</h1>
          <p className="text-gray-600 mt-1">Manage all salesperson accounts</p>
        </div>
        <Link
          to="/admin/staff/salespersons/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
        >
          <FaPlus /> Add Salesperson
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2"
        >
          <FaCheckCircle />
          {successMessage}
        </motion.div>
      )}

      {/* Error/Warning Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 flex items-center gap-2 ${
            usingMockData
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <FaExclamationTriangle />
          <span>
            {error}
            {usingMockData && ' - Showing demo data'}
          </span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Export - Hidden on mobile */}
          <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FaDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={FaUserTie}
          label="Total"
          value={pagination?.total || salespersons.length}
          color="orange"
        />
        <StatsCard
          icon={FaCheckCircle}
          label="Active"
          value={salespersons.filter(s => s.status === 'active').length}
          color="green"
        />
        <StatsCard
          icon={FaBan}
          label="Suspended"
          value={salespersons.filter(s => s.status === 'suspended').length}
          color="yellow"
        />
        <StatsCard
          icon={FaBan}
          label="Blocked"
          value={salespersons.filter(s => s.status === 'blocked').length}
          color="red"
        />
      </div>

      {/* Data Table with Mobile Cards */}
      <DataTable
        columns={columns}
        data={salespersons}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        actions={renderActions}
        emptyMessage="No salespersons found."
        mobileCardRender={mobileCardRender}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedPerson(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Salesperson"
        message={`Are you sure you want to delete "${selectedPerson?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

// Stats Card Component

const StatsCard = ({ icon: IconComponent, label, value, color }) => {
  const colorMap = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };
  const c = colorMap[color] || colorMap.orange;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <IconComponent className={`text-lg sm:text-xl ${c.text}`} />
        </div>
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};
