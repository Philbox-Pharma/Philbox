import { useState, useEffect } from 'react';
import { FaTags, FaPlus, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import adminApi from '../../../../core/api/admin/adminApi';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    cupon_code: '', 
    discount_type: 'percentage', 
    discount_value: '', 
    min_order_amount: '', 
    max_discount: '', 
    expiry_time: '',
    max_use_limit: '',
    for: 'all'
  });
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setFetchError('');
      const res = await adminApi.coupons.getAll();
      if (res.status === 200) setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
      setFetchError(err.message || 'Failed to fetch coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!/^[A-Z0-9]+$/.test(formData.cupon_code)) return "Code must be alphanumeric";
    if (Number(formData.discount_value) <= 0) return "Value must be greater than 0";
    if (formData.discount_type === 'percentage' && Number(formData.discount_value) > 100) return "Percentage cannot exceed 100";
    if (new Date(formData.expiry_time) <= new Date()) return "Expiry must be in the future";
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
      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        max_use_limit: formData.max_use_limit ? Number(formData.max_use_limit) : null
      };
      await adminApi.coupons.create(payload);
      setShowModal(false);
      setFormData({
        cupon_code: '', 
        discount_type: 'percentage', 
        discount_value: '', 
        min_order_amount: '', 
        max_discount: '', 
        expiry_time: '',
        max_use_limit: '',
        for: 'all'
      });
      fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.details 
        ? (Array.isArray(err.response.data.details) ? err.response.data.details.join(', ') : err.response.data.details)
        : (err.response?.data?.message || err.message || 'Failed to create');
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      setError('');
      setFetchError('');
      await adminApi.coupons.delete(id);
      fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.details 
        ? (Array.isArray(err.response.data.details) ? err.response.data.details.join(', ') : err.response.data.details)
        : (err.response?.data?.message || err.message || 'Failed to delete');
      setFetchError(msg);
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

      {(error || fetchError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <FaTimes /> <span>{error || fetchError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-gray-800 tracking-wider">{c.cupon_code}</h3>
              <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
            </div>
            <p className="text-purple-600 font-semibold mt-1">
              {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `PKR ${c.discount_value} OFF`}
            </p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>Min Order: PKR {c.min_order_amount || 0}</p>
              {c.max_discount && <p>Max Discount: PKR {c.max_discount}</p>}
              <p>Expires: {new Date(c.expiry_time).toLocaleDateString()}</p>
              <p>Usage: {c.times_used || 0} / {c.max_use_limit || 'Unlimited'}</p>
              <p className="text-xs text-gray-400">Valid for: <span className="capitalize">{c.for || 'All'}</span></p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${new Date(c.expiry_time) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {new Date(c.expiry_time) > new Date() ? 'Active' : 'Expired'}
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
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 uppercase" value={formData.cupon_code} onChange={e => setFormData({...formData, cupon_code: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (PKR)</label>
                  <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (PKR)</label>
                  <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input type="number" placeholder="Leave empty for unlim." className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.max_use_limit} onChange={e => setFormData({...formData, max_use_limit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.for} onChange={e => setFormData({...formData, for: e.target.value})}>
                    <option value="all">All</option>
                    <option value="medicine">Medicine</option>
                    <option value="appointments">Appointments</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500" value={formData.expiry_time} onChange={e => setFormData({...formData, expiry_time: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
