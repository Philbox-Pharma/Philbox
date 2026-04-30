import express from 'express';
import { authenticate } from '../../../../middleware/auth.middleware.js';
import { validate } from '../../../../../../validator/joiValidate.middleware.js';
import {
  getCustomerRecommendations,
  getRecommendationInsights,
} from '../controller/medicineRecommendations.controller.js';
import {
  getCustomerRecommendationsDTO,
  recommendationsInsightsDTO,
  recommendationsQueryDTO,
} from '../../../../../../dto/admin/medicineRecommendations.dto.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/admin/medicine-recommendations/customers/:customerId
 * Get recommendations for a specific customer from daily cache or regenerate on demand
 */
router.get(
  '/customers/:customerId',
  validate(getCustomerRecommendationsDTO, 'params'),
  validate(recommendationsQueryDTO, 'query'),
  getCustomerRecommendations
);

/**
 * GET /api/admin/medicine-recommendations/insights
 * Get chronological recommendation insights and most common items
 */
router.get(
  '/insights',
  validate(recommendationsInsightsDTO, 'query'),
  getRecommendationInsights
);

export default router;
