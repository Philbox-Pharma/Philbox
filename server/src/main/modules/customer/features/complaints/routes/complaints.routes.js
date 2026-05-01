import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../../../middlewares/rbac.middleware.js';
import { uploadDocuments } from '../../../../../middlewares/multer.middleware.js';
import {
  createComplaint,
  listMyComplaints,
  getComplaintDetails,
  addComplaintMessage,
  rateComplaintResolution,
} from '../controllers/complaints.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

router.post('/', uploadDocuments.array('supporting_files', 5), createComplaint);
router.get('/', listMyComplaints);
router.get('/:complaintId', getComplaintDetails);
router.post(
  '/:complaintId/messages',
  uploadDocuments.array('attachments', 5),
  addComplaintMessage
);
router.post('/:complaintId/rate-resolution', rateComplaintResolution);

export default router;
