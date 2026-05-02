import { useState, useEffect } from 'react';
import { FaTruck, FaPlus, FaSpinner, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function DeliveryFares() {
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ city: '', fare: '', minOrderAmount: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      const res = await adminApi.deliveryFares.getAll();
      if (res.status === 200) setFares(res.data?.deliveryFares || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ city: '', fare: '', minOrderAmount: '' });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (fare) => {
    setFormData({ city: fare.city, fare: fare.fare, minOrderAmount: fare.minOrderAmount || '' });
    setIsEditing(true);
    setEditId(fare._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminApi.deliveryFares.update(editId, formData);
      } else {
        await adminApi.deliveryFares.create(formData);
      }
      setShowModal(false);
      fetchFares();
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await adminApi.deliveryFares.delete(id);
      fetchFares();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-teal-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTruck className="text-teal-600" /> Delivery Fares
        </h1>
        <button onClick={handleOpenAdd} className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 hover:bg-teal-700">
          <FaPlus /> Add Fare
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">City / Region</th>
              <th className="p-4 font-semibold text-gray-600">Base Fare (PKR)</th>
              <th className="p-4 font-semibold text-gray-600">Free Delivery Min. Order</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fares.map(f => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-800">{f.city}</p>
                </td>
                <td className="p-4 font-semibold text-teal-700">
                  {f.fare}
                </td>
                <td className="p-4 text-gray-600">
                  {f.minOrderAmount ? `PKR ${f.minOrderAmount}` : 'None'}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenEdit(f)} className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><FaEdit /></button>
                  <button onClick={() => handleDelete(f._id)} className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"><FaTrash /></button>
                </td>
              </tr>
            ))}
            {fares.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No delivery fares configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Fare' : 'Add Fare'}</h2>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
                <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fare (PKR)</label>
                <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500" value={formData.fare} onChange={e => setFormData({...formData, fare: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Min. Order (PKR)</label>
                <input type="number" placeholder="Optional" className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">{isEditing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
