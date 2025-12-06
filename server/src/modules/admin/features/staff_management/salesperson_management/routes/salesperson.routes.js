import express from 'express';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import { authenticate } from '../../../../middleware/auth.middleware.js'; // Ensure this points to Admin Auth
import {
  createSalespersonDTO,
  updateSalespersonDTO,
  changeStatusDTO,
} from '../../../../../../dto/admin/salesperson.dto.js';
import {
  createSalesperson,
  getAllSalespersons,
  getSalespersonById,
  updateSalesperson,
  changeStatus,
  deleteSalesperson,
} from '../controller/salesperson.controller.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

// ✅ Create Salesperson
router.post('/', validate(createSalespersonDTO), createSalesperson);

// ✅ Get All (with pagination & search)
router.get('/', getAllSalespersons);

// ✅ Get Single Details
router.get('/:id', getSalespersonById);

// ✅ Update Profile (Name, Contact, Gender, Branches)
router.put('/:id', validate(updateSalespersonDTO), updateSalesperson);

// ✅ Change Status (Active/Suspend/Block)
router.patch('/:id/status', validate(changeStatusDTO), changeStatus);

// ✅ Delete Salesperson
router.delete('/:id', deleteSalesperson);

export default router;
