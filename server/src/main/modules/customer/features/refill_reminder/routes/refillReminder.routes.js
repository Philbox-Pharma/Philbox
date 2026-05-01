import express from 'express';
import {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  deactivateReminder,
} from '../controllers/refillReminder.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createRefillReminderDTO,
  updateRefillReminderDTO,
  deactivateReminderDTO,
} from '../../../../../dto/customer/refillReminder.dto.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

/**
 * @route   POST /api/customer/refill-reminders
 * @desc    Create a new refill reminder
 * @access  Private (Customer only)
 */
router.post(
  '/',
  rbacMiddleware(['create_refill_reminders']),
  validate(createRefillReminderDTO),
  createReminder
);

/**
 * @route   GET /api/customer/refill-reminders
 * @desc    Get all reminders for the customer
 * @access  Private (Customer only)
 * @query   isActive (optional): true/false - filter by active status
 * @query   page (optional): page number for pagination
 * @query   limit (optional): items per page
 */
router.get('/', rbacMiddleware(['read_refill_reminders']), getReminders);

/**
 * @route   GET /api/customer/refill-reminders/:id
 * @desc    Get a single reminder by ID
 * @access  Private (Customer only)
 */
router.get('/:id', rbacMiddleware(['read_refill_reminders']), getReminderById);

/**
 * @route   PUT /api/customer/refill-reminders/:id
 * @desc    Update a reminder
 * @access  Private (Customer only)
 */
router.put(
  '/:id',
  rbacMiddleware(['update_refill_reminders']),
  validate(updateRefillReminderDTO),
  updateReminder
);

/**
 * @route   PATCH /api/customer/refill-reminders/:id/deactivate
 * @desc    Deactivate a reminder
 * @access  Private (Customer only)
 */
router.patch(
  '/:id/deactivate',
  rbacMiddleware(['deactivate_refill_reminders']),
  validate(deactivateReminderDTO),
  deactivateReminder
);

/**
 * @route   DELETE /api/customer/refill-reminders/:id
 * @desc    Delete a reminder
 * @access  Private (Customer only)
 */
router.delete(
  '/:id',
  rbacMiddleware(['delete_refill_reminders']),
  deleteReminder
);

export default router;
