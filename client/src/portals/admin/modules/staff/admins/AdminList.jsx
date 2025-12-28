// src/portals/admin/modules/staff/admins/AdminList.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaSearch,
    FaFilter,
    FaUserShield,
    FaEnvelope,
    FaCalendar,
    FaEye,
    FaEdit,
    FaDownload,
    FaCodeBranch,
    FaExclamationTriangle,
    FaCheckCircle,
    FaPhone
} from 'react-icons/fa';
import DataTable from '../../../../../shared/components/DataTable/DataTable';
import { staffApi } from '../../../../../core/api/admin/adminApi';

export default function AdminList() {
    const location = useLocation();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Clear success message
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

    // Fetch admins
    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        setUsingMockData(false);

        try {
            const filters = {};
            if (search) filters.search = search;
            if (statusFilter) filters.status = statusFilter;

            const response = await staffApi.getAdmins(page, limit, filters);

            if (response.status === 200 || response.data) {
                setAdmins(response.data?.admins || []);
                setPagination(response.data?.pagination || null);
            } else {
                throw new Error(response.message || 'Failed to fetch admins');
            }
        } catch (err) {
            console.error('Failed to fetch admins:', err);
            setError(err.message || 'Failed to load admins');
            setUsingMockData(true);

            // Mock data matching backend response structure
            setAdmins([
                {
                    _id: '1',
                    name: 'Ahmed Khan',
                    email: 'ahmed@philbox.com',
                    phone_number: '+92-300-1234567',
                    category: 'super-admin',
                    status: 'active',
                    branches_managed: [],
                    created_at: '2025-01-01'
                },
                {
                    _id: '2',
                    name: 'Sara Ali',
                    email: 'sara@philbox.com',
                    phone_number: '+92-300-2345678',
                    category: 'branch-admin',
                    status: 'active',
                    branches_managed: [
                        { _id: 'b1', name: 'Lahore Branch', code: 'PHIL25#001' }
                    ],
                    created_at: '2025-01-05'
                },
                {
                    _id: '3',
                    name: 'Usman Malik',
                    email: 'usman@philbox.com',
                    phone_number: '+92-300-3456789',
                    category: 'branch-admin',
                    status: 'suspended',
                    branches_managed: [
                        { _id: 'b2', name: 'Karachi Branch', code: 'PHIL25#002' },
                        { _id: 'b3', name: 'Islamabad Branch', code: 'PHIL25#003' }
                    ],
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

    // Helper: Get admin name (handles different field names)
    const getAdminName = (admin) => {
        return admin.name || admin.fullName || 'Unknown';
    };

    // Helper: Get admin category (handles different field names)
    const getAdminCategory = (admin) => {
        return admin.category || admin.admin_category || 'branch-admin';
    };

    // Helper: Get admin status (handles different field names)
    const getAdminStatus = (admin) => {
        return admin.status || admin.account_status || 'active';
    };

    // Helper: Check if super admin
    const isSuperAdmin = (admin) => {
        const category = getAdminCategory(admin);
        return category === 'super-admin' || category === 'super_admin';
    };

    // Get role badge styles
    const getRoleBadge = (admin) => {
        return isSuperAdmin(admin)
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700';
    };

    // Get status badge styles
    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-yellow-100 text-yellow-700',
            blocked: 'bg-red-100 text-red-700',
            inactive: 'bg-gray-100 text-gray-600'
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    // Get avatar styles
    const getAvatarStyles = (admin) => {
        return isSuperAdmin(admin)
            ? { bg: 'bg-purple-100', text: 'text-purple-600' }
            : { bg: 'bg-blue-100', text: 'text-blue-600' };
    };

    // Render branches
    const renderBranches = (admin) => {
    const branches = admin.branches_managed || admin.branches || [];

    if (isSuperAdmin(admin)) {
        return <span className="text-purple-600 font-medium text-sm">All Branches</span>;
    }

    if (!branches || branches.length === 0) {
        return <span className="text-gray-400 text-sm">Not Assigned</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {branches.slice(0, 2).map(branch => (
                <span key={branch._id || branch} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                    {branch.name || branch.code || 'Unknown'}
                </span>
            ))}
            {branches.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    +{branches.length - 2} more
                </span>
            )}
        </div>
    );
};

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Admin',
            sortable: true,
            render: (value, row) => {
                const avatar = getAvatarStyles(row);
                const name = getAdminName(row);
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatar.bg}`}>
                            <FaUserShield className={avatar.text} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{name}</p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'category',
            label: 'Role',
            render: (value, row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(row)}`}>
                    {isSuperAdmin(row) ? 'Super Admin' : 'Branch Admin'}
                </span>
            )
        },
        {
            key: 'branches_managed',
            label: 'Branch(es)',
            render: (value, row) => renderBranches(row)
        },
        {
            key: 'status',
            label: 'Status',
            render: (value, row) => {
                const status = getAdminStatus(row);
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(status)}`}>
                        {status}
                    </span>
                );
            }
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

    // Desktop Actions
    const renderActions = (row) => (
        <div className="flex items-center justify-end gap-1">
            <Link
                to={`/admin/staff/admins/${row._id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
            >
                <FaEye />
            </Link>
            <Link
                to={`/admin/staff/admins/${row._id}/edit`}
                className="p-2 text-[#d69e2e] hover:bg-yellow-50 rounded-lg transition-colors"
                title="Edit"
            >
                <FaEdit />
            </Link>
        </div>
    );

    // Mobile Card Render
    const mobileCardRender = (row) => {
        const avatar = getAvatarStyles(row);
        const name = getAdminName(row);
        const status = getAdminStatus(row);

        return (
            <div className="p-4">
                {/* Header: Avatar + Name + Status */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${avatar.bg}`}>
                            <FaUserShield className={`text-xl ${avatar.text}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{name}</h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(row)}`}>
                                {isSuperAdmin(row) ? 'Super Admin' : 'Branch Admin'}
                            </span>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(status)}`}>
                        {status}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="space-y-2 text-sm">
                    {/* Email */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaEnvelope className="text-gray-400 w-4 flex-shrink-0" />
                        <span className="truncate">{row.email}</span>
                    </div>

                    {/* Phone */}
                    {row.phone_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaPhone className="text-gray-400 w-4 flex-shrink-0" />
                            <span>{row.phone_number}</span>
                        </div>
                    )}

                    {/* Branches */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaCodeBranch className="text-gray-400 w-4 flex-shrink-0" />
                        {renderBranches(row)}
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendar className="text-gray-400 w-4 flex-shrink-0" />
                        <span>Joined {new Date(row.created_at).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Link
                        to={`/admin/staff/admins/${row._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        <FaEye className="text-xs" />
                        <span>View</span>
                    </Link>
                    <Link
                        to={`/admin/staff/admins/${row._id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#d69e2e] bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                    >
                        <FaEdit className="text-xs" />
                        <span>Edit</span>
                    </Link>
                </div>
            </div>
        );
    };

    // Calculate stats
    const superAdminCount = admins.filter(a => isSuperAdmin(a)).length;
    const branchAdminCount = admins.filter(a => !isSuperAdmin(a)).length;
    const activeCount = admins.filter(a => getAdminStatus(a) === 'active').length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admins</h1>
                    <p className="text-gray-600 mt-1">Manage all system administrators</p>
                </div>
                <Link
                    to="/admin/staff/admins/add"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
                >
                    <FaUserShield /> Add Admin
                </Link>
            </div>

            {/* Success Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2"
                >
                    <FaCheckCircle className="flex-shrink-0" />
                    {successMessage}
                </motion.div>
            )}

            {/* Error/Warning Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 flex items-center gap-2 ${usingMockData
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                >
                    <FaExclamationTriangle className="flex-shrink-0" />
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
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
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
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatsCard
                    icon={FaUserShield}
                    label="Super Admins"
                    value={superAdminCount}
                    color="purple"
                />
                <StatsCard
                    icon={FaUserShield}
                    label="Branch Admins"
                    value={branchAdminCount}
                    color="blue"
                />
                <StatsCard
                    icon={FaCheckCircle}
                    label="Active"
                    value={activeCount}
                    color="green"
                />
            </div>

            {/* Data Table with Mobile Cards */}
            <DataTable
                columns={columns}
                data={admins}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={renderActions}
                emptyMessage="No admins found."
                mobileCardRender={mobileCardRender}
            />
        </div>
    );
}

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' }
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4"
        >
            <div className="flex items-center gap-2 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`text-base sm:text-xl ${c.text}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm truncate">{label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </div>
        </motion.div>
    );
};
