/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../../core/api/admin/adminApi';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaBan,
  FaShoppingCart,
  FaStar,
  FaExclamationTriangle,
} from 'react-icons/fa';

const { customers: customerApi, branches: branchApi } = adminApi;

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [branches, setBranches] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    account_status: '',
    is_Verified: '',
    branchId: '',
    startDate: '',
    endDate: '',
  });

  // Fetch branches once on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch metrics when branch filter changes
  useEffect(() => {
    fetchMetrics();
  }, [filters.branchId]);

  // Fetch customers with debounce to avoid rapid requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [pagination.page, filters]);

  const fetchBranches = async () => {
    try {
      const branchesRes = await branchApi.getAll(1, 100);
      if (branchesRes.status === 200 || branchesRes.data) {
        setBranches(branchesRes.data?.branches || branchesRes.data?.docs || []);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metricsRes = await customerApi.getMetrics({
        branchId: filters.branchId,
      });
      if (metricsRes.status === 200 || metricsRes.data) {
        setMetrics(metricsRes.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchCustomers = async () => {
    setTableLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Only include search if it has value
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const customersRes = await customerApi.getCustomers(params);

      if (customersRes.status === 200 || customersRes.data) {
        setCustomers(
          customersRes.data?.list || customersRes.data?.customers || []
        );
        setPagination(prev => ({
          ...prev,
          total: customersRes.data?.total || 0,
          pages: customersRes.data?.totalPages || 0,
        }));
      } else {
        throw new Error(customersRes.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      const errorMessage =
        error?.message || error?.data?.message || 'Failed to load customers';
      setError(errorMessage);
      setCustomers([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // fetchData is now called automatically via useEffect when pagination.page changes
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: FaCheckCircle,
        label: 'Active',
      },
      'suspended/freezed': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: FaExclamationTriangle,
        label: 'Suspended',
      },
      'blocked/removed': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: FaBan,
        label: 'Blocked',
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon /> {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-blue-600 shrink-0" />
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage customer accounts
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Total Customers</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.customers?.total || 0}
                </h3>
                <p className="text-blue-100 text-xs mt-1">
                  {metrics.customers?.verified || 0} verified
                </p>
              </div>
              <FaUsers className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Active Customers</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.customers?.active || 0}
                </h3>
                <p className="text-green-100 text-xs mt-1">
                  {metrics.customers?.new || 0} new this month
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">Total Orders</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.orders?.total || 0}
                </h3>
                <p className="text-purple-100 text-xs mt-1">
                  ${metrics.orders?.totalRevenue?.toFixed(2) || 0} revenue
                </p>
              </div>
              <FaShoppingCart className="text-4xl text-purple-200" />
            </div>
          </div>

          <div className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Avg Rating</p>
                <h3 className="text-3xl font-bold mt-1">
                  {metrics.reviews?.averageRating?.toFixed(1) || 0}
                </h3>
                <p className="text-yellow-100 text-xs mt-1">
                  {metrics.reviews?.total || 0} reviews
                </p>
              </div>
              <FaStar className="text-4xl text-yellow-200" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <FaFilter /> Filters
        </div>

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <select
            value={filters.account_status}
            onChange={e => {
              setFilters({ ...filters, account_status: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended/freezed">Suspended</option>
            <option value="blocked/removed">Blocked</option>
          </select>

          <select
            value={filters.is_Verified}
            onChange={e => {
              setFilters({ ...filters, is_Verified: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>

          <select
            value={filters.branchId}
            onChange={e => {
              setFilters({ ...filters, branchId: e.target.value });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <div className="relative">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 && !tableLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {customer.fullName?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {customer.contactNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(customer.account_status)}
                    </td>
                    <td className="px-6 py-4">
                      {customer.is_Verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <FaCheckCircle /> Yes
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <FaBan /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/customers/${customer._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FaEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.pages} (
              {pagination.total} total customers)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
