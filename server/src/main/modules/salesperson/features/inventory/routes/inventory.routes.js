import express from 'express';

import { authenticate } from '../../../middleware/auth.middleware.js';
import inventoryController from '../controllers/inventory.controller.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/salesperson/inventory
 * List all medicines with their stock levels
 * Query params: search, branch_id, category, page, limit, sortBy, sortOrder
 * Returns: medicines array with combined medicine and stock data, pagination info
 */
router.get('/', (req, res) => inventoryController.listInventory(req, res));

/**
 * GET /api/salesperson/inventory/export
 * Export current inventory to Excel (.xlsx) file
 * Returns: downloadable Excel file with inventory data (all columns from schema)
 */
router.get('/export', (req, res) =>
  inventoryController.exportInventory(req, res)
);

/**
 * GET /api/salesperson/inventory/:medicineId/audit-log
 * Get audit/history log for a specific medicine's stock changes
 * Query params: page, limit
 * Returns: paginated InventoryFilesLog entries for the medicine
 */
router.get('/:medicineId/audit-log', (req, res) =>
  inventoryController.getMedicineAuditLogs(req, res)
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
 * PATCH /api/salesperson/inventory/:medicineId/stock
 * Update stock quantity for a medicine
 * Body: { quantity: number (required, min: 0), reason: string (optional) }
 * Returns: updated stock record + flag indicating if log was created
 */
router.patch('/:medicineId/stock', (req, res) =>
  inventoryController.updateStock(req, res)
);

/**
 * PATCH /api/salesperson/inventory/:medicineId/discontinue
 * Mark a medicine as discontinued (soft disable)
 * Sets is_available = false (does not delete the document)
 * Returns: updated medicine document
 */
router.patch('/:medicineId/discontinue', (req, res) =>
  inventoryController.discontinueMedicine(req, res)
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
