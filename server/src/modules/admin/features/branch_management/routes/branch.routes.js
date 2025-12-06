import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import {
  createBranch,
  listBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} from '../controller/branch.controller.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  branchQueryDTO,
  createBranchDTO,
  updateBranchDTO,
} from '../../../../../dto/admin/branch.dto.js';

const router = express.Router();

// 🟩 CREATE Branch
router.post(
  `/branches`,
  authenticate,
  isSuperAdmin,
  validate(createBranchDTO),
  createBranch
);

// 🟦 READ ALL Branches
router.get(
  `/branches`,
  authenticate,
  isSuperAdmin,
  validate(branchQueryDTO),
  listBranches
);

// 🟨 READ Single Branch
router.get(`/branches/:id`, authenticate, isSuperAdmin, getBranchById);

// 🟧 UPDATE Branch
router.put(
  `/branches/:id`,
  authenticate,
  isSuperAdmin,
  validate(updateBranchDTO),
  updateBranch
);

// 🟥 DELETE Branch
router.delete(`/branches/:id`, authenticate, isSuperAdmin, deleteBranch);

export default router;
