import Customer from '../../../../../../models/Customer.js';
import DailyMedicineRecommendations from '../../../../../../models/DailyMedicineRecommendations.js';
import MedicineCatalogService from '../../../../../customer/features/medicine_catalog/service/catalog.service.js';
import { logAdminActivity } from '../../../../utils/logAdminActivities.js';

class AdminMedicineRecommendationsService {
  _startOfToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }

  _nextDailyRefreshAt() {
    const next = this._startOfToday();
    next.setDate(next.getDate() + 1);
    return next;
  }

  _parseLimit(limit) {
    return Math.max(5, Math.min(Number(limit) || 8, 20));
  }

  async _upsertRecommendationSnapshot(customerId, date, limit) {
    const recommendationResult =
      await MedicineCatalogService.getMedicineRecommendations(customerId, {
        limit,
      });

    const recommendations = recommendationResult?.data?.recommendations || [];

    const snapshot = await DailyMedicineRecommendations.findOneAndUpdate(
      {
        customer_id: customerId,
        date,
      },
      {
        $set: {
          recommendations,
          count: recommendations.length,
          generated_at: new Date(),
          generated_source: 'system',
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return {
      snapshot,
      recommendations,
    };
  }

  async getCustomerRecommendations(customerId, query = {}, req) {
    const limit = this._parseLimit(query.limit);

    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const date = this._startOfToday();
    const cachedSnapshot = await DailyMedicineRecommendations.findOne({
      customer_id: customerId,
      date,
    }).lean();

    if (cachedSnapshot?.recommendations?.length) {
      if (req?.admin?._id) {
        await logAdminActivity(
          req,
          'view_customer_medicine_recommendations',
          `Viewed cached medicine recommendations for customer ${customerId}`,
          'daily_medicine_recommendations',
          cachedSnapshot._id
        );
      }

      return {
        customerId,
        recommendations: cachedSnapshot.recommendations.slice(0, limit),
        count: Math.min(cachedSnapshot.recommendations.length, limit),
        updatedAt: cachedSnapshot.generated_at || cachedSnapshot.updated_at,
        nextDailyRefreshAt: this._nextDailyRefreshAt(),
        source: 'daily_cache',
      };
    }

    const { snapshot: updatedSnapshot, recommendations } =
      await this._upsertRecommendationSnapshot(customerId, date, limit);

    if (req?.admin?._id) {
      await logAdminActivity(
        req,
        'view_customer_medicine_recommendations',
        `Generated medicine recommendations for customer ${customerId}`,
        'daily_medicine_recommendations',
        updatedSnapshot._id
      );
    }

    return {
      customerId,
      recommendations,
      count: recommendations.length,
      updatedAt: updatedSnapshot.generated_at,
      nextDailyRefreshAt: this._nextDailyRefreshAt(),
      source: 'daily_generation',
    };
  }

  async refreshAllDailyRecommendations(limit = 8, maxCustomers = 1000) {
    const parsedLimit = this._parseLimit(limit);
    const parsedMaxCustomers = Math.max(
      1,
      Math.min(Number(maxCustomers) || 1000, 5000)
    );
    const customers = await Customer.find({})
      .sort({ created_at: -1 })
      .select('_id')
      .limit(parsedMaxCustomers)
      .lean();

    const date = this._startOfToday();
    let refreshed = 0;

    for (const customer of customers) {
      await this._upsertRecommendationSnapshot(customer._id, date, parsedLimit);
      refreshed += 1;
    }

    return {
      refreshedCustomers: refreshed,
      date,
      limit: parsedLimit,
      maxCustomers: parsedMaxCustomers,
      nextDailyRefreshAt: this._nextDailyRefreshAt(),
    };
  }

  _buildRecommendationKey(recommendation = {}) {
    return [
      recommendation?._id,
      recommendation?.Name,
      recommendation?.alias_name,
      recommendation?.mgs,
      recommendation?.dosage_form,
      recommendation?.manufacturer,
      recommendation?.category,
    ]
      .map(value => this._normalizeText(value))
      .join('|');
  }

  async getRecommendationInsights(query = {}, req) {
    const limit = this._parseLimit(query.limit);
    const days = Math.max(1, Math.min(Number(query.days) || 30, 365));

    const startDate = this._startOfToday();
    startDate.setDate(startDate.getDate() - (days - 1));
    const endDate = this._startOfToday();

    const snapshots = await DailyMedicineRecommendations.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1, generated_at: 1 })
      .lean();

    const chronologicalSnapshots = snapshots.map(snapshot => ({
      date: snapshot.date,
      customer_id: snapshot.customer_id,
      count: snapshot.count || snapshot.recommendations?.length || 0,
      generated_at: snapshot.generated_at || snapshot.updated_at,
      generated_source: snapshot.generated_source || 'system',
      recommendations: Array.isArray(snapshot.recommendations)
        ? snapshot.recommendations
        : [],
    }));

    const aggregateMap = new Map();

    for (const snapshot of snapshots) {
      for (const recommendation of snapshot.recommendations || []) {
        const key = this._buildRecommendationKey(recommendation);
        if (!key) continue;

        const existing = aggregateMap.get(key) || {
          recommendation,
          count: 0,
          lastSeenAt: snapshot.generated_at || snapshot.date,
        };

        existing.count += 1;

        const snapshotSeenAt = new Date(
          snapshot.generated_at || snapshot.date
        ).getTime();
        const currentSeenAt = new Date(existing.lastSeenAt).getTime();
        if (snapshotSeenAt > currentSeenAt) {
          existing.lastSeenAt = snapshot.generated_at || snapshot.date;
        }

        aggregateMap.set(key, existing);
      }
    }

    const mostCommonRecommendations = [...aggregateMap.values()]
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        const nameA = String(a.recommendation?.Name || '').toLowerCase();
        const nameB = String(b.recommendation?.Name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .slice(0, limit)
      .map(item => ({
        ...this._sanitizeRecommendationMedicine(item.recommendation),
        count: item.count,
        lastSeenAt: item.lastSeenAt,
      }));

    if (req?.admin?._id) {
      await logAdminActivity(
        req,
        'view_medicine_recommendation_insights',
        'Viewed medicine recommendation insights',
        'daily_medicine_recommendations',
        null,
        { days, limit }
      );
    }

    return {
      dateRange: {
        startDate,
        endDate,
        days,
      },
      chronologicalSnapshots,
      mostCommonRecommendations,
      totalSnapshots: snapshots.length,
      totalCommonRecommendations: mostCommonRecommendations.length,
    };
  }
}

export default new AdminMedicineRecommendationsService();
