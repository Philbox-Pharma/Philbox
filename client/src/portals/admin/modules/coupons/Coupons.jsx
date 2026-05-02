import { useState, useEffect } from 'react';
import { FaTags, FaPlus, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    discountType: 'percentage', 
    discountValue: '', 
    minOrderAmount: '', 
    maxDiscount: '', 
    expiryDate: '',
    usageLimit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await adminApi.coupons.getAll();
      if (res.status === 200) setCoupons(res.data?.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || null,
        usageLimit: Number(formData.usageLimit) || null
      };
      await adminApi.coupons.create(payload);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await adminApi.coupons.delete(id);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-purple-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTags className="text-purple-600" /> Coupon Management
        </h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700">
          <FaPlus /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-800 tracking-wider">{c.code}</h3>
              <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
            </div>
            <p className="text-purple-600 font-semibold mt-1">
              {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `PKR ${c.discountValue} OFF`}
            </p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>Min Order: PKR {c.minOrderAmount || 0}</p>
              {c.maxDiscount && <p>Max Discount: PKR {c.maxDiscount}</p>}
              <p>Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>
              <p>Usage: {c.usedCount || 0} / {c.usageLimit || 'Unlimited'}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${new Date(c.expiryDate) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {new Date(c.expiryDate) > new Date() ? 'Active' : 'Expired'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Coupon</h2>
              <button onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label>
                  <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                  <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input type="number" placeholder="Leave empty for unlim." className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
