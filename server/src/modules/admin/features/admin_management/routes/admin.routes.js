import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import {
  createBranchAdmin,
  listAdmins,
  searchBranchAdmin,
  updateBranchAdmin,
  removeBranchAdmin,
} from '../controller/admin.controller.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createBranchAdminSchema,
  updateBranchAdminSchema,
} from '../../../../../dto/branchAdmin.dto.js';
import { paginationSchema } from '../../../../../dto/pagination.dto.js';

const router = express.Router();

// 🟩 CREATE Branch Admin
router.post(
  `/branch-admin`,
  authenticate,
  isSuperAdmin,
  upload.single('profile_img'),
  validate(createBranchAdminSchema),
  createBranchAdmin
);

// 🟦 READ All Branch Admins (with pagination)
router.get(
  `/branch-admin`,
  authenticate,
  isSuperAdmin,
  validate(paginationSchema, 'query'),
  listAdmins
);

// 🟨 READ Single Branch Admin
router.get(
  `/branch-admin/search`,
  authenticate,
  isSuperAdmin,
  searchBranchAdmin
);

// 🟧 UPDATE Branch Admin
router.put(
  `/branch-admin/:id`,
  authenticate,
  isSuperAdmin,
  upload.single('profile_img'),
  validate(updateBranchAdminSchema),
  updateBranchAdmin
);

// 🟥 DELETE Branch Admin
router.delete(
  `/branch-admin/:id`,
  authenticate,
  isSuperAdmin,
  removeBranchAdmin
);

export default router;
