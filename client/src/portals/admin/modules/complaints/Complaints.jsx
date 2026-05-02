import { useState, useEffect } from 'react';
import { FaExclamationCircle, FaSpinner, FaCheck, FaEye, FaTimes } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.complaints.getAll({ 
        status: statusFilter, 
        page, 
        limit: 10 
      });
      if (res.status === 200) {
        setComplaints(res.data?.complaints || []);
        setPagination(res.data?.pagination || { current_page: 1, total_pages: 1 });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setError('');
      const notes = status === 'resolved' ? 'Complaint resolved by admin' : 'Complaint marked as in progress';
      await adminApi.complaints.updateStatus(id, status, notes);
      fetchComplaints(pagination.current_page);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-red-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaExclamationCircle className="text-red-600" /> Complaints Management
        </h1>
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <FaExclamationCircle className="flex-shrink-0" /> {error}
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${c.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : c.priority === 'medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {c.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : c.status === 'in-progress' || c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {c.status !== 'resolved' && (
                    <button onClick={() => handleUpdateStatus(c._id, 'resolved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded" title="Mark Resolved">
                      <FaCheck />
                    </button>
                  )}
                  {(c.status === 'pending' || c.status === 'open') && (
                    <button onClick={() => handleUpdateStatus(c._id, 'in-progress')} className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded" title="Mark In Progress">
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

      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            disabled={pagination.current_page === 1}
            onClick={() => fetchComplaints(pagination.current_page - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <button 
            disabled={pagination.current_page === pagination.total_pages}
            onClick={() => fetchComplaints(pagination.current_page + 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
