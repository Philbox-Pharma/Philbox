import { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaSpinner, FaPlus, FaTimes } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ reportType: 'sales', startDate: '', endDate: '', format: 'pdf' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await adminApi.reports.getHistory();
      if (res.status === 200) setReports(res.data?.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.reports.generate(formData);
      setShowModal(false);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to generate');
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await adminApi.reports.download(id);
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaFileAlt className="text-indigo-600" /> Report Management
        </h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <FaPlus /> Generate Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600">Generated At</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800 capitalize">{r.reportType}</p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(r.created_at || r.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {r.status === 'completed' && (
                    <button onClick={() => handleDownload(r._id)} className="p-2 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
                      <FaDownload />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No reports generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generate Report</h2>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})}>
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="customers">Customers Report</option>
                  <option value="appointments">Appointments Report</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Generate</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
