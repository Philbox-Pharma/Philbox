import mongoose from 'mongoose';

import Medicine from '../../../../../models/Medicine.js';
import MedicineCategory from '../../../../../models/MedicineCategory.js';
import SearchHistory from '../../../../../models/SearchHistory.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerSearchHistoryService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _normalizeSuggestion(value = '') {
    return String(value).trim().toLowerCase();
  }

  _levenshteinDistance(a = '', b = '') {
    const left = this._normalizeSuggestion(a);
    const right = this._normalizeSuggestion(b);

    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const rows = left.length + 1;
    const cols = right.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[left.length][right.length];
  }

  _maxTypoDistance(searchTerm = '') {
    const len = this._normalizeSuggestion(searchTerm).length;
    if (len <= 4) return 1;
    if (len <= 8) return 2;
    return 3;
  }

  _isTypoCandidate(searchTerm = '', candidate = '') {
    const query = this._normalizeSuggestion(searchTerm);
    const term = this._normalizeSuggestion(candidate);
    if (!query || !term || query === term) return false;

    if (term.startsWith(query)) {
      // Prefix matches are already covered by autocomplete buckets.
      return false;
    }

    const distance = this._levenshteinDistance(query, term);
    return distance > 0 && distance <= this._maxTypoDistance(query);
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

  _normalizeFilterValue(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return value;
  }

  _sanitizeFilters(rawFilters = {}) {
    if (!rawFilters || typeof rawFilters !== 'object') {
      return undefined;
    }

    const normalizedFilters = {
      category: this._normalizeFilterValue(rawFilters.category),
      brand: this._normalizeFilterValue(rawFilters.brand),
      branch: this._normalizeFilterValue(rawFilters.branch),
      dosage: this._normalizeFilterValue(
        rawFilters.dosage ?? rawFilters.dosageForm
      ),
      prescriptionStatus: this._normalizeFilterValue(
        rawFilters.prescriptionStatus ?? rawFilters.prescriptionRequired
      ),
      sortBy: this._normalizeFilterValue(rawFilters.sortBy),
    };

    const filteredEntries = Object.entries(normalizedFilters).filter(
      ([, value]) => value !== null && value !== undefined
    );

    if (!filteredEntries.length) {
      return undefined;
    }

    return Object.fromEntries(filteredEntries);
  }

  /**
   * Save a search query to history
   */
  async saveSearch(customerId, searchData, req) {
    try {
      const sanitizedFilters = this._sanitizeFilters(searchData.filters);

      // Check if this exact query already exists recently (within last 5 minutes)
      const recentSearch = await SearchHistory.findOne({
        customer_id: customerId,
        query: searchData.query,
        searched_at: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });

      // If recent duplicate exists, just update its timestamp
      if (recentSearch) {
        recentSearch.searched_at = new Date();

        if (sanitizedFilters) {
          recentSearch.filters = sanitizedFilters;
        } else {
          recentSearch.set('filters', undefined);
        }

        await recentSearch.save();

        return {
          searchHistory: recentSearch,
          message: 'Search updated in history',
        };
      }

      // Create new search history entry
      const payload = {
        customer_id: customerId,
        query: searchData.query,
        searched_at: new Date(),
      };

      if (sanitizedFilters) {
        payload.filters = sanitizedFilters;
      }

      const searchHistory = await SearchHistory.create(payload);

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

      const cleanedHistory = searchHistory.map(item => {
        const cleanedFilters = this._sanitizeFilters(item.filters);
        if (cleanedFilters) {
          return {
            ...item,
            filters: cleanedFilters,
          };
        }

        const { filters, ...rest } = item;
        return rest;
      });

      // Log activity
      await logCustomerActivity(
        req,
        'view_search_history',
        'Viewed search history',
        'search_history',
        customerId
      );

      return cleanedHistory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent searches for a customer as query strings (latest first)
   */
  async getRecentSearches(customerId, limit = 10, req) {
    try {
      const parsedLimit = Math.max(1, Math.min(Number(limit) || 10, 50));

      const searchHistory = await SearchHistory.find({
        customer_id: customerId,
      })
        .sort({ searched_at: -1 })
        .select('query searched_at')
        .limit(parsedLimit * 3)
        .lean();

      // Keep only latest unique queries while preserving recency order.
      const recent = [];
      const seen = new Set();
      for (const item of searchHistory) {
        const query = String(item.query || '').trim();
        if (!query) continue;

        const key = query.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        recent.push({
          query,
          searched_at: item.searched_at,
        });

        if (recent.length >= parsedLimit) {
          break;
        }
      }

      await logCustomerActivity(
        req,
        'view_recent_searches',
        'Viewed recent searches',
        'search_history',
        customerId
      );

      return recent;
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

    const parsedLimit = Math.max(5, Math.min(Number(limit) || 10, 20));
    const escapedQuery = this._escapeRegex(normalizedQuery);
    const suggestions = [];
    const seen = new Set();
    const personalLimit = Math.max(2, Math.ceil(parsedLimit / 2));
    const historyScanLimit = Math.max(parsedLimit * 4, 20);
    const medicineScanLimit = Math.max(parsedLimit * 3, 15);
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

      if (suggestions.length >= parsedLimit) {
        break;
      }
    }

    if (suggestions.length < parsedLimit) {
      const matchedCategories = await MedicineCategory.find({
        name: { $regex: escapedQuery, $options: 'i' },
      })
        .select('_id')
        .lean();

      const matchedCategoryIds = matchedCategories.map(item => item._id);

      const medicineMatches = await Medicine.find({
        active: true,
        $or: [
          { Name: { $regex: escapedQuery, $options: 'i' } },
          { alias_name: { $regex: escapedQuery, $options: 'i' } },
          { mgs: { $regex: escapedQuery, $options: 'i' } },
          { dosage_form: { $regex: escapedQuery, $options: 'i' } },
          ...(matchedCategoryIds.length
            ? [{ category: { $in: matchedCategoryIds } }]
            : []),
        ],
      })
        .select('Name alias_name category mgs dosage_form class')
        .populate('category', 'name')
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
          medicineCategory: medicine.category?.name || null,
          dosageForm: medicine.dosage_form || medicine.mgs || null,
          className: medicine.class?.name || null,
        });

        if (suggestions.length >= parsedLimit) {
          break;
        }
      }
    }

    const typoCandidatePool = [];
    const typoSeen = new Set();

    const addTypoCandidate = value => {
      const normalized = this._normalizeSuggestion(value);
      if (!normalized || typoSeen.has(normalized)) return;
      typoSeen.add(normalized);
      typoCandidatePool.push(String(value).trim());
    };

    for (const item of personalHistory) {
      addTypoCandidate(item.query);
    }
    for (const item of popularHistory) {
      addTypoCandidate(item.query);
    }

    if (typoCandidatePool.length < historyScanLimit) {
      const fallbackMedicines = await Medicine.find({ active: true })
        .select('Name alias_name')
        .sort({ Name: 1 })
        .limit(historyScanLimit)
        .lean();

      for (const medicine of fallbackMedicines) {
        addTypoCandidate(medicine.Name);
        addTypoCandidate(medicine.alias_name);
      }
    }

    const typoMatches = [];
    for (const candidate of typoCandidatePool) {
      if (!this._isTypoCandidate(normalizedQuery, candidate)) continue;

      typoMatches.push({
        value: candidate,
        distance: this._levenshteinDistance(normalizedQuery, candidate),
      });
    }

    typoMatches.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.value.localeCompare(b.value);
    });

    for (const item of typoMatches.slice(0, 3)) {
      this._pushSuggestion(suggestions, seen, {
        value: item.value,
        label: item.value,
        source: 'typo_correction',
        score: item.distance,
      });

      if (suggestions.length >= parsedLimit) {
        break;
      }
    }

    const bestDidYouMean = typoMatches[0]?.value || null;
    if (bestDidYouMean) {
      const normalizedDidYouMean = this._normalizeSuggestion(bestDidYouMean);
      const existingIndex = suggestions.findIndex(
        suggestion =>
          this._normalizeSuggestion(suggestion.value) === normalizedDidYouMean
      );

      if (existingIndex >= 0) {
        suggestions[existingIndex] = {
          ...suggestions[existingIndex],
          label: `Did you mean "${bestDidYouMean}"?`,
          source: 'did_you_mean',
          didYouMean: true,
        };
      } else {
        suggestions.unshift({
          value: bestDidYouMean,
          label: `Did you mean "${bestDidYouMean}"?`,
          source: 'did_you_mean',
          didYouMean: true,
        });
      }
    }

    if (suggestions.length < 5) {
      const fallbackPopularHistory = await SearchHistory.aggregate([
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
          $limit: 20,
        },
      ]);

      for (const item of fallbackPopularHistory) {
        this._pushSuggestion(suggestions, seen, {
          value: item.query,
          label: item.query,
          source: 'popular_history',
          score: item.count,
        });

        if (suggestions.length >= 5) {
          break;
        }
      }
    }

    if (suggestions.length < 5) {
      const fallbackMedicineMatches = await Medicine.find({ active: true })
        .select('Name alias_name category mgs dosage_form class')
        .populate('category', 'name')
        .populate('class', 'name')
        .sort({ Name: 1 })
        .limit(20)
        .lean();

      for (const medicine of fallbackMedicineMatches) {
        const label = medicine.Name || medicine.alias_name;
        if (!label) continue;

        this._pushSuggestion(suggestions, seen, {
          value: label,
          label,
          source: 'medicine',
          medicineId: medicine._id,
          medicineCategory: medicine.category?.name || null,
          dosageForm: medicine.dosage_form || medicine.mgs || null,
          className: medicine.class?.name || null,
        });

        if (suggestions.length >= 5) {
          break;
        }
      }
    }

    return suggestions.slice(0, parsedLimit);
  }
}

export default new CustomerSearchHistoryService();
