import AnnouncementService from '../services/announcement.service.js';

class AnnouncementController {
  /**
   * Create a new announcement
   * POST /api/admin/announcements
   */
  async createAnnouncement(req, res) {
    try {
      const announcement = await AnnouncementService.createAnnouncement(
        req.body,
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all announcements
   * GET /api/admin/announcements?status=draft&target_audience=customers&skip=0&limit=20
   */
  async getAnnouncements(req, res) {
    try {
      const filters = {
        status: req.query.status,
        target_audience: req.query.target_audience,
        skip: req.query.skip,
        limit: req.query.limit,
      };

      const result = await AnnouncementService.getAnnouncements(filters, req);

      return res.status(200).json({
        success: true,
        message: 'Announcements retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get announcement by ID
   * GET /api/admin/announcements/:id
   */
  async getAnnouncementById(req, res) {
    try {
      const announcement = await AnnouncementService.getAnnouncementById(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: 'Announcement retrieved successfully',
        data: announcement,
      });
    } catch (error) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update announcement
   * PUT /api/admin/announcements/:id
   */
  async updateAnnouncement(req, res) {
    try {
      const announcement = await AnnouncementService.updateAnnouncement(
        req.params.id,
        req.body,
        req
      );

      return res.status(200).json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement,
      });
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('only update draft')
          ? 400
          : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Send announcement
   * POST /api/admin/announcements/:id/send
   */
  async sendAnnouncement(req, res) {
    try {
      const io = req.app.get('io');
      const result = await AnnouncementService.sendAnnouncement(
        req.params.id,
        req,
        io
      );

      return res.status(200).json({
        success: true,
        message: 'Announcement sent successfully',
        data: result.announcement,
        delivery_results: result.deliveryResults,
      });
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Cannot send')
          ? 400
          : error.message.includes('No active recipients')
            ? 400
            : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cancel announcement
   * POST /api/admin/announcements/:id/cancel
   */
  async cancelAnnouncement(req, res) {
    try {
      const announcement = await AnnouncementService.cancelAnnouncement(
        req.params.id,
        req
      );

      return res.status(200).json({
        success: true,
        message: 'Announcement cancelled successfully',
        data: announcement,
      });
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Cannot cancel')
          ? 400
          : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete announcement
   * DELETE /api/admin/announcements/:id
   */
  async deleteAnnouncement(req, res) {
    try {
      await AnnouncementService.deleteAnnouncement(req.params.id, req);

      return res.status(200).json({
        success: true,
        message: 'Announcement deleted successfully',
      });
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Cannot delete')
          ? 400
          : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get announcement delivery history
   * GET /api/admin/announcements/:id/delivery-history
   */
  async getDeliveryHistory(req, res) {
    try {
      const history = await AnnouncementService.getDeliveryHistory(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: 'Delivery history retrieved successfully',
        data: history,
      });
    } catch (error) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AnnouncementController();
