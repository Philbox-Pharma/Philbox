import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { rbacMiddleware } from '../../../../../middlewares/rbac.middleware.js';
import {
  createBranch,
  listBranches,
  getBranchById,
  updateBranch,
  toggleBranchStatus,
  deleteBranch,
  assignAdminsToBranch,
  assignSalespersonsToBranch,
  getBranchStatistics,
  getBranchPerformanceMetrics,
} from '../controller/branch.controller.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  branchQueryDTO,
  createBranchDTO,
  updateBranchDTO,
} from '../../../../../dto/admin/branch.dto.js';

const router = express.Router();

// 📊 GET Branch Statistics - Requires read_branches permission
// Must be defined BEFORE /:id routes to avoid route conflicts
router.get(
  `/branches/statistics/all`,
  authenticate,
  rbacMiddleware('read_branches'),
  getBranchStatistics
);

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

// 📈 GET Branch Performance Metrics - Requires read_branches permission
router.get(
  `/branches/:id/performance`,
  authenticate,
  rbacMiddleware('read_branches'),
  getBranchPerformanceMetrics
);

// 🟧 UPDATE Branch - Requires update_branches permission
router.put(
  `/branches/:id`,
  authenticate,
  rbacMiddleware('update_branches'),
  validate(updateBranchDTO),
  updateBranch
);

// 🔄 TOGGLE Branch Status - Requires update_branches permission
router.patch(
  `/branches/:id/toggle-status`,
  authenticate,
  rbacMiddleware('update_branches'),
  toggleBranchStatus
);

// 👥 ASSIGN Admins to Branch - Requires update_branches permission
router.patch(
  `/branches/:id/assign-admins`,
  authenticate,
  rbacMiddleware('update_branches'),
  assignAdminsToBranch
);

// � ASSIGN Salespersons to Branch - Requires update_branches permission
router.patch(
  `/branches/:id/assign-salespersons`,
  authenticate,
  rbacMiddleware('update_branches'),
  assignSalespersonsToBranch
);

// �🟥 DELETE Branch - Requires delete_branches permission
router.delete(
  `/branches/:id`,
  authenticate,
  rbacMiddleware('delete_branches'),
  deleteBranch
);

export default router;
