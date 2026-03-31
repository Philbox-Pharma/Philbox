import express from 'express';

import { authenticate } from '../../../middleware/auth.middleware.js';
import inventoryController from '../controllers/inventory.controller.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/salesperson/inventory/branches
 * Get managed branch options for inventory operations
 */
router.get('/branches', (req, res) =>
  inventoryController.getManagedBranches(req, res)
);

/**
 * GET /api/salesperson/inventory/brands
 * Get manufacturer options for medicine creation forms
 */
router.get('/brands', (req, res) =>
  inventoryController.getManufacturers(req, res)
);

/**
 * GET /api/salesperson/inventory/categories
 * Get medicine category options for medicine creation forms
 */
router.get('/categories', (req, res) =>
  inventoryController.getCategories(req, res)
);

/**
 * GET /api/salesperson/inventory/classes
 * Get item class options for medicine creation forms
 */
router.get('/classes', (req, res) =>
  inventoryController.getItemClasses(req, res)
);

/**
 * GET /api/salesperson/inventory
 * List all medicines with their stock levels
 * Query params: search, branch_id, category, page, limit, sortBy, sortOrder
 * Returns: medicines array with combined medicine and stock data, pagination info
 */
router.get('/', (req, res) => inventoryController.listInventory(req, res));

/**
 * POST /api/salesperson/inventory
 * Create a single medicine in a branch managed by salesperson
 * Body must include: branch_id, Name
 */
router.post('/', (req, res) => inventoryController.createMedicine(req, res));

/**
 * DELETE /api/salesperson/inventory
 * Soft delete entire branch inventory (marks medicines unavailable and zeroes stock)
 * Query params: branch_id (required)
 */
router.delete('/', (req, res) =>
  inventoryController.clearBranchInventory(req, res)
);

/**
 * POST /api/salesperson/inventory/bulk-upsert
 * Create or update complete inventory list for a branch in one request
 * Body: { branch_id, medicines: [...] }
 */
router.post('/bulk-upsert', (req, res) =>
  inventoryController.bulkUpsertInventory(req, res)
);

/**
 * GET /api/salesperson/inventory/:medicineId
 * Get full details of a single medicine including stock and last 10 audit logs
 * Returns: medicine data + stock info + isCritical/isLowStock flags + auditLogs
 */
router.get('/:medicineId', (req, res) =>
  inventoryController.getMedicineDetails(req, res)
);

/**
 * PATCH /api/salesperson/inventory/:medicineId
 * Update medicine properties (and optional stock fields) for one medicine in a branch
 */
router.patch('/:medicineId', (req, res) =>
  inventoryController.updateMedicine(req, res)
);

/**
 * DELETE /api/salesperson/inventory/:medicineId
 * Soft delete a medicine (marks as unavailable)
 * Sets is_available = false (does not hard delete the document)
 * Returns: success message
 */
router.delete('/:medicineId', (req, res) =>
  inventoryController.softDeleteMedicine(req, res)
);

export default router;
