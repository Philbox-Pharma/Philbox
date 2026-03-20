import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import { getDashboardQueryDto } from '../../../../../dto/salesperson/dashboard.dto.js';
import dashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', validate(getDashboardQueryDto, 'query'), (req, res) =>
  dashboardController.getDashboard(req, res)
);

export default router;
