import { useState, useEffect } from 'react';
import { FaBullhorn, FaPlus, FaSpinner, FaPaperPlane, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    message: '', 
    type: 'info', 
    target_audience: 'all',
    delivery_methods: ['in-app'],
    scheduled_at: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await adminApi.announcements.getAll();
      if (res.status === 200) setAnnouncements(res.data?.data || res.data?.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (formData.title.length < 5) return "Title must be at least 5 characters";
    if (formData.message.length < 10) return "Message must be at least 10 characters";
    if (formData.delivery_methods.length === 0) return "Select at least one delivery method";
    if (!formData.scheduled_at) return "Scheduled date is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await adminApi.announcements.create(formData);
      setShowModal(false);
      setFormData({
        title: '', 
        message: '', 
        type: 'info', 
        target_audience: 'all',
        delivery_methods: ['in-app'],
        scheduled_at: new Date().toISOString().split('T')[0]
      });
      fetchAnnouncements();
    } catch (err) {
      const msg = err.response?.data?.details 
        ? (Array.isArray(err.response.data.details) ? err.response.data.details.join(', ') : err.response.data.details)
        : (err.response?.data?.message || err.message || 'Failed to create');
      setError(msg);
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('Send this announcement now?')) return;
    try {
      setError('');
      await adminApi.announcements.send(id, {});
      fetchAnnouncements();
    } catch (err) {
      const msg = err.response?.data?.details 
        ? (Array.isArray(err.response.data.details) ? err.response.data.details.join(', ') : err.response.data.details)
        : (err.response?.data?.message || err.message || 'Failed to send');
      setError(msg);
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
              <p className="text-gray-600 mt-1 whitespace-pre-wrap">{a.message || a.content}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(a.delivery_methods || []).map(m => (
                  <span key={m} className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{m}</span>
                ))}
              </div>
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

            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required minLength={3} type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea required minLength={10} rows="4" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Announcement content"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})}>
                    <option value="all">All</option>
                    <option value="customers">Customers</option>
                    <option value="doctors">Doctors</option>
                    <option value="salespersons">Salespersons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Methods</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {['email', 'in-app', 'sms', 'push'].map(method => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.delivery_methods.includes(method)}
                        onChange={(e) => {
                          const methods = e.target.checked 
                            ? [...formData.delivery_methods, method]
                            : formData.delivery_methods.filter(m => m !== method);
                          setFormData({...formData, delivery_methods: methods});
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">Create Announcement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
