import apiClient from '../client';

const BASE_URL = '/salesperson/inventory';

export const salespersonInventoryUploadApi = {
  /**
   * GET /api/salesperson/inventory-upload/template
   * Download Excel template for inventory upload
   */
  downloadTemplate: async () => {
    const response = await apiClient.get(`${BASE_URL}/template`, {
      responseType: 'blob',
    });
    return response;
  },

  /**
   * POST /api/salesperson/inventory-upload/preview
   * Validate and preview uploaded rows without writing to DB
   * @param {FormData} formData - contains 'file' field
   */
  previewUpload: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * POST /api/salesperson/inventory-upload/upload
   * Upload and process inventory file
   * @param {FormData} formData - contains 'file' and 'branch_id' fields
   */
  uploadInventory: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * POST /api/salesperson/inventory-upload/confirm-upload
   * Confirm upload flow
   */
  confirmUpload: async (formData) => {
    const response = await apiClient.post(`${BASE_URL}/confirm-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * GET /api/salesperson/inventory-upload/uploads/:uploadedFileId/errors
   * List unresolved per-row errors
   */
  getUploadErrors: async (uploadedFileId) => {
    const response = await apiClient.get(`${BASE_URL}/uploads/${uploadedFileId}/errors`);
    return response.data;
  },

  /**
   * POST /api/salesperson/inventory-upload/uploads/:uploadedFileId/logs/:logId/resolve
   * Resolve one row error
   */
  resolveErrorLog: async (uploadedFileId, logId, data) => {
    const response = await apiClient.post(
      `${BASE_URL}/uploads/${uploadedFileId}/logs/${logId}/resolve`,
      data
    );
    return response.data;
  },
};
