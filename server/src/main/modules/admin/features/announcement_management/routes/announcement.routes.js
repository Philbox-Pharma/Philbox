import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createAnnouncementDTO,
  updateAnnouncementDTO,
  getAnnouncementsDTO,
  sendAnnouncementDTO,
} from '../../../../../dto/admin/announcement.dto.js';
import AnnouncementController from '../controller/announcement.controller.js';

const router = express.Router();

/**
 * Admin Announcement Management Routes
 * Base: /api/admin/announcements
 */

// Apply authentication to all routes
router.use(authenticate);
router.use(isSuperAdmin);

/**
 * Create a new announcement
 * POST /api/admin/announcements
 */
router.post('/', validate(createAnnouncementDTO), (req, res) =>
  AnnouncementController.createAnnouncement(req, res)
);

/**
 * Get all announcements with optional filters
 * GET /api/admin/announcements?status=draft&target_audience=customers&skip=0&limit=20
 */
router.get('/', validate(getAnnouncementsDTO, 'query'), (req, res) =>
  AnnouncementController.getAnnouncements(req, res)
);

/**
 * Get announcement by ID
 * GET /api/admin/announcements/:id
 */
router.get('/:id', (req, res) =>
  AnnouncementController.getAnnouncementById(req, res)
);

/**
 * Update announcement (only draft announcements)
 * PUT /api/admin/announcements/:id
 */
router.put('/:id', validate(updateAnnouncementDTO), (req, res) =>
  AnnouncementController.updateAnnouncement(req, res)
);

/**
 * Get announcement delivery history
 * GET /api/admin/announcements/:id/delivery-history
 */
router.get('/:id/delivery-history', (req, res) =>
  AnnouncementController.getDeliveryHistory(req, res)
);

/**
 * Send announcement
 * POST /api/admin/announcements/:id/send
 */
router.post('/:id/send', validate(sendAnnouncementDTO), (req, res) =>
  AnnouncementController.sendAnnouncement(req, res)
);

/**
 * Cancel announcement
 * POST /api/admin/announcements/:id/cancel
 */
router.post('/:id/cancel', (req, res) =>
  AnnouncementController.cancelAnnouncement(req, res)
);

/**
 * Delete announcement
 * DELETE /api/admin/announcements/:id
 */
router.delete('/:id', (req, res) =>
  AnnouncementController.deleteAnnouncement(req, res)
);

export default router;
