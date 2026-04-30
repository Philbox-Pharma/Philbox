import express from 'express';
import {
  saveSearch,
  getHistory,
  getRecentSearches,
  deleteSearch,
  clearAllHistory,
  getSuggestions,
} from '../controllers/searchHistory.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';

import { validate } from '../../../../../validator/joiValidate.middleware.js';
import { saveSearchDTO } from '../../../../../dto/customer/searchHistory.dto.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

/**
 * @route   POST /api/customer/search-history
 * @desc    Save a search query to history
 * @access  Private (Customer only)
 */
router.post(
  '/',
  rbacMiddleware(['create_search_history']),
  validate(saveSearchDTO),
  saveSearch
);

/**
 * @route   GET /api/customer/search-history
 * @desc    Get search history for customer (last 20 searches)
 * @access  Private (Customer only)
 */
router.get('/', rbacMiddleware(['read_search_history']), getHistory);

/**
 * @route   GET /api/customer/search-history/recent
 * @desc    Get recent search queries for customer
 * @access  Private (Customer only)
 */
router.get(
  '/recent',
  rbacMiddleware(['read_search_history']),
  getRecentSearches
);

/**
 * @route   GET /api/customer/search-history/suggestions
 * @desc    Get realtime search suggestions from history and medicine matches
 * @access  Private (Customer only)
 */
router.get(
  '/suggestions',
  rbacMiddleware(['read_search_history']),
  getSuggestions
);

/**
 * @route   DELETE /api/customer/search-history/:id
 * @desc    Delete a specific search history item
 * @access  Private (Customer only)
 */
router.delete('/:id', rbacMiddleware(['delete_search_history']), deleteSearch);

/**
 * @route   DELETE /api/customer/search-history/clear/all
 * @desc    Clear all search history for customer
 * @access  Private (Customer only)
 */
router.delete(
  '/clear/all',
  rbacMiddleware(['delete_search_history']),
  clearAllHistory
);

export default router;
