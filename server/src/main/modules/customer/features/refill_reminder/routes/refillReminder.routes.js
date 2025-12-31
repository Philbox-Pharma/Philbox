import express from 'express';
import {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  markAsCompleted,
} from '../controllers/refillReminder.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createRefillReminderDTO,
  updateRefillReminderDTO,
  markCompletedDTO,
} from '../../../../../dto/customer/refillReminder.dto.js';

const router = express.Router();

/**
 * @route   POST /api/customer/refill-reminders
 * @desc    Create a new refill reminder
 * @access  Private (Customer only)
 */
router.post(
  '/',
  authenticate,
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
router.get('/', authenticate, getReminders);

/**
 * @route   GET /api/customer/refill-reminders/:id
 * @desc    Get a single reminder by ID
 * @access  Private (Customer only)
 */
router.get('/:id', authenticate, getReminderById);

/**
 * @route   PUT /api/customer/refill-reminders/:id
 * @desc    Update a reminder
 * @access  Private (Customer only)
 */
router.put(
  '/:id',
  authenticate,
  validate(updateRefillReminderDTO),
  updateReminder
);

/**
 * @route   PATCH /api/customer/refill-reminders/:id/complete
 * @desc    Mark a reminder as completed (deactivate)
 * @access  Private (Customer only)
 */
router.patch(
  '/:id/complete',
  authenticate,
  validate(markCompletedDTO),
  markAsCompleted
);

/**
 * @route   DELETE /api/customer/refill-reminders/:id
 * @desc    Delete a reminder
 * @access  Private (Customer only)
 */
router.delete('/:id', authenticate, deleteReminder);

export default router;
