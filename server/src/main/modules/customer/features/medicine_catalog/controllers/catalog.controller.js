import MedicineCatalogService from '../service/catalog.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import customerSearchHistoryService from '../../search_history/service/searchHistory.service.js';

class MedicineCatalogController {
  /**
   * Browse medicines catalog
   * Flow:
   * 1. If customer has cart items, dominant cart branch is prioritized.
   * 2. Remaining branches are ordered by proximity.
   * 3. If no cart items, only proximity ordering is used.
   *
   * Query Parameters:
   * - category (optional): Filter by medicine category
   * - brand (optional): Filter by brand/medicine name
   * - dosage (optional): Filter by dosage form (tablet, syrup, etc.)
   * - prescriptionStatus (optional): 'OTC' or 'prescription_required'
   * - sortBy (optional): 'name', 'price_low_to_high', 'price_high_to_low', 'popularity'
   * - page (optional): Page number for pagination (default: 1)
   * - limit (optional): Items per page (default: 20)
   */
  async browseMedicines(req, res) {
    try {
      const customerId = req.user.id; // From auth middleware
      const {
        category,
        brand,
        dosage,
        prescriptionStatus,
        sortBy,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        categoryFilter: category || null,
        brandFilter: brand || null,
        dosageFilter: dosage || null,
        prescriptionStatusFilter: prescriptionStatus || null,
        sortBy: sortBy || 'name',
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const result = await MedicineCatalogService.browseMedicines(
        customerId,
        filters
      );

      // Log activity
      await logCustomerActivity(
        req,
        'BROWSED_MEDICINES',
        'Browsed medicines catalog with cart-aware proximity ranking',
        'medicines'
      );

      return sendResponse(
        res,
        200,
        'Medicines fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error browsing medicines:', error);

      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }
      if (error.message === 'NO_BRANCHES_AVAILABLE') {
        return sendResponse(res, 404, 'No branches available');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  /**
   * Get available branches for the customer
   * Branch details are intentionally restricted for customer medicine catalog flow.
   */
  async getAvailableBranches(req, res) {
    try {
      const customerId = req.user.id;

      await MedicineCatalogService.getAvailableBranches(customerId);

      // Log activity
      await logCustomerActivity(
        req,
        'BRANCH_DETAILS_BLOCKED',
        'Attempted to view restricted branch details in medicine catalog',
        'branches'
      );
    } catch (error) {
      console.error('Error fetching branches:', error);

      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }
      if (error.message === 'BRANCH_DETAILS_RESTRICTED') {
        return sendResponse(
          res,
          403,
          'Branch details are not available in customer medicine catalog'
        );
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  /**
   * Get medicine details
   * Includes branch information and availability status
   */
  async getMedicineDetails(req, res) {
    try {
      const customerId = req.user.id;
      const { medicineId } = req.params;

      if (!medicineId) {
        return sendResponse(res, 400, 'Medicine ID is required');
      }

      const result = await MedicineCatalogService.getMedicineDetails(
        medicineId,
        customerId
      );

      // Log activity
      await logCustomerActivity(
        req,
        'VIEWED_MEDICINE_DETAILS',
        `Viewed details for medicine ${medicineId}`,
        'medicines',
        medicineId
      );

      return sendResponse(
        res,
        200,
        'Medicine details fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching medicine details:', error);

      if (error.message === 'MEDICINE_NOT_FOUND') {
        return sendResponse(res, 404, 'Medicine not found');
      }
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  /**
   * Get medicines related to a specific medicine
   */
  async getRelatedMedicines(req, res) {
    try {
      const customerId = req.user.id;
      const { medicineId } = req.params;
      const { limit = 8 } = req.query;

      if (!medicineId) {
        return sendResponse(res, 400, 'Medicine ID is required');
      }

      const result = await MedicineCatalogService.getRelatedMedicines(
        medicineId,
        customerId,
        { limit: parseInt(limit) }
      );

      await logCustomerActivity(
        req,
        'VIEWED_RELATED_MEDICINES',
        `Viewed related medicines for ${medicineId}`,
        'medicines',
        medicineId
      );

      return sendResponse(
        res,
        200,
        'Related medicines fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching related medicines:', error);

      if (error.message === 'MEDICINE_NOT_FOUND') {
        return sendResponse(res, 404, 'Medicine not found');
      }
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  /**
   * Search medicines by name/category/brand with cart-aware + proximity ranking.
   * Duplicate medicines from farther branches are removed if nearest branch already has one.
   */
  async searchMedicines(req, res) {
    try {
      const customerId = req.user.id;
      const {
        searchTerm,
        category,
        dosage,
        sortBy,
        page = 1,
        limit = 10,
      } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return sendResponse(
          res,
          400,
          'Search term must be at least 2 characters'
        );
      }

      const result = await MedicineCatalogService.searchMedicines(customerId, {
        searchTerm,
        categoryFilter: category || null,
        dosageFilter: dosage || null,
        sortBy: sortBy || 'name',
        page: parseInt(page),
        limit: parseInt(limit),
      });

      // Record search query in search history
      await customerSearchHistoryService.saveSearch(
        customerId,
        {
          query: searchTerm.trim(),
          filters: {
            category: category || null,
            dosage: dosage || null,
            sortBy: sortBy || 'name',
          },
        },
        req
      );

      // Log activity
      await logCustomerActivity(
        req,
        'SEARCHED_MEDICINES',
        `Searched medicines for: ${searchTerm}`,
        'medicines'
      );

      return sendResponse(res, 200, 'Search results', result.data);
    } catch (error) {
      console.error('Error searching medicines:', error);
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return sendResponse(res, 404, 'Customer not found');
      }
      if (error.message === 'NO_BRANCHES_AVAILABLE') {
        return sendResponse(res, 404, 'No branches available');
      }
      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }
}

export default new MedicineCatalogController();
