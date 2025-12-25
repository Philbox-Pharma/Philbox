// src/portals/admin/modules/staff/admins/AdminList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaSearch,
    FaFilter,
    FaUserShield,
    FaEnvelope,
    FaCalendar,
    FaEye,
    FaDownload
} from 'react-icons/fa';
import DataTable from '../../../../../shared/components/DataTable/DataTable';
import { staffApi } from '../../../../../core/api/admin/adminApi';

export default function AdminList() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Fetch admins
    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);

        try {
            const filters = {};
            if (search) filters.search = search;
            if (statusFilter) filters.status = statusFilter;

            const response = await staffApi.getAdmins(page, limit, filters);
            setAdmins(response.data?.admins || []);
            setPagination(response.data?.pagination || null);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
            setError(err.message || 'Failed to load admins');

            // Mock data
            setAdmins([
                {
                    _id: '1',
                    fullName: 'Ahmed Khan',
                    email: 'ahmed@philbox.com',
                    admin_category: 'super_admin',
                    account_status: 'active',
                    is_Verified: true,
                    created_at: '2025-01-01'
                },
                {
                    _id: '2',
                    fullName: 'Sara Ali',
                    email: 'sara@philbox.com',
                    admin_category: 'branch_admin',
                    account_status: 'active',
                    is_Verified: true,
                    branch_name: 'Lahore Branch',
                    created_at: '2025-01-05'
                },
                {
                    _id: '3',
                    fullName: 'Usman Malik',
                    email: 'usman@philbox.com',
                    admin_category: 'branch_admin',
                    account_status: 'inactive',
                    is_Verified: true,
                    branch_name: 'Karachi Branch',
                    created_at: '2025-01-10'
                },
            ]);
            setPagination({ page: 1, limit: 10, total: 3, pages: 1, hasNextPage: false, hasPrevPage: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [page, statusFilter]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchAdmins();
            } else {
                setPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Table columns
    const columns = [
        {
            key: 'fullName',
            label: 'Admin',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        row.admin_category === 'super_admin'
                            ? 'bg-purple-100'
                            : 'bg-blue-100'
                    }`}>
                        <FaUserShield className={
                            row.admin_category === 'super_admin'
                                ? 'text-purple-600'
                                : 'text-blue-600'
                        } />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{value}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'admin_category',
            label: 'Role',
            render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value === 'super_admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {value === 'super_admin' ? 'Super Admin' : 'Branch Admin'}
                </span>
            )
        },
        {
            key: 'branch_name',
            label: 'Branch',
            render: (value) => value || <span className="text-gray-400">All Branches</span>
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
            <Link
                to={`/admin/staff/admins/${row._id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
            >
                <FaEye />
            </Link>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admins</h1>
                    <p className="text-gray-600 mt-1">View all system administrators</p>
                </div>
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
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FaUserShield className="text-xl text-purple-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Super Admins</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {admins.filter(a => a.admin_category === 'super_admin').length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FaUserShield className="text-xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Branch Admins</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {admins.filter(a => a.admin_category === 'branch_admin').length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <FaUserShield className="text-xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Active Admins</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {admins.filter(a => a.account_status === 'active').length}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={admins}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={renderActions}
                emptyMessage="No admins found."
            />
        </div>
    );
}
