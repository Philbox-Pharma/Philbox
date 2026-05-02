import AnnouncementService from '../services/announcement.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

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

      return sendResponse(
        res,
        201,
        'Announcement created successfully',
        announcement
      );
    } catch (error) {
      return sendResponse(res, 500, error.message);
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

      return sendResponse(res, 200, 'Announcements retrieved successfully', {
        announcements: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return sendResponse(res, 500, error.message);
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

      return sendResponse(
        res,
        200,
        'Announcement retrieved successfully',
        announcement
      );
    } catch (error) {
      return sendResponse(
        res,
        error.message.includes('not found') ? 404 : 500,
        error.message
      );
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

      return sendResponse(
        res,
        200,
        'Announcement updated successfully',
        announcement
      );
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('only update draft')
          ? 400
          : 500;

      return sendResponse(res, statusCode, error.message);
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

      return sendResponse(res, 200, 'Announcement sent successfully', {
        announcement: result.announcement,
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

      return sendResponse(res, statusCode, error.message);
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

      return sendResponse(
        res,
        200,
        'Announcement cancelled successfully',
        announcement
      );
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Cannot cancel')
          ? 400
          : 500;

      return sendResponse(res, statusCode, error.message);
    }
  }

  /**
   * Delete announcement
   * DELETE /api/admin/announcements/:id
   */
  async deleteAnnouncement(req, res) {
    try {
      await AnnouncementService.deleteAnnouncement(req.params.id, req);

      return sendResponse(res, 200, 'Announcement deleted successfully');
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Cannot delete')
          ? 400
          : 500;

      return sendResponse(res, statusCode, error.message);
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

      return sendResponse(
        res,
        200,
        'Delivery history retrieved successfully',
        history
      );
    } catch (error) {
      return sendResponse(
        res,
        error.message.includes('not found') ? 404 : 500,
        error.message
      );
    }
  }
}

export default new AnnouncementController();
