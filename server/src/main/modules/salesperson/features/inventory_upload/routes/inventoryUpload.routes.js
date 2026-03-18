import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import inventoryUploadController from '../controllers/inventoryUpload.controller.js';
import { uploadExcel } from '../../../../../middlewares/multer.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/template', (req, res) =>
  inventoryUploadController.downloadTemplate(req, res)
);
router.post('/preview', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.preview(req, res)
);
router.post('/upload', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.upload(req, res)
);
router.post('/confirm-upload', uploadExcel.single('file'), (req, res) =>
  inventoryUploadController.confirmUpload(req, res)
);
router.get('/uploads/:uploadedFileId/errors', (req, res) =>
  inventoryUploadController.unresolvedErrors(req, res)
);
router.post('/uploads/:uploadedFileId/logs/:logId/resolve', (req, res) =>
  inventoryUploadController.resolveErrorLog(req, res)
);

export default router;
