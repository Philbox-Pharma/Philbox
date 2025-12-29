import express from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/customer/dashboard
 * @desc    Get customer dashboard data (stats, recent orders, upcoming appointments, recommendations)
 * @access  Private (Customer only)
 */
router.get('/', authenticate, getDashboard);

export default router;
