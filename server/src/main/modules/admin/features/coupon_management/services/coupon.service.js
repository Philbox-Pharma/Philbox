import Coupon from '../../../../../models/Coupon.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class CouponService {
  /**
   * Calculate usage statistics for a coupon
   */
  _calculateUsageStats(coupon) {
    const remaining =
      coupon.max_use_limit && coupon.max_use_limit > 0
        ? coupon.max_use_limit - coupon.times_used
        : null;

    const usagePercentage =
      coupon.max_use_limit && coupon.max_use_limit > 0
        ? Math.round((coupon.times_used / coupon.max_use_limit) * 100)
        : null;

    return {
      times_used: coupon.times_used,
      max_use_limit: coupon.max_use_limit,
      remaining: remaining,
      usage_percentage: usagePercentage,
      is_limit_reached: coupon.max_use_limit
        ? coupon.times_used >= coupon.max_use_limit
        : false,
    };
  }

  /**
   * Create a new coupon
   */
  async createCoupon(couponData, req) {
    try {
      const coupon = new Coupon(couponData);
      await coupon.save();

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'create_coupon',
          `Created coupon ${coupon.cupon_code} for ${coupon.for} with ${coupon.percent_off}% off`,
          'coupons',
          coupon._id,
          {
            coupon_data: {
              cupon_code: coupon.cupon_code,
              for: coupon.for,
              percent_off: coupon.percent_off,
              expiry_time: coupon.expiry_time,
            },
          }
        );
      }

      return coupon;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          `Coupon code '${couponData.cupon_code}' already exists`
        );
      }
      throw error;
    }
  }

  /**
   * Get all coupons with optional filters
   */
  async getAllCoupons(filters = {}, req) {
    try {
      const query = {};

      // Filter by type
      if (filters.for) {
        query.for = filters.for;
      }

      // Filter by active status
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }

      // Filter by expiry status
      if (filters.expired === true) {
        query.expiry_time = { $lt: new Date() };
      } else if (filters.expired === false) {
        query.expiry_time = { $gte: new Date() };
      }

      const coupons = await Coupon.find(query)
        .sort({ created_at: -1 })
        .select('-__v');

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'view_coupons',
          `Viewed coupon list (${coupons.length} coupons)`,
          'coupons',
          null,
          { filters }
        );
      }

      return coupons;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single coupon by ID
   */
  async getCouponById(couponId, req) {
    try {
      const coupon = await Coupon.findById(couponId).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      if (req) {
        await logAdminActivity(
          req,
          'view_coupon',
          `Viewed coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id
        );
      }

      return coupon;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code, req) {
    try {
      const coupon = await Coupon.findOne({
        cupon_code: code.toUpperCase(),
      }).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      if (req) {
        await logAdminActivity(
          req,
          'view_coupon_by_code',
          `Viewed coupon by code ${coupon.cupon_code}`,
          'coupons',
          coupon._id
        );
      }

      return coupon;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coupon
   */
  async updateCoupon(couponId, updateData, req) {
    try {
      // Don't allow updating coupon code
      if (updateData.cupon_code) {
        throw new Error('Coupon code cannot be updated');
      }

      const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
        new: true,
        runValidators: true,
      }).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'update_coupon',
          `Updated coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          {
            updated_fields: Object.keys(updateData),
            update_data: updateData,
          }
        );
      }

      return coupon;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId, req) {
    try {
      const coupon = await Coupon.findByIdAndDelete(couponId).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'delete_coupon',
          `Deleted coupon ${coupon.cupon_code}`,
          'coupons',
          couponId,
          {
            deleted_coupon: {
              cupon_code: coupon.cupon_code,
              for: coupon.for,
              percent_off: coupon.percent_off,
            },
          }
        );
      }

      return coupon;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(req) {
    try {
      const totalCoupons = await Coupon.countDocuments();
      const activeCoupons = await Coupon.countDocuments({
        is_active: true,
        expiry_time: { $gte: new Date() },
      });
      const expiredCoupons = await Coupon.countDocuments({
        expiry_time: { $lt: new Date() },
      });

      const byType = await Coupon.aggregate([
        {
          $group: {
            _id: '$for',
            count: { $sum: 1 },
          },
        },
      ]);

      if (req) {
        await logAdminActivity(
          req,
          'view_coupon_stats',
          'Viewed coupon statistics overview',
          'coupons',
          null
        );
      }

      return {
        total: totalCoupons,
        active: activeCoupons,
        expired: expiredCoupons,
        by_type: byType,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate coupon for use
   */
  async validateCoupon(couponCode, type, req) {
    try {
      const coupon = await Coupon.findOne({
        cupon_code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      if (!coupon.is_active) {
        throw new Error('Coupon has been deactivated');
      }

      if (coupon.expiry_time < new Date()) {
        throw new Error('Coupon has expired');
      }

      if (coupon.for !== type) {
        throw new Error(`Coupon is not valid for ${type}`);
      }

      // Check usage limit
      if (coupon.max_use_limit && coupon.times_used >= coupon.max_use_limit) {
        throw new Error(
          `Coupon usage limit reached (${coupon.times_used}/${coupon.max_use_limit})`
        );
      }

      if (req) {
        await logAdminActivity(
          req,
          'validate_coupon',
          `Validated coupon ${coupon.cupon_code} for ${type}`,
          'coupons',
          coupon._id,
          {
            coupon_type: type,
            percent_off: coupon.percent_off,
            times_used: coupon.times_used,
            max_use_limit: coupon.max_use_limit,
          }
        );
      }

      return {
        valid: true,
        percent_off: coupon.percent_off,
        coupon,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check coupon usage status by code
   */
  async checkUsageByCode(couponCode, req) {
    try {
      const coupon = await Coupon.findOne({
        cupon_code: couponCode.toUpperCase(),
      }).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'check_coupon_usage_by_code',
          `Checked usage for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          stats
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Increment usage counter for a coupon by code
   */
  async incrementUsageByCode(couponCode, req) {
    try {
      const coupon = await Coupon.findOne({
        cupon_code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      if (!coupon.is_active) {
        throw new Error('Coupon has been deactivated');
      }

      // Check if limit is already reached
      if (coupon.max_use_limit && coupon.times_used >= coupon.max_use_limit) {
        throw new Error(
          `Coupon usage limit reached (${coupon.times_used}/${coupon.max_use_limit})`
        );
      }

      coupon.times_used += 1;
      await coupon.save();

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'increment_coupon_usage',
          `Incremented usage for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          stats
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset usage counter for a coupon by code
   */
  async resetUsageByCode(couponCode, req) {
    try {
      const coupon = await Coupon.findOneAndUpdate(
        { cupon_code: couponCode.toUpperCase() },
        { times_used: 0 },
        { new: true }
      ).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'reset_coupon_usage',
          `Reset usage counter for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          { reset_to: 0, ...stats }
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check coupon usage status (legacy - by ID)
   */
  async checkUsage(couponId, req) {
    try {
      const coupon = await Coupon.findById(couponId).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'check_coupon_usage',
          `Checked usage for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          stats
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Increment usage counter for a coupon (legacy - by ID)
   */
  async incrementUsage(couponId, req) {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Check if limit is already reached
      if (coupon.max_use_limit && coupon.times_used >= coupon.max_use_limit) {
        throw new Error(
          `Coupon usage limit reached (${coupon.times_used}/${coupon.max_use_limit})`
        );
      }

      coupon.times_used += 1;
      await coupon.save();

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'increment_coupon_usage',
          `Incremented usage for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          stats
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset usage counter for a coupon (legacy - by ID)
   */
  async resetUsage(couponId, req) {
    try {
      const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        { times_used: 0 },
        { new: true }
      ).select('-__v');

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const stats = this._calculateUsageStats(coupon);

      if (req) {
        await logAdminActivity(
          req,
          'reset_coupon_usage',
          `Reset usage counter for coupon ${coupon.cupon_code}`,
          'coupons',
          coupon._id,
          { reset_to: 0, ...stats }
        );
      }

      return {
        coupon_code: coupon.cupon_code,
        ...stats,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new CouponService();
