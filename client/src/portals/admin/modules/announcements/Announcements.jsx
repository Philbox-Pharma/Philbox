import { useState, useEffect } from 'react';
import { FaBullhorn, FaPlus, FaSpinner, FaPaperPlane, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'info', target_audience: 'all' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await adminApi.announcements.getAll();
      if (res.status === 200) setAnnouncements(res.data?.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.announcements.create(formData);
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to create');
    }
  };

  const handleSend = async (id) => {
    try {
      await adminApi.announcements.send(id, {});
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to send');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await adminApi.announcements.delete(id);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBullhorn className="text-blue-600" /> Announcements
        </h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <FaPlus /> New Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map(a => (
          <div key={a._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${a.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {a.status}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.target_audience}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800">{a.title}</h3>
              <p className="text-gray-600 mt-1">{a.content}</p>
            </div>
            <div className="flex gap-2 items-start shrink-0">
              {a.status === 'draft' && (
                <button onClick={() => handleSend(a._id)} className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100"><FaPaperPlane /></button>
              )}
              <button onClick={() => handleDelete(a._id)} className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"><FaTrash /></button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-gray-500 text-center py-10">No announcements found.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Announcement</h2>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea required rows="4" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})}>
                  <option value="all">All</option>
                  <option value="customers">Customers</option>
                  <option value="doctors">Doctors</option>
                  <option value="salespersons">Salespersons</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
