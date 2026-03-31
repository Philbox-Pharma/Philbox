import CouponService from '../services/coupon.service.js';

class CouponController {
  /**
   * Create a new coupon
   * POST /api/admin/coupons
   */
  async createCoupon(req, res) {
    try {
      const coupon = await CouponService.createCoupon(req.body, req);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all coupons
   * GET /api/admin/coupons
   * Query params: for (appointments|medicine), is_active (true|false), expired (true|false)
   */
  async getAllCoupons(req, res) {
    try {
      const filters = {};

      if (req.query.for) {
        if (!['appointments', 'medicine'].includes(req.query.for)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid 'for' filter. Must be 'appointments' or 'medicine'",
          });
        }
        filters.for = req.query.for;
      }

      if (req.query.is_active !== undefined) {
        filters.is_active = req.query.is_active === 'true';
      }

      if (req.query.expired !== undefined) {
        filters.expired = req.query.expired === 'true';
      }

      const coupons = await CouponService.getAllCoupons(filters, req);

      return res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        count: coupons.length,
        data: coupons,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get a single coupon by ID
   * GET /api/admin/coupons/:id
   */
  async getCouponById(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const coupon = await CouponService.getCouponById(id, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon retrieved successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get coupon by code
   * GET /api/admin/coupons/code/:code
   */
  async getCouponByCode(req, res) {
    try {
      const { code } = req.params;

      if (!code || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required',
        });
      }

      const coupon = await CouponService.getCouponByCode(code, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon retrieved successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon with this code not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update coupon
   * PATCH /api/admin/coupons/:id
   */
  async updateCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const coupon = await CouponService.updateCoupon(id, req.body, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete coupon
   * DELETE /api/admin/coupons/:id
   */
  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const coupon = await CouponService.deleteCoupon(id, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get coupon statistics
   * GET /api/admin/coupons/stats/overview
   */
  async getCouponStats(req, res) {
    try {
      const stats = await CouponService.getCouponStats(req);

      return res.status(200).json({
        success: true,
        message: 'Coupon statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Validate coupon for use
   * POST /api/admin/coupons/validate
   */
  async validateCoupon(req, res) {
    try {
      const { cupon_code, for: couponType } = req.body;

      const result = await CouponService.validateCoupon(
        cupon_code,
        couponType,
        req
      );

      return res.status(200).json({
        success: true,
        message: 'Coupon is valid',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Check coupon usage status by code
   * GET /api/admin/coupons/code/:code/usage
   */
  async checkUsageByCode(req, res) {
    try {
      const { code } = req.params;

      const usage = await CouponService.checkUsageByCode(code, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage retrieved successfully',
        data: usage,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Increment coupon usage counter by code
   * POST /api/admin/coupons/code/:code/increment-usage
   */
  async incrementUsageByCode(req, res) {
    try {
      const { code } = req.params;

      const result = await CouponService.incrementUsageByCode(code, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage incremented successfully',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      if (
        error.message === 'Coupon has been deactivated' ||
        error.message.includes('usage limit reached')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reset coupon usage counter by code
   * POST /api/admin/coupons/code/:code/reset-usage
   */
  async resetUsageByCode(req, res) {
    try {
      const { code } = req.params;

      const coupon = await CouponService.resetUsageByCode(code, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage reset successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Check coupon usage status (legacy - by ID)
   * GET /api/admin/coupons/:id/usage
   */
  async checkUsage(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const usage = await CouponService.checkUsage(id, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage retrieved successfully',
        data: usage,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Increment coupon usage counter (legacy - by ID)
   * POST /api/admin/coupons/:id/increment-usage
   */
  async incrementUsage(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const result = await CouponService.incrementUsage(id, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage incremented successfully',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      if (error.message.includes('usage limit reached')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reset coupon usage counter (legacy - by ID)
   * POST /api/admin/coupons/:id/reset-usage
   */
  async resetUsage(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon ID format',
        });
      }

      const coupon = await CouponService.resetUsage(id, req);

      return res.status(200).json({
        success: true,
        message: 'Coupon usage reset successfully',
        data: coupon,
      });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CouponController();
