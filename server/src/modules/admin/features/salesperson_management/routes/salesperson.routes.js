import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import {
  createSalesperson,
  listSalespersons,
} from '../controller/salesperson.controller.js';
import { ROUTES } from '../../../../../constants/global.routes.constants.js';
import { createSalespersonDTO } from '../../../../../dto/salesperson.dto.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';

const router = express.Router();

// 🟩 CREATE Salesperson
router.post(
  `${ROUTES.SUPER_ADMIN}/salespersons`,
  authenticate,
  isSuperAdmin,
  validate(createSalespersonDTO),
  createSalesperson
);

// 🟦 READ ALL Salespersons
router.get(
  `${ROUTES.SUPER_ADMIN}/salespersons`,
  authenticate,
  isSuperAdmin,
  listSalespersons
);

export default router;
