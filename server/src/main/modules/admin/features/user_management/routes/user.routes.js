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
  getSalespersonTaskPerformance,
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

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== ADMIN MANAGEMENT ENDPOINTS =====
 */

// 🟩 CREATE Admin (with optional profile image) - Super Admin Only
router.post(
  '/admin',
  roleMiddleware('super_admin'),
  upload.fields([
    { name: 'profile_img', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
  ]),
  validate(createBranchAdminSchema),
  createAdmin
);

// 🟦 READ All Admins (with pagination & search) - Super Admin Only
router.get(
  '/admin',
  roleMiddleware('super_admin'),
  validate(paginationSchema, 'query'),
  getAllAdmins
);

// 🟨 READ Single Admin by ID - Super Admin Only
router.get('/admin/:id', roleMiddleware('super_admin'), getAdminById);

// 🟥 SEARCH Admin - Super Admin Only
router.get('/admin/search', roleMiddleware('super_admin'), searchAdmin);

// 🟧 UPDATE Admin - Super Admin Only
router.put(
  '/admin/:id',
  roleMiddleware('super_admin'),
  upload.fields([
    { name: 'profile_img', maxCount: 1 },
    { name: 'cover_img', maxCount: 1 },
  ]),
  validate(updateBranchAdminSchema),
  updateAdmin
);

// 🔴 DELETE Admin - Super Admin Only
router.delete('/admin/:id', roleMiddleware('super_admin'), deleteAdmin);

/**
 * ===== SALESPERSON MANAGEMENT ENDPOINTS =====
 */

// 🟩 CREATE Salesperson - Super Admin Only
router.post(
  '/salesperson',
  roleMiddleware('super_admin'),
  validate(createSalespersonDTO),
  createSalesperson
);

// 🟦 READ All Salespersons (with pagination & search) - Super Admin Only
router.get(
  '/salesperson',
  roleMiddleware('super_admin'),
  validate(paginationSchema, 'query'),
  getAllSalespersons
);

// 🟨 READ Single Salesperson by ID - Super Admin Only
router.get(
  '/salesperson/:id',
  roleMiddleware('super_admin'),
  getSalespersonById
);

// 🟥 SEARCH Salesperson - Super Admin Only
router.get(
  '/salesperson/search',
  roleMiddleware('super_admin'),
  searchSalesperson
);

// 🟧 UPDATE Salesperson - Super Admin Only
router.put(
  '/salesperson/:id',
  roleMiddleware('super_admin'),
  validate(updateSalespersonDTO),
  updateSalesperson
);

// 🟠 CHANGE Salesperson Status - Super Admin Only
router.patch(
  '/salesperson/:id/status',
  roleMiddleware('super_admin'),
  validate(changeStatusDTO),
  changeSalespersonStatus
);

// 🔴 DELETE Salesperson - Super Admin Only
router.delete(
  '/salesperson/:id',
  roleMiddleware('super_admin'),
  deleteSalesperson
);

/**
 * ===== SALESPERSON TASK PERFORMANCE =====
 */

// 📊 GET Salesperson Task Performance
// Super Admin: View all salesperson tasks
// Branch Admin: View tasks for salespersons in their managed branches
router.get('/salesperson-tasks/performance', getSalespersonTaskPerformance);

export default router;
