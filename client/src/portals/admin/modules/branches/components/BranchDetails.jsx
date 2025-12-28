// src/portals/admin/modules/branches/BranchDetails.jsx
import PerformanceStats from './components/PerformanceStats'; // Import karo

// ... inside component ...
const [performance, setPerformance] = useState(null);

// Fetch Performance alongside Branch Data
useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Branch Info
            const branchRes = await branchApi.getById(id);
            if (branchRes.success) setBranch(branchRes.data);

            // 2. Fetch Performance Metrics
            const perfRes = await branchApi.getPerformance(id);
            if (perfRes.success) setPerformance(perfRes.data);

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, [id]);

// ... render part ...

return (
    <div className="space-y-8">
        {/* Header & Cover Image... (Same as before) */}

        {/* Performance Section */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Branch Performance</h2>
            {performance ? (
                <PerformanceStats data={performance} />
            ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                    No performance data available
                </div>
            )}
        </div>

        {/* Details Grid (Address, Staff etc)... (Same as before) */}
    </div>
);
