import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../../../middlewares/rbac.middleware.js';
import {
  createAdmin,
  createSalesperson,
  getAllAdmins,
  getAllSalespersons,
  getAdminById,
  getSalespersonById,
  searchAdmin,
  searchSalesperson,
  updateAdmin,
  updateSalesperson,
  changeSalespersonStatus,
  deleteAdmin,
  deleteSalesperson,
} from '../controller/user.controller.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createBranchAdminSchema,
  updateBranchAdminSchema,
} from '../../../../../dto/admin/branchAdmin.dto.js';
import {
  createSalespersonDTO,
  updateSalespersonDTO,
  changeStatusDTO,
} from '../../../../../dto/admin/salesperson.dto.js';
import { paginationSchema } from '../../../../../dto/admin/pagination.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication and super_admin role
router.use(authenticate);
router.use(roleMiddleware('super_admin'));

/**
 * ===== ADMIN MANAGEMENT ENDPOINTS =====
 */

// 🟩 CREATE Admin (with optional profile image)
router.post(
  '/admin',
  upload.single('profile_img'),
  validate(createBranchAdminSchema),
  createAdmin
);

// 🟦 READ All Admins (with pagination & search)
router.get('/admin', validate(paginationSchema, 'query'), getAllAdmins);

// 🟨 READ Single Admin by ID
router.get('/admin/:id', getAdminById);

// 🟥 SEARCH Admin
router.get('/admin/search', searchAdmin);

// 🟧 UPDATE Admin
router.put('/admin/:id', validate(updateBranchAdminSchema), updateAdmin);

// 🔴 DELETE Admin
router.delete('/admin/:id', deleteAdmin);

/**
 * ===== SALESPERSON MANAGEMENT ENDPOINTS =====
 */

// 🟩 CREATE Salesperson
router.post('/salesperson', validate(createSalespersonDTO), createSalesperson);

// 🟦 READ All Salespersons (with pagination & search)
router.get(
  '/salesperson',
  validate(paginationSchema, 'query'),
  getAllSalespersons
);

// 🟨 READ Single Salesperson by ID
router.get('/salesperson/:id', getSalespersonById);

// 🟥 SEARCH Salesperson
router.get('/salesperson/search', searchSalesperson);

// 🟧 UPDATE Salesperson
router.put(
  '/salesperson/:id',
  validate(updateSalespersonDTO),
  updateSalesperson
);

// 🟠 CHANGE Salesperson Status
router.patch(
  '/salesperson/:id/status',
  validate(changeStatusDTO),
  changeSalespersonStatus
);

// 🔴 DELETE Salesperson
router.delete('/salesperson/:id', deleteSalesperson);

export default router;
