import { useState, useEffect } from 'react';
import { FaUndo, FaSpinner, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Refunds() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await adminApi.refunds.getAllRequests();
      if (res.status === 200) setRequests(res.data?.refundRequests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, status) => {
    const note = prompt(`Enter notes for ${status === 'approved' ? 'Approval' : 'Rejection'}:`);
    if (note === null) return;
    try {
      await adminApi.refunds.processRequest(id, { action: status, adminNotes: note });
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to process');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-orange-600" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FaUndo className="text-orange-600" /> Customer Refund Requests
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">ID / Date</th>
              <th className="p-4 font-semibold text-gray-600">Customer</th>
              <th className="p-4 font-semibold text-gray-600">Order Ref</th>
              <th className="p-4 font-semibold text-gray-600">Amount</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800 text-sm">{r._id.substring(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(r.created_at || r.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">{r.customer_id?.fullName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{r.customer_id?.email}</p>
                </td>
                <td className="p-4 font-mono text-sm text-gray-600">{r.order_id?.orderNumber || 'N/A'}</td>
                <td className="p-4 font-semibold text-gray-800">PKR {r.refundAmount || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${r.status === 'approved' || r.status === 'processed' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleProcess(r._id, 'approved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded" title="Approve">
                        <FaCheck />
                      </button>
                      <button onClick={() => handleProcess(r._id, 'rejected')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded" title="Reject">
                        <FaTimes />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No refund requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
