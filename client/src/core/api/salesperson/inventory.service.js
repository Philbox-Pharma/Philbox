import apiClient from '../client';

const BASE_URL = '/salesperson/inventory';

export const salespersonInventoryApi = {
  /**
   * GET /api/salesperson/inventory
   * List all medicines with their stock levels
   * @param {Object} params - { search, branch_id, category, page, limit, sortBy, sortOrder }
   */
  listInventory: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * GET /api/salesperson/inventory/branches
   * Get managed branch options for inventory operations
   */
  getManagedBranches: async () => {
    const response = await apiClient.get(`${BASE_URL}/branches`);
    return response.data;
  },

  /**
   * POST /api/salesperson/inventory
   * Create a single medicine in a branch
   * @param {Object} data - { branch_id, Name, ... }
   */
  createMedicine: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  /**
   * GET /api/salesperson/inventory/:medicineId
   * Get full details of a single medicine
   */
  getMedicineDetails: async (medicineId, branchId) => {
    const response = await apiClient.get(`${BASE_URL}/${medicineId}`, {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * PATCH /api/salesperson/inventory/:medicineId
   * Update medicine properties
   */
  updateMedicine: async (medicineId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/${medicineId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/salesperson/inventory/:medicineId
   * Soft delete a medicine
   */
  softDeleteMedicine: async (medicineId, branchId) => {
    const response = await apiClient.delete(`${BASE_URL}/${medicineId}`, {
      params: { branch_id: branchId }
    });
    return response.data;
  },

  /**
   * POST /api/salesperson/inventory/bulk-upsert
   * Create or update complete inventory list
   * @param {Object} data - { branch_id, medicines: [...] }
   */
  bulkUpsertInventory: async (data) => {
    const response = await apiClient.post(`${BASE_URL}/bulk-upsert`, data);
    return response.data;
  },

  /**
   * DELETE /api/salesperson/inventory?branch_id=xxx
   * Soft delete entire branch inventory
   */
  clearBranchInventory: async (branchId) => {
    const response = await apiClient.delete(BASE_URL, { params: { branch_id: branchId } });
    return response.data;
  },
};
