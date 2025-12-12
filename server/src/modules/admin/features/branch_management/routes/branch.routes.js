import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { rbacMiddleware } from '../../../../../middlewares/rbac.middleware.js';
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

// 🟩 CREATE Branch - Requires create_branches permission
router.post(
  `/branches`,
  authenticate,
  rbacMiddleware('create_branches'),
  validate(createBranchDTO),
  createBranch
);

// 🟦 READ ALL Branches - Requires read_branches permission
router.get(
  `/branches`,
  authenticate,
  rbacMiddleware('read_branches'),
  validate(branchQueryDTO),
  listBranches
);

// 🟨 READ Single Branch - Requires read_branches permission
router.get(
  `/branches/:id`,
  authenticate,
  rbacMiddleware('read_branches'),
  getBranchById
);

// 🟧 UPDATE Branch - Requires update_branches permission
router.put(
  `/branches/:id`,
  authenticate,
  rbacMiddleware('update_branches'),
  validate(updateBranchDTO),
  updateBranch
);

// 🟥 DELETE Branch - Requires delete_branches permission
router.delete(
  `/branches/:id`,
  authenticate,
  rbacMiddleware('delete_branches'),
  deleteBranch
);

export default router;
