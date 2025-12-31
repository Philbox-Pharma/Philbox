import customerSearchHistoryService from '../service/searchHistory.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

/**
 * Save a search query to history
 */
export const saveSearch = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await customerSearchHistoryService.saveSearch(
      customerId,
      req.body,
      req
    );

    return sendResponse(res, 201, result.message, result.searchHistory);
  } catch (err) {
    console.error('Save Search Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Get search history for customer (last 20 searches)
 */
export const getHistory = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const searchHistory = await customerSearchHistoryService.getHistory(
      customerId,
      req
    );

    return sendResponse(
      res,
      200,
      'Search history fetched successfully',
      searchHistory
    );
  } catch (err) {
    console.error('Get History Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Delete a specific search history item
 */
export const deleteSearch = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const searchId = req.params.id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await customerSearchHistoryService.deleteSearch(
      customerId,
      searchId,
      req
    );

    return sendResponse(res, 200, result.message);
  } catch (err) {
    console.error('Delete Search Error:', err);

    if (err.message === 'SEARCH_NOT_FOUND') {
      return sendResponse(res, 404, 'Search history item not found');
    }

    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Clear all search history for customer
 */
export const clearAllHistory = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await customerSearchHistoryService.clearAllHistory(
      customerId,
      req
    );

    return sendResponse(res, 200, result.message, {
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error('Clear History Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};
