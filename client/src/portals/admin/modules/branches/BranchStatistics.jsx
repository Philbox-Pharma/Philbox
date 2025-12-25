// src/portals/admin/modules/branches/BranchStatistics.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaCodeBranch, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSpinner
} from 'react-icons/fa';
import { branchApi } from '../../../../core/api/admin/adminApi';

export default function BranchStatistics() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [branches, setBranches] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Hum getAll use karenge kyunke humein NEECHE LIST bhi dikhani hai
                // statistics/all endpoint sirf numbers deta hai, list nahi.
                const response = await branchApi.getAll(1, 1000); // Fetch all branches

                if (response.success || response.status === 200) {
                    const allBranches = response.data?.branches || [];
                    setBranches(allBranches);

                    setStats({
                        total: allBranches.length,
                        active: allBranches.filter(b => b.status === 'Active').length,
                        inactive: allBranches.filter(b => b.status === 'Inactive').length
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                setError('Failed to load branch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-3xl text-[#1a365d]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/branches" className="p-2 hover:bg-gray-100 rounded-lg"><FaArrowLeft /></Link>
                <h1 className="text-2xl font-bold text-gray-800">Branch Statistics</h1>
            </div>

            {error && <div className="bg-red-50 p-4 text-red-700 rounded-lg">{error}</div>}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={FaCodeBranch} label="Total Branches" value={stats.total} color="text-[#1a365d]" bg="bg-[#1a365d]/10" />
                <StatCard icon={FaCheckCircle} label="Active Branches" value={stats.active} color="text-green-600" bg="bg-green-100" />
                <StatCard icon={FaTimesCircle} label="Inactive Branches" value={stats.inactive} color="text-gray-500" bg="bg-gray-100" />
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BranchStatusList title="Active Branches" branches={branches.filter(b => b.status === 'Active')} icon={FaCheckCircle} color="green" />
                <BranchStatusList title="Inactive Branches" branches={branches.filter(b => b.status === 'Inactive')} icon={FaTimesCircle} color="gray" />
            </div>
        </div>
    );
}

// Sub-components for cleaner code
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`text-2xl ${color}`} />
        </div>
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
    </motion.div>
);

const BranchStatusList = ({ title, branches, icon: Icon, color }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Icon className={`text-${color}-600`} />
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full ml-auto">{branches.length}</span>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto space-y-3">
            {branches.length > 0 ? branches.map(b => (
                <Link key={b._id} to={`/admin/branches/${b._id}`} className={`flex justify-between p-3 rounded-lg border border-transparent hover:border-${color}-200 hover:bg-${color}-50 transition-all`}>
                    <div>
                        <p className="font-medium text-gray-800">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.code}</p>
                    </div>
                    <span className={`text-xs self-center px-2 py-1 rounded bg-${color}-100 text-${color}-700`}>{b.status}</span>
                </Link>
            )) : <p className="text-center text-gray-400 py-4">No branches found</p>}
        </div>
    </motion.div>
);
