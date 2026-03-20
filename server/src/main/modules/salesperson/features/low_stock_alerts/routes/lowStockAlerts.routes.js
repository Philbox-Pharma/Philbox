import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  lowStockListQuerySchema,
  lowStockCountQuerySchema,
  updateThresholdSchema,
} from '../../../../../dto/salesperson/lowStockAlerts.dto.js';
import lowStockAlertsController from '../controllers/lowStockAlerts.controller.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/low-stock',
  validate(lowStockListQuerySchema, 'query'),
  (req, res) => lowStockAlertsController.getLowStockAlerts(req, res)
);

router.get(
  '/low-stock/count',
  validate(lowStockCountQuerySchema, 'query'),
  (req, res) => lowStockAlertsController.getLowStockCount(req, res)
);

router.patch('/low-stock/:stockId/resolve', (req, res) =>
  lowStockAlertsController.resolveLowStockAlert(req, res)
);

router.put(
  '/low-stock/threshold/:medicineId',
  validate(updateThresholdSchema),
  (req, res) => lowStockAlertsController.updateThreshold(req, res)
);

export default router;
