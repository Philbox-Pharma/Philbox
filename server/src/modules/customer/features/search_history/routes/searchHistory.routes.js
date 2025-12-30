import express from 'express';
import {
  saveSearch,
  getHistory,
  deleteSearch,
  clearAllHistory,
} from '../controllers/searchHistory.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import { saveSearchDTO } from '../../../../../dto/customer/searchHistory.dto.js';

const router = express.Router();

/**
 * @route   POST /api/customer/search-history
 * @desc    Save a search query to history
 * @access  Private (Customer only)
 */
router.post('/', authenticate, validate(saveSearchDTO), saveSearch);

/**
 * @route   GET /api/customer/search-history
 * @desc    Get search history for customer (last 20 searches)
 * @access  Private (Customer only)
 */
router.get('/', authenticate, getHistory);

/**
 * @route   DELETE /api/customer/search-history/:id
 * @desc    Delete a specific search history item
 * @access  Private (Customer only)
 */
router.delete('/:id', authenticate, deleteSearch);

/**
 * @route   DELETE /api/customer/search-history/clear/all
 * @desc    Clear all search history for customer
 * @access  Private (Customer only)
 */
router.delete('/clear/all', authenticate, clearAllHistory);

export default router;
