import apiClient from '../client';

/**
 * globalSearch.service.js
 * Searches across all entities in parallel and normalises results
 * into a flat array with a consistent shape { id, type, name, description, path }.
 */
export const globalSearchService = {
  search: async (query, limit = 5) => {
    if (!query || query.length < 2) return [];

    const results = [];

    const [branches, admins, salespersons, customers, doctors] =
      await Promise.allSettled([
        apiClient.get(
          `/admin/branches?${new URLSearchParams({ page: 1, limit, search: query })}`
        ),
        apiClient.get(
          `/admin/users/admin?${new URLSearchParams({ page: 1, limit, search: query })}`
        ),
        apiClient.get(
          `/admin/users/salesperson?${new URLSearchParams({ page: 1, limit, search: query })}`
        ),
        apiClient.get(
          `/super-admin/customers?${new URLSearchParams({ page: 1, limit, search: query })}`
        ),
        apiClient.get(
          `/admin/doctors?${new URLSearchParams({ page: 1, limit, search: query })}`
        ),
      ]);

    // Parse Branches
    if (
      branches.status === 'fulfilled' &&
      branches.value?.data?.data?.branches
    ) {
      branches.value.data.data.branches.forEach(b => {
        results.push({
          id: b._id,
          type: 'branch',
          name: b.name || b.branch_name,
          description: b.address || b.city || 'Branch',
          path: `/admin/branches/${b._id}`,
        });
      });
    }

    // Parse Admins
    if (admins.status === 'fulfilled' && admins.value?.data?.data?.admins) {
      admins.value.data.data.admins.forEach(a => {
        results.push({
          id: a._id,
          type: 'admin',
          name: a.name || a.fullName,
          description: a.email || 'Admin',
          path: `/admin/staff/admins/${a._id}`,
        });
      });
    }

    // Parse Salespersons
    if (
      salespersons.status === 'fulfilled' &&
      salespersons.value?.data?.data?.salespersons
    ) {
      salespersons.value.data.data.salespersons.forEach(s => {
        results.push({
          id: s._id,
          type: 'salesperson',
          name: s.fullName || s.name,
          description: s.email || 'Salesperson',
          path: `/admin/staff/salespersons/${s._id}`,
        });
      });
    }

    // Parse Customers
    if (
      customers.status === 'fulfilled' &&
      customers.value?.data?.data?.customers
    ) {
      customers.value.data.data.customers.forEach(c => {
        results.push({
          id: c._id,
          type: 'customer',
          name: c.fullName || c.name,
          description: c.email || c.phone_number || 'Customer',
          path: `/admin/customers/${c._id}`,
        });
      });
    }

    // Parse Doctors
    if (doctors.status === 'fulfilled' && doctors.value?.data?.data?.doctors) {
      doctors.value.data.data.doctors.forEach(d => {
        results.push({
          id: d._id,
          type: 'doctor',
          name: d.fullName || d.name,
          description: d.specialty || d.email || 'Doctor',
          path: `/admin/doctors/${d._id}`,
        });
      });
    }

    return results;
  },
};
