import SearchHistory from '../../../../../models/SearchHistory.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerSearchHistoryService {
  /**
   * Save a search query to history
   */
  async saveSearch(customerId, searchData, req) {
    try {
      // Check if this exact query already exists recently (within last 5 minutes)
      const recentSearch = await SearchHistory.findOne({
        customer_id: customerId,
        query: searchData.query,
        searched_at: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });

      // If recent duplicate exists, just update its timestamp
      if (recentSearch) {
        recentSearch.searched_at = new Date();
        recentSearch.filters = searchData.filters || {};
        await recentSearch.save();

        return {
          searchHistory: recentSearch,
          message: 'Search updated in history',
        };
      }

      // Create new search history entry
      const searchHistory = await SearchHistory.create({
        customer_id: customerId,
        query: searchData.query,
        searched_at: new Date(),
        filters: searchData.filters || {},
      });

      // Log activity
      await logCustomerActivity(
        req,
        'search_medicine',
        `Searched for: ${searchData.query}`,
        'search_history',
        searchHistory._id
      );

      return {
        searchHistory,
        message: 'Search saved to history',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get search history for a customer (last 20 searches)
   */
  async getHistory(customerId, req) {
    try {
      const searchHistory = await SearchHistory.find({
        customer_id: customerId,
      })
        .sort({ searched_at: -1 })
        .limit(20)
        .lean();

      // Log activity
      await logCustomerActivity(
        req,
        'view_search_history',
        'Viewed search history',
        'search_history',
        customerId
      );

      return searchHistory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a specific search history item
   */
  async deleteSearch(customerId, searchId, req) {
    try {
      const searchHistory = await SearchHistory.findOne({
        _id: searchId,
        customer_id: customerId,
      });

      if (!searchHistory) {
        throw new Error('SEARCH_NOT_FOUND');
      }

      await SearchHistory.deleteOne({ _id: searchId });

      // Log activity
      await logCustomerActivity(
        req,
        'delete_search_history',
        `Deleted search: ${searchHistory.query}`,
        'search_history',
        searchId
      );

      return {
        message: 'Search history item deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all search history for a customer
   */
  async clearAllHistory(customerId, req) {
    try {
      const result = await SearchHistory.deleteMany({
        customer_id: customerId,
      });

      // Log activity
      await logCustomerActivity(
        req,
        'clear_search_history',
        `Cleared all search history (${result.deletedCount} items)`,
        'search_history',
        customerId
      );

      return {
        message: 'All search history cleared successfully',
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new CustomerSearchHistoryService();
