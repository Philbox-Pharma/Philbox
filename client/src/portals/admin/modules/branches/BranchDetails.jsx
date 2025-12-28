// src/portals/admin/modules/branches/BranchDetails.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
    FaCodeBranch, FaPhone, FaMapMarkerAlt, FaGlobe, FaCalendar,
    FaSpinner, FaExternalLinkAlt, FaUserTie, FaUserShield,
    FaChartLine, FaCalendarAlt, FaSearch, FaMoneyBillWave,
    FaUsers, FaUndo, FaCreditCard
} from 'react-icons/fa';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import ConfirmModal from '../../../../shared/components/Modal/ConfirmModal';
import AssignAdminsModal from './components/AssignAdminsModal';
import { branchApi, revenueApi } from '../../../../core/api/admin/adminApi';

// Chart Colors
const COLORS = {
    primary: '#1a365d',
    secondary: '#d69e2e',
    green: '#38a169',
    blue: '#3182ce',
    purple: '#805ad5',
    red: '#e53e3e'
};

const PIE_COLORS = ['#1a365d', '#d69e2e', '#38a169', '#3182ce', '#805ad5'];

export default function BranchDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Revenue Analytics State
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [trends, setTrends] = useState([]);
    const [revenueSplit, setRevenueSplit] = useState(null);
    const [refundStats, setRefundStats] = useState(null);
    const [avgRevenue, setAvgRevenue] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Date Filters (Default: Last 30 days)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [period, setPeriod] = useState('daily');

    // Modals
    const [deleteModal, setDeleteModal] = useState(false);
    const [toggleModal, setToggleModal] = useState(false);
    const [assignAdminsModal, setAssignAdminsModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // 1. Initial Data Fetch
    useEffect(() => {
        fetchBranchData();
    }, [id]);

    const fetchBranchData = async () => {
        setLoading(true);
        try {
            const branchRes = await branchApi.getById(id);
            if (branchRes.success || branchRes.status === 200) {
                setBranch(branchRes.data);
                // Fetch revenue after branch loads
                await fetchRevenueData();
            } else {
                throw new Error(branchRes.message);
            }
        } catch (err) {
            console.error('Main fetch error:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Revenue Analytics for this Branch
    const fetchRevenueData = async () => {
        setRevenueLoading(true);
        try {
            const { startDate, endDate } = dateRange;

            // Fetch all revenue data in parallel with branchId filter
            const [trendsRes, splitRes, refundsRes, avgRes, paymentRes] = await Promise.all([
                revenueApi.getTrendsForBranch(id, startDate, endDate, period),
                revenueApi.getSplitForBranch(id, startDate, endDate),
                revenueApi.getRefundsForBranch(id, startDate, endDate),
                revenueApi.getAvgPerCustomerForBranch(id, startDate, endDate),
                revenueApi.getPaymentMethodsForBranch(id, startDate, endDate)
            ]);

            // Process Trends
            if (trendsRes.status === 200) {
                const formattedTrends = (trendsRes.data?.trends || []).map(t => ({
                    date: formatTrendDate(t._id, period),
                    total: t.totalRevenue || 0,
                    appointments: t.appointmentRevenue || 0,
                    orders: t.orderRevenue || 0
                }));
                setTrends(formattedTrends);
            }

            // Process Split
            if (splitRes.status === 200) {
                setRevenueSplit(splitRes.data);
            }

            // Process Refunds
            if (refundsRes.status === 200) {
                setRefundStats(refundsRes.data);
            }

            // Process Avg Revenue
            if (avgRes.status === 200) {
                setAvgRevenue(avgRes.data);
            }

            // Process Payment Methods
            if (paymentRes.status === 200) {
                const paymentData = paymentRes.data;
                const formatted = Object.keys(paymentData)
                    .filter(key => key !== 'total')
                    .map(key => ({
                        name: formatPaymentName(key),
                        value: paymentData[key].revenue || 0,
                        count: paymentData[key].count || 0
                    }));
                setPaymentMethods(formatted);
            }

        } catch (err) {
            console.error('Failed to fetch revenue data:', err);
        } finally {
            setRevenueLoading(false);
        }
    };

    // Helper: Format trend date based on period
    const formatTrendDate = (id, period) => {
        if (period === 'daily') {
            return `${id.day}/${id.month}`;
        } else if (period === 'weekly') {
            return `W${id.week}`;
        } else {
            return `${id.month}/${id.year}`;
        }
    };

    // Helper: Format payment method name
    const formatPaymentName = (key) => {
        const names = {
            'Stripe-Card': 'Card (Stripe)',
            'JazzCash-Wallet': 'JazzCash',
            'EasyPaisa-Wallet': 'EasyPaisa'
        };
        return names[key] || key;
    };

    // Delete Logic
    const handleDelete = async () => {
        setActionLoading(true);
        try {
            const response = await branchApi.delete(id);
            if (response.success || response.status === 200) {
                navigate('/admin/branches', { state: { message: 'Branch deleted successfully!' } });
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            alert(err.message || 'Failed to delete branch');
        } finally {
            setActionLoading(false);
            setDeleteModal(false);
        }
    };

    // Toggle Logic
    const handleToggleStatus = async () => {
        setActionLoading(true);
        try {
            const response = await branchApi.toggleStatus(id);
            if (response.success || response.status === 200) {
                setBranch(prev => ({
                    ...prev,
                    status: response.data?.status || (prev.status === 'Active' ? 'Inactive' : 'Active')
                }));
                setToggleModal(false);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            alert(err.message || 'Failed to toggle status');
        } finally {
            setActionLoading(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <FaSpinner className="animate-spin text-3xl text-[#1a365d]" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-12 text-red-600">{error}</div>;
    }

    const address = branch?.address || branch?.address_id || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/branches" className="p-2 hover:bg-gray-100 rounded-lg">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{branch?.name}</h1>
                        <p className="text-gray-600 mt-1">{branch?.code}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setToggleModal(true)}
                        className={`px-4 py-2 rounded-lg font-medium flex gap-2 ${
                            branch?.status === 'Active'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {branch?.status === 'Active' ? (
                            <><FaToggleOff /> Deactivate</>
                        ) : (
                            <><FaToggleOn /> Activate</>
                        )}
                    </button>
                    <button
                        onClick={() => setAssignAdminsModal(true)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex gap-2 hover:bg-purple-200"
                    >
                        <FaUserShield /> Assign Admins
                    </button>
                    <button
                        onClick={() => navigate(`/admin/branches/${id}/edit`)}
                        className="px-4 py-2 bg-[#d69e2e] text-white rounded-lg flex gap-2 hover:bg-[#b8860b]"
                    >
                        <FaEdit /> Edit
                    </button>
                    <button
                        onClick={() => setDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg flex gap-2 hover:bg-red-700"
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>

            {/* Cover Image */}
            <div className="h-48 md:h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-[#1a365d] to-[#2c5282] relative">
                {branch?.cover_img_url ? (
                    <img
                        src={branch.cover_img_url}
                        alt={branch.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90">
                        <FaCodeBranch className="text-6xl mb-2 opacity-20" />
                        <h2 className="text-3xl font-bold">{branch?.name}</h2>
                        <p className="opacity-70">{address.city}, {address.country}</p>
                    </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold uppercase shadow-sm">
                    <span className={branch?.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                        {branch?.status}
                    </span>
                </div>
            </div>

            {/* Details Grid (Main Info & Staff) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCodeBranch className="text-[#1a365d]" /> Details
                    </h3>
                    <div className="space-y-4">
                        <InfoRow icon={FaPhone} label="Phone" value={branch?.phone || branch?.contact_number || 'Not set'} />
                        <InfoRow
                            icon={FaMapMarkerAlt}
                            label="Address"
                            value={[address.street, address.town, address.city, address.province].filter(Boolean).join(', ') || 'Not set'}
                        />
                        <InfoRow icon={FaCalendar} label="Created At" value={new Date(branch?.created_at).toLocaleDateString()} />
                        {address.google_map_link && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                                    <FaGlobe />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Map</p>
                                    <a
                                        href={address.google_map_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View on Google Maps <FaExternalLinkAlt className="text-xs" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Admins Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FaUserShield className="text-[#1a365d]" /> Admins
                            </h3>
                            <button
                                onClick={() => setAssignAdminsModal(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Manage
                            </button>
                        </div>
                        {branch?.under_administration_of?.length > 0 ? (
                            <div className="space-y-3">
                                {branch.under_administration_of.map(admin => (
                                    <div key={admin._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <FaUserShield />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{admin.name || admin.fullName}</p>
                                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-2">No admins assigned</p>
                        )}
                    </div>

                    {/* Salespersons Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUserTie className="text-[#d69e2e]" /> Salespersons
                        </h3>
                        {branch?.salespersons_assigned?.length > 0 ? (
                            <div className="space-y-3">
                                {branch.salespersons_assigned.map(sp => (
                                    <div key={sp._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <FaUserTie />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{sp.fullName || sp.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{sp.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-2">No salespersons assigned</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= REVENUE ANALYTICS SECTION ================= */}
            <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-[#1a365d]" />
                        Branch Revenue Analytics
                    </h3>

                    {/* Date Range Filter */}
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="pl-8 pr-2 py-1.5 text-sm bg-transparent outline-none border-r border-gray-200"
                            />
                        </div>
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-2 py-1.5 text-sm bg-transparent outline-none"
                        />
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-2 py-1.5 text-sm border-l border-gray-200 outline-none bg-transparent"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <button
                            onClick={fetchRevenueData}
                            disabled={revenueLoading}
                            className="p-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2c5282] disabled:opacity-50"
                        >
                            {revenueLoading ? <FaSpinner className="animate-spin text-xs" /> : <FaSearch className="text-xs" />}
                        </button>
                    </div>
                </div>

                {revenueLoading ? (
                    <div className="flex justify-center p-12">
                        <FaSpinner className="animate-spin text-2xl text-[#1a365d]" />
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <KPICard
                                icon={FaMoneyBillWave}
                                label="Total Revenue"
                                value={`Rs. ${(revenueSplit?.total?.revenue || 0).toLocaleString()}`}
                                subValue={`${revenueSplit?.total?.count || 0} transactions`}
                                color="green"
                            />
                            <KPICard
                                icon={FaUsers}
                                label="Avg. Per Customer"
                                value={`Rs. ${Math.round(avgRevenue?.averageRevenue || 0).toLocaleString()}`}
                                subValue={`${avgRevenue?.totalCustomers || 0} customers`}
                                color="blue"
                            />
                            <KPICard
                                icon={FaUndo}
                                label="Total Refunds"
                                value={`Rs. ${(refundStats?.total?.amount || 0).toLocaleString()}`}
                                subValue={`${refundStats?.total?.count || 0} refunds`}
                                color="red"
                            />
                            <KPICard
                                icon={FaCreditCard}
                                label="Transactions"
                                value={revenueSplit?.total?.count || 0}
                                subValue="All payments"
                                color="purple"
                            />
                        </div>

                        {/* Charts Row 1: Trends + Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Revenue Trends - Line Chart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
                                {trends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={trends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                                            <Legend />
                                            <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="appointments" name="Appointments" stroke={COLORS.green} strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="orders" name="Orders" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="No trend data available" />
                                )}
                            </div>

                            {/* Revenue Split - Pie Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Split</h3>
                                {revenueSplit?.appointment || revenueSplit?.order ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Appointments', value: revenueSplit?.appointment?.revenue || 0 },
                                                    { name: 'Orders', value: revenueSplit?.order?.revenue || 0 }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill={COLORS.primary} />
                                                <Cell fill={COLORS.secondary} />
                                            </Pie>
                                            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="No split data" />
                                )}
                                <div className="flex justify-center gap-6 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }}></div>
                                        <span className="text-sm text-gray-600">Appointments</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }}></div>
                                        <span className="text-sm text-gray-600">Orders</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row 2: Payment Methods + Refunds */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment Methods - Pie Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaCreditCard className="text-[#1a365d]" />
                                    Payment Methods
                                </h3>
                                {paymentMethods.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={paymentMethods}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {paymentMethods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="No payment data" />
                                )}
                                <div className="flex flex-wrap justify-center gap-4 mt-2">
                                    {paymentMethods.map((pm, i) => (
                                        <div key={pm.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                            <span className="text-sm text-gray-600">{pm.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Refund Stats - Bar Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaUndo className="text-red-500" />
                                    Refund Statistics
                                </h3>
                                {refundStats ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={[
                                            { name: 'Appointments', amount: refundStats?.appointment?.amount || 0, count: refundStats?.appointment?.count || 0 },
                                            { name: 'Orders', amount: refundStats?.order?.amount || 0, count: refundStats?.order?.count || 0 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(value, name) => name === 'amount' ? `Rs. ${value.toLocaleString()}` : value} />
                                            <Bar dataKey="amount" name="Refund Amount" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="No refund data" />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Branch"
                message={`Are you sure you want to delete "${branch?.name}"?`}
                confirmText="Delete"
                type="danger"
                loading={actionLoading}
            />
            <ConfirmModal
                isOpen={toggleModal}
                onClose={() => setToggleModal(false)}
                onConfirm={handleToggleStatus}
                title={branch?.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
                message={`Confirm status change for "${branch?.name}"?`}
                confirmText={branch?.status === 'Active' ? 'Deactivate' : 'Activate'}
                type="warning"
                loading={actionLoading}
            />
            <AssignAdminsModal
                isOpen={assignAdminsModal}
                onClose={() => setAssignAdminsModal(false)}
                branchId={id}
                branchName={branch?.name}
                currentAdmins={branch?.under_administration_of}
                onSuccess={() => {
                    setAssignAdminsModal(false);
                    fetchBranchData();
                }}
            />
        </div>
    );
}

// ============ SUB COMPONENTS ============

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0 text-[#1a365d]">
            <Icon />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

const KPICard = ({ icon: Icon, label, value, subValue, color }) => {
    const colorMap = {
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <Icon className={`text-lg ${c.text}`} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <h4 className="text-lg font-bold text-gray-800">{value}</h4>
                    {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
                </div>
            </div>
        </motion.div>
    );
};

const EmptyChart = ({ message }) => (
    <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        {message}
    </div>
);