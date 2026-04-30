import express from 'express';
import MedicineCatalogController from '../controllers/catalog.controller.js';

const router = express.Router();

/**
 * Medicine Catalog Routes
 * Public read-only routes
 */

/**
 * GET /api/customer/medicines
 * Browse medicines catalog with cart-aware branch priority and proximity fallback
 *
 * Query Parameters:
 * - category (optional): Medicine category filter
 * - brand (optional): Manufacturer name filter
 * - branch (optional): Branch name filter
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
 * GET /api/customer/medicines/branches
 * Get available branch names for branch filter UI.
 */
router.get(
  '/branches',
  MedicineCatalogController.getAvailableBranches.bind(MedicineCatalogController)
);

/**
 * GET /api/customer/medicines/brands
 * Get available manufacturer names for brand filter UI.
 */
router.get(
  '/brands',
  MedicineCatalogController.getAvailableBrands.bind(MedicineCatalogController)
);

/**
 * GET /api/customer/medicines/classes
 * Get available medicine class names for filter UI.
 */
router.get(
  '/classes',
  MedicineCatalogController.getAvailableClasses.bind(MedicineCatalogController)
);

/**
 * GET /api/customer/medicines/categories
 * Get available medicine category names for filter UI.
 */
router.get(
  '/categories',
  MedicineCatalogController.getAvailableCategories.bind(
    MedicineCatalogController
  )
);

/**
 * GET /api/customer/medicines/search
 * Search medicines by name, category, or brand
 * Applies cart-aware + proximity branch ranking and deduplicates duplicates by nearest branch.
 *
 * Query Parameters:
 * - searchTerm (required): Search keyword (min 2 characters)
 * - brand (optional): Manufacturer name filter
 * - branch (optional): Branch name filter
 * - category (optional)
 * - dosage (optional)
 * - prescriptionStatus (optional): OTC | prescription_required
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
 * GET /api/customer/medicines/recommendations
 * Get personalized medicine recommendations for the logged-in customer
 */
router.get(
  '/recommendations',
  MedicineCatalogController.getMedicineRecommendations.bind(
    MedicineCatalogController
  )
);

/**
 * GET /api/customer/medicines/:medicineId/related
 * Get medicines related to a specific medicine
 */
router.get(
  '/:medicineId/related',
  MedicineCatalogController.getRelatedMedicines.bind(MedicineCatalogController)
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
 *   availability: { inStock: boolean }
 * }
 */
router.get(
  '/:medicineId',
  MedicineCatalogController.getMedicineDetails.bind(MedicineCatalogController)
);

export default router;
