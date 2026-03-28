import express from 'express';
import MedicineCatalogController from '../controllers/catalog.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Medicine Catalog Routes
 * All routes require customer authentication
 */

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * GET /api/customer/medicines
 * Browse medicines catalog with cart-aware branch priority and proximity fallback
 *
 * Query Parameters:
 * - category (optional): Medicine category filter
 * - brand (optional): Brand/medicine name filter
 * - dosage (optional): Dosage form filter
 * - prescriptionStatus (optional): 'OTC' or 'prescription_required'
 * - sortBy (optional): 'name', 'price_low_to_high', 'price_high_to_low', 'popularity'
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 20)
 *
 * Response:
 * {
 *   medicines: [ { id, name, price, proximityInfo, ... } ],
 *   pagination: { currentPage, totalPages, totalMedicines, itemsPerPage },
 *   selectedBranch: null,
 *   branchesAvailable: number,
 *   rankingContext: { rankingMode },
 *   appliedFilters: { ... }
 * }
 */
router.get(
  '/',
  MedicineCatalogController.browseMedicines.bind(MedicineCatalogController)
);

/**
 * GET /api/customer/medicines/search
 * Search medicines by name, category, or brand
 * Applies cart-aware + proximity branch ranking and deduplicates duplicates by nearest branch.
 *
 * Query Parameters:
 * - searchTerm (required): Search keyword (min 2 characters)
 * - category (optional)
 * - dosage (optional)
 * - sortBy (optional): name | price_low_to_high | price_high_to_low
 * - page (optional): default 1
 * - limit (optional): default 10
 *
 * Response:
 * {
 *   medicines: [ matching medicines ],
 *   count: number
 * }
 */
router.get(
  '/search',
  MedicineCatalogController.searchMedicines.bind(MedicineCatalogController)
);

/**
 * GET /api/customer/medicines/:medicineId
 * Get detailed information about a specific medicine
 *
 * URL Parameters:
 * - medicineId: Medicine MongoDB ID
 *
 * Response:
 * {
 *   medicine: { full medicine object with details (branch hidden) },
 *   availability: { inStock: boolean, stockStatus: string }
 * }
 */
router.get(
  '/:medicineId',
  MedicineCatalogController.getMedicineDetails.bind(MedicineCatalogController)
);

export default router;
