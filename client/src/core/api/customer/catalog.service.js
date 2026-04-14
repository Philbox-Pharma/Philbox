import apiClient from '../client';

const catalogService = {
  // Browse medicines catalog with filters and pagination
  // Params: category, brand, branch, dosage, prescriptionStatus, sortBy, page, limit
  browseMedicines: (params = {}) => {
    return apiClient.get('/customer/medicines', { params });
  },

  // Search medicines by keyword
  // Params: searchTerm (required), brand, branch, category, dosage, prescriptionStatus, sortBy, page, limit
  searchMedicines: (searchTerm, params = {}) => {
    return apiClient.get('/customer/medicines/search', {
      params: { searchTerm, ...params },
    });
  },

  // Get detailed info about a specific medicine
  getMedicineDetail: (medicineId) => {
    return apiClient.get(`/customer/medicines/${medicineId}`);
  },

  // Get related medicines for a specific medicine
  getRelatedMedicines: (medicineId) => {
    return apiClient.get(`/customer/medicines/${medicineId}/related`);
  },

  // Get available branch names for filter dropdowns
  getBranches: () => {
    return apiClient.get('/customer/medicines/branches');
  },

  // Get available brand/manufacturer names for filter dropdowns
  getBrands: () => {
    return apiClient.get('/customer/medicines/brands');
  },

  // Get available medicine classes for filter dropdowns
  getClasses: () => {
    return apiClient.get('/customer/medicines/classes');
  },

  // Get available categories for filter dropdowns
  getCategories: () => {
    return apiClient.get('/customer/medicines/categories');
  },
};

export default catalogService;
