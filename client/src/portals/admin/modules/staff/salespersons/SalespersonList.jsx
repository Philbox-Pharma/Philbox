// src/portals/admin/modules/staff/salespersons/SalespersonList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaPlus,
    FaSearch,
    FaFilter,
    FaUserTie,
    FaEye,
    FaEdit,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaDownload,
    FaPhone
} from 'react-icons/fa';
import DataTable from '../../../../../shared/components/DataTable/DataTable';
import ConfirmModal from '../../../../../shared/components/Modal/ConfirmModal';
import { staffApi, branchApi } from '../../../../../core/api/admin/adminApi';

export default function SalespersonList() {
    const navigate = useNavigate();

    const [salespersons, setSalespersons] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Modals
    const [deleteModal, setDeleteModal] = useState({ open: false, salesperson: null });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch salespersons
    const fetchSalespersons = async () => {
        setLoading(true);
        setError(null);

        try {
            const filters = {};
            if (search) filters.search = search;
            if (statusFilter) filters.status = statusFilter;
            if (branchFilter) filters.branch_id = branchFilter;

            const response = await staffApi.getSalespersons(page, limit, filters);
            setSalespersons(response.data?.salespersons || []);
            setPagination(response.data?.pagination || null);
        } catch (err) {
            console.error('Failed to fetch salespersons:', err);
            setError(err.message || 'Failed to load salespersons');

            // Mock data
            setSalespersons([
                {
                    _id: '1',
                    fullName: 'Ali Hassan',
                    email: 'ali@philbox.com',
                    contactNumber: '+92-300-1234567',
                    account_status: 'active',
                    is_Verified: true,
                    branch_id: { _id: '1', name: 'Lahore Branch' },
                    created_at: '2025-01-01'
                },
                {
                    _id: '2',
                    fullName: 'Fatima Khan',
                    email: 'fatima@philbox.com',
                    contactNumber: '+92-301-2345678',
                    account_status: 'active',
                    is_Verified: true,
                    branch_id: { _id: '2', name: 'Karachi Branch' },
                    created_at: '2025-01-05'
                },
                {
                    _id: '3',
                    fullName: 'Imran Ahmed',
                    email: 'imran@philbox.com',
                    contactNumber: '+92-302-3456789',
                    account_status: 'inactive',
                    is_Verified: false,
                    branch_id: { _id: '1', name: 'Lahore Branch' },
                    created_at: '2025-01-10'
                },
            ]);
            setPagination({ page: 1, limit: 10, total: 3, pages: 1, hasNextPage: false, hasPrevPage: false });
        } finally {
            setLoading(false);
        }
    };

    // Fetch branches for filter
    const fetchBranches = async () => {
        try {
            const response = await branchApi.getAll(1, 100);
            setBranches(response.data?.branches || []);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
            setBranches([
                { _id: '1', name: 'Lahore Branch' },
                { _id: '2', name: 'Karachi Branch' },
            ]);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchSalespersons();
    }, [page, statusFilter, branchFilter]);

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

    // Delete salesperson
    const handleDelete = async () => {
        if (!deleteModal.salesperson) return;

        setActionLoading(true);
        try {
            await staffApi.deleteSalesperson(deleteModal.salesperson._id);
            setDeleteModal({ open: false, salesperson: null });
            fetchSalespersons();
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.message || 'Failed to delete salesperson');
        } finally {
            setActionLoading(false);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'fullName',
            label: 'Salesperson',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d69e2e]/20 flex items-center justify-center">
                        <FaUserTie className="text-[#d69e2e]" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{value}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'contactNumber',
            label: 'Phone',
            render: (value) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-xs" />
                    {value || <span className="text-gray-400">Not set</span>}
                </div>
            )
        },
        {
            key: 'branch_id',
            label: 'Branch',
            render: (value) => (
                <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                    {value?.name || 'Unassigned'}
                </span>
            )
        },
        {
            key: 'account_status',
            label: 'Status',
            render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                    {value === 'active' ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        }
    ];

    // Actions
    const renderActions = (row) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => navigate(`/admin/staff/salespersons/${row._id}`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
            >
                <FaEye />
            </button>
            <button
                onClick={() => navigate(`/admin/staff/salespersons/${row._id}/edit`)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Edit"
            >
                <FaEdit />
            </button>
            <button
                onClick={() => setDeleteModal({ open: true, salesperson: row })}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <FaTrash />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Salespersons</h1>
                    <p className="text-gray-600 mt-1">Manage all salespersons</p>
                </div>
                <Link
                    to="/admin/staff/salespersons/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors shadow-lg"
                >
                    <FaPlus />
                    <span>Add Salesperson</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email or phone..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                        />
                    </div>

                    {/* Branch Filter */}
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                    >
                        <option value="">All Branches</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Export */}
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <FaDownload />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    {error} - Showing mock data
                </div>
            )}

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={salespersons}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={renderActions}
                emptyMessage="No salespersons found. Add your first salesperson!"
                onRowClick={(row) => navigate(`/admin/staff/salespersons/${row._id}`)}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, salesperson: null })}
                onConfirm={handleDelete}
                title="Delete Salesperson"
                message={`Are you sure you want to delete "${deleteModal.salesperson?.fullName}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
                loading={actionLoading}
            />
        </div>
    );
}
