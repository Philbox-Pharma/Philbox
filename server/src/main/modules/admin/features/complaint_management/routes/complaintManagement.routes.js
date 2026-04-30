import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { uploadDocuments } from '../../../../../middlewares/multer.middleware.js';
import {
  listComplaints,
  getComplaintDetails,
  addAdminMessage,
  updateComplaintStatus,
  assignComplaint,
  exportComplaintsReport,
} from '../controller/complaintManagement.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listComplaints);
router.get('/export', exportComplaintsReport);
router.get('/:complaintId', getComplaintDetails);
router.post(
  '/:complaintId/messages',
  uploadDocuments.array('attachments', 5),
  addAdminMessage
);
router.patch('/:complaintId/status', updateComplaintStatus);
router.patch('/:complaintId/assign', assignComplaint);

export default router;
