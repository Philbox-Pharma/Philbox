import mongoose from 'mongoose';

import Medicine from '../../../../../models/Medicine.js';
import SearchHistory from '../../../../../models/SearchHistory.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerSearchHistoryService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _normalizeSuggestion(value = '') {
    return String(value).trim().toLowerCase();
  }

  _pushSuggestion(suggestions, seen, suggestion) {
    const key = this._normalizeSuggestion(suggestion.value);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    suggestions.push(suggestion);
    return true;
  }

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

  /**
   * Get autocomplete suggestions from personal history, other users' history,
   * and medicine catalog matches.
   */
  async getSuggestions(customerId, searchTerm, limit = 10) {
    const normalizedQuery = String(searchTerm || '').trim();
    if (normalizedQuery.length < 1) {
      return [];
    }

    const escapedQuery = this._escapeRegex(normalizedQuery);
    const suggestions = [];
    const seen = new Set();
    const personalLimit = Math.max(2, Math.ceil(limit / 2));
    const historyScanLimit = Math.max(limit * 4, 20);
    const medicineScanLimit = Math.max(limit * 3, 15);
    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    const personalHistory = await SearchHistory.find({
      customer_id: customerId,
      query: { $regex: `^${escapedQuery}`, $options: 'i' },
    })
      .sort({ searched_at: -1 })
      .limit(historyScanLimit)
      .lean();

    for (const item of personalHistory) {
      this._pushSuggestion(suggestions, seen, {
        value: item.query,
        label: item.query,
        source: 'personal_history',
      });

      if (suggestions.length >= personalLimit) {
        break;
      }
    }

    const popularHistory = await SearchHistory.aggregate([
      {
        $match: {
          customer_id: { $ne: customerObjectId },
          query: { $regex: `^${escapedQuery}`, $options: 'i' },
        },
      },
      {
        $project: {
          normalizedQuery: {
            $toLower: { $trim: { input: '$query' } },
          },
          query: 1,
          searched_at: 1,
        },
      },
      {
        $group: {
          _id: '$normalizedQuery',
          query: { $first: '$query' },
          count: { $sum: 1 },
          lastSearchedAt: { $max: '$searched_at' },
        },
      },
      {
        $sort: { count: -1, lastSearchedAt: -1 },
      },
      {
        $limit: historyScanLimit,
      },
    ]);

    for (const item of popularHistory) {
      this._pushSuggestion(suggestions, seen, {
        value: item.query,
        label: item.query,
        source: 'popular_history',
        score: item.count,
      });

      if (suggestions.length >= limit) {
        break;
      }
    }

    if (suggestions.length < limit) {
      const medicineMatches = await Medicine.find({
        is_available: true,
        $or: [
          { Name: { $regex: escapedQuery, $options: 'i' } },
          { alias_name: { $regex: escapedQuery, $options: 'i' } },
          { medicine_category: { $regex: escapedQuery, $options: 'i' } },
          { mgs: { $regex: escapedQuery, $options: 'i' } },
        ],
      })
        .select('Name alias_name medicine_category mgs class')
        .populate('class', 'name')
        .sort({ Name: 1 })
        .limit(medicineScanLimit)
        .lean();

      for (const medicine of medicineMatches) {
        const label = medicine.Name || medicine.alias_name;
        if (!label) continue;

        this._pushSuggestion(suggestions, seen, {
          value: label,
          label,
          source: 'medicine',
          medicineId: medicine._id,
          medicineCategory: medicine.medicine_category || null,
          dosageForm: medicine.mgs || null,
          className: medicine.class?.name || null,
        });

        if (suggestions.length >= limit) {
          break;
        }
      }
    }

    return suggestions.slice(0, limit);
  }
}

export default new CustomerSearchHistoryService();
