import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../../core/api/admin/adminApi';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaStar,
  FaExclamation,
  FaCheckCircle,
  FaBan,
  FaCalendar,
  FaDollarSign,
  FaChartLine,
} from 'react-icons/fa';

const { customers: customerApi } = adminApi;

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: '',
  });

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomerById(id);
      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      alert('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async e => {
    e.preventDefault();
    try {
      const res = await customerApi.toggleCustomerStatus(id, statusForm);
      if (res.status === 200) {
        alert('Customer status updated successfully!');
        setShowStatusModal(false);
        fetchCustomerDetails();
      }
    } catch (error) {
      alert(error.message || 'Failed to update status');
    }
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: FaCheckCircle,
      },
      'suspended/freezed': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: FaExclamation,
      },
      'blocked/removed': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: FaBan,
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon /> {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Customer not found</div>
      </div>
    );
  }

  const { customer, orders, reviews, complaints, metrics, activityLogs } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Back to Customers
        </button>
        <button
          onClick={() => {
            setStatusForm({ status: customer.account_status, reason: '' });
            setShowStatusModal(true);
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Change Status
        </button>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
            {customer.fullName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {customer.fullName}
              </h1>
              {getStatusBadge(customer.account_status)}
              {customer.is_Verified && (
                <span className="text-green-600 flex items-center gap-1">
                  <FaCheckCircle /> Verified
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                {customer.email}
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-400" />
                {customer.contactNumber || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <FaCalendar className="text-gray-400" />
                Joined: {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>
            {customer.address_id && (
              <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <span>
                  {customer.address_id.street}, {customer.address_id.city},{' '}
                  {customer.address_id.state || customer.address_id.province}{' '}
                  {customer.address_id.zipCode || customer.address_id.zip_code}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.totalOrders || 0}
                </h3>
              </div>
              <FaShoppingCart className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Total Spent</p>
                <h3 className="text-3xl font-bold mt-1">
                  ${metrics.totalSpent?.toFixed(2) || 0}
                </h3>
              </div>
              <FaDollarSign className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Avg Rating</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.averageRating?.toFixed(1) || 0}
                </h3>
                <p className="text-yellow-100 text-xs mt-1">
                  {metrics.totalReviews} reviews
                </p>
              </div>
              <FaStar className="text-4xl text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100 text-sm">Complaints</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.totalComplaints || 0}
                </h3>
                <p className="text-red-100 text-xs mt-1">
                  {metrics.openComplaints} open
                </p>
              </div>
              <FaExclamation className="text-4xl text-red-200" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['overview', 'orders', 'reviews', 'complaints', 'activity'].map(
              tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 font-medium">
                    {customer.gender || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="ml-2 font-medium">
                    {customer.dateOfBirth
                      ? new Date(customer.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last Login:</span>
                  <span className="ml-2 font-medium">
                    {customer.last_login
                      ? new Date(customer.last_login).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Account Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order History</h3>
              {orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.slice(0, 10).map(order => (
                        <tr key={order._id}>
                          <td className="px-4 py-2 text-sm">
                            {order._id.slice(-8)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            ${order.total?.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm">{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No orders found</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Reviews</h3>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review._id} className="border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {review.review_text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews found</p>
              )}
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Complaints History</h3>
              {complaints && complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.slice(0, 5).map(complaint => (
                    <div key={complaint._id} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {complaint.subject}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            complaint.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {complaint.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No complaints found</p>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              {activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-2">
                  {activityLogs.slice(0, 10).map(log => (
                    <div
                      key={log._id}
                      className="flex items-start gap-3 border-b pb-2"
                    >
                      <FaChartLine className="text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {log.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No activity logs found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Change Customer Status</h2>
            <form onSubmit={handleStatusChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status *
                </label>
                <select
                  required
                  value={statusForm.status}
                  onChange={e =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="suspended/freezed">Suspended</option>
                  <option value="blocked/removed">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={statusForm.reason}
                  onChange={e =>
                    setStatusForm({ ...statusForm, reason: e.target.value })
                  }
                  rows={3}
                  placeholder="Reason for status change..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
