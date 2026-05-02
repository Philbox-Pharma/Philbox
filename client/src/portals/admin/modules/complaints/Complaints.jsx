import { useState, useEffect } from 'react';
import { FaExclamationCircle, FaSpinner, FaCheck, FaEye, FaTimes } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await adminApi.complaints.getAll();
      if (res.status === 200) setComplaints(res.data?.list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.complaints.updateStatus(id, status, 'Status updated via admin panel');
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-red-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaExclamationCircle className="text-red-600" /> Complaints Management
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">ID / Date</th>
              <th className="p-4 font-semibold text-gray-600">Customer</th>
              <th className="p-4 font-semibold text-gray-600">Subject</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {complaints.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800 text-sm">{c.complaintNumber || c._id.substring(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at || c.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">{c.customer_id?.fullName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{c.customer_id?.email}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-800">{c.subject}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{c.description}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {c.status !== 'resolved' && (
                    <button onClick={() => handleUpdateStatus(c._id, 'resolved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded" title="Mark Resolved">
                      <FaCheck />
                    </button>
                  )}
                  {c.status === 'open' && (
                    <button onClick={() => handleUpdateStatus(c._id, 'in_progress')} className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded" title="Mark In Progress">
                      <FaEye />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No complaints found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
