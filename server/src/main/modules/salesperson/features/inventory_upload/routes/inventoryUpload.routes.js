import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import inventoryUploadController from '../controllers/inventoryUpload.controller.js';
import { uploadExcel } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

// All inventory upload endpoints require authenticated salesperson context.
router.use(authenticate);

// Download Excel template with required inventory columns.
router.get('/template', (req, res) =>
  inventoryUploadController.downloadTemplate(req, res)
);

// Validate and preview uploaded rows without writing to DB.
router.post('/preview', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.preview(req, res)
);

// Upload and process inventory file (branch_id must be provided in form-data).
router.post('/upload', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.upload(req, res)
);

// Alias endpoint for upload confirmation flow used by client.
router.post('/confirm-upload', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.confirmUpload(req, res)
);

// List unresolved per-row errors for a processed upload file.
router.get('/uploads/:uploadedFileId/errors', (req, res) =>
  inventoryUploadController.unresolvedErrors(req, res)
);

// Resolve one row error by retrying with corrected data or skipping.
router.post('/uploads/:uploadedFileId/logs/:logId/resolve', (req, res) =>
  inventoryUploadController.resolveErrorLog(req, res)
);

export default router;
