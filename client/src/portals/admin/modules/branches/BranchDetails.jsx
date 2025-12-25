// src/portals/admin/modules/branches/BranchDetails.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
    FaCodeBranch, FaPhone, FaMapMarkerAlt, FaGlobe, FaCalendar,
    FaSpinner, FaExternalLinkAlt, FaUserTie, FaUserShield, FaPlus,
    FaChartLine, FaCalendarAlt, FaSearch // FaSearch and FaCalendarAlt added
} from 'react-icons/fa';
import ConfirmModal from '../../../../shared/components/Modal/ConfirmModal';
import AssignAdminsModal from './components/AssignAdminsModal';
import { branchApi } from '../../../../core/api/admin/adminApi';
import PerformanceStats from './components/PerformanceStats';
import PerformanceCharts from './components/PerformanceCharts';

export default function BranchDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    // Date Filters (Default: Last 30 days)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Modals
    const [deleteModal, setDeleteModal] = useState(false);
    const [toggleModal, setToggleModal] = useState(false);
    const [assignAdminsModal, setAssignAdminsModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // 1. Initial Data Fetch (Branch + Default Stats)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Branch Info
                const branchRes = await branchApi.getById(id);
                if (branchRes.success || branchRes.status === 200) {
                    setBranch(branchRes.data);
                } else {
                    throw new Error(branchRes.message);
                }

                // Fetch Performance (Initial)
                await fetchPerformanceStats();

            } catch (err) {
                console.error('Main fetch error:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // 2. Separate function to fetch stats based on Date Range
    const fetchPerformanceStats = async () => {
        try {
            // Pass Start and End Date to API
            const perfRes = await branchApi.getPerformance(id, dateRange.startDate, dateRange.endDate);
            console.log('Performance API Response:', perfRes);

            if (perfRes.success || perfRes.status === 200) {
                setPerformance(perfRes.data);
            }
        } catch (pErr) {
            console.warn('Performance stats fetch failed:', pErr);
        }
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
    if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-3xl text-[#1a365d]" /></div>;
    if (error) return <div className="text-center p-12 text-red-600">{error}</div>;

    const address = branch?.address || branch?.address_id || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/branches" className="p-2 hover:bg-gray-100 rounded-lg"><FaArrowLeft /></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{branch?.name}</h1>
                        <p className="text-gray-600 mt-1">{branch?.code}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setToggleModal(true)} className={`px-4 py-2 rounded-lg font-medium flex gap-2 ${branch?.status === 'Active' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {branch?.status === 'Active' ? <><FaToggleOff /> Deactivate</> : <><FaToggleOn /> Activate</>}
                    </button>
                    <button onClick={() => setAssignAdminsModal(true)} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex gap-2 hover:bg-purple-200"><FaUserShield /> Assign Admins</button>
                    <button onClick={() => navigate(`/admin/branches/${id}/edit`)} className="px-4 py-2 bg-[#d69e2e] text-white rounded-lg flex gap-2 hover:bg-[#b8860b]"><FaEdit /> Edit</button>
                    <button onClick={() => setDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg flex gap-2 hover:bg-red-700"><FaTrash /> Delete</button>
                </div>
            </div>

            {/* Cover Image */}
            <div className="h-48 md:h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-[#1a365d] to-[#2c5282] relative">
                {branch?.cover_img_url ? (
                    <img src={branch.cover_img_url} alt={branch.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90">
                        <FaCodeBranch className="text-6xl mb-2 opacity-20" />
                        <h2 className="text-3xl font-bold">{branch?.name}</h2>
                        <p className="opacity-70">{address.city}, {address.country}</p>
                    </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold uppercase shadow-sm">
                    <span className={branch?.status === 'Active' ? 'text-green-600' : 'text-red-600'}>{branch?.status}</span>
                </div>
            </div>

            {/* ================= PERFORMANCE SECTION ================= */}
            {performance && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">

                    {/* Header with Date Filter */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaChartLine className="text-[#1a365d]" />
                            Performance Analytics
                        </h3>

                        {/* Date Picker UI */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
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
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="pl-2 pr-2 py-1.5 text-sm bg-transparent outline-none"
                                />
                            </div>
                            <button
                                onClick={fetchPerformanceStats}
                                className="p-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2c5282] ml-1"
                                title="Filter Stats"
                            >
                                <FaSearch className="text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* 1. Stats Cards */}
                    <PerformanceStats data={performance} />

                    {/* 2. Charts (Graphs) */}
                    <PerformanceCharts period="daily" />

                </motion.div>
            )}
            {/* ======================================================= */}

            {/* Details Grid (Main Info & Staff) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaCodeBranch className="text-[#1a365d]" /> Details</h3>
                    <div className="space-y-4">
                        <InfoRow icon={FaPhone} label="Phone" value={branch?.phone || branch?.contact_number || 'Not set'} />
                        <InfoRow icon={FaMapMarkerAlt} label="Address" value={[address.street, address.town, address.city, address.province].filter(Boolean).join(', ') || 'Not set'} />
                        <InfoRow icon={FaCalendar} label="Created At" value={new Date(branch?.created_at).toLocaleDateString()} />
                        {address.google_map_link && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600"><FaGlobe /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Map</p>
                                    <a href={address.google_map_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">View on Google Maps <FaExternalLinkAlt className="text-xs" /></a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FaUserShield className="text-[#1a365d]" /> Admins</h3>
                            <button onClick={() => setAssignAdminsModal(true)} className="text-sm text-blue-600 hover:underline">Manage</button>
                        </div>
                        {branch?.under_administration_of?.length > 0 ? (
                            <div className="space-y-3">
                                {branch.under_administration_of.map(admin => (
                                    <div key={admin._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><FaUserShield /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{admin.name || admin.fullName}</p>
                                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400 text-sm text-center py-2">No admins assigned</p>}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaUserTie className="text-[#d69e2e]" /> Salespersons</h3>
                        {branch?.salespersons_assigned?.length > 0 ? (
                            <div className="space-y-3">
                                {branch.salespersons_assigned.map(sp => (
                                    <div key={sp._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><FaUserTie /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{sp.fullName || sp.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{sp.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400 text-sm text-center py-2">No salespersons assigned</p>}
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={handleDelete} title="Delete Branch" message={`Are you sure you want to delete "${branch?.name}"?`} confirmText="Delete" type="danger" loading={actionLoading} />
            <ConfirmModal isOpen={toggleModal} onClose={() => setToggleModal(false)} onConfirm={handleToggleStatus} title={branch?.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'} message={`Confirm status change for "${branch?.name}"?`} confirmText={branch?.status === 'Active' ? 'Deactivate' : 'Activate'} type="warning" loading={actionLoading} />
            <AssignAdminsModal isOpen={assignAdminsModal} onClose={() => setAssignAdminsModal(false)} branchId={id} branchName={branch?.name} currentAdmins={branch?.under_administration_of} onSuccess={() => { setAssignAdminsModal(false); fetchBranch(); }} />
        </div>
    );
}

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0 text-[#1a365d]"><Icon /></div>
        <div><p className="text-sm text-gray-500">{label}</p><p className="font-medium text-gray-800 break-words">{value}</p></div>
    </div>
);
