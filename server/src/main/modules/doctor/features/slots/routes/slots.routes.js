import express from 'express';
import {
  createSlot,
  createRecurringSlots,
  getSlots,
  getSlotById,
  updateSlot,
  bookSlot,
  unbookSlot,
  deleteSlot,
  getCalendarView,
} from '../controllers/slots.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { isApprovedDoctor } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);
router.use(isApprovedDoctor);
router.use(roleMiddleware(['doctor']));

/**
 * @route   POST /api/doctor/slots
 * @desc    Create a single time slot
 * @access  Private (Doctor)
 */
router.post('/', rbacMiddleware(['create_slots']), createSlot);

/**
 * @route   POST /api/doctor/slots/recurring
 * @desc    Create recurring time slots
 * @access  Private (Doctor)
 */
router.post(
  '/recurring',
  rbacMiddleware(['create_slots']),
  createRecurringSlots
);

/**
 * @route   GET /api/doctor/slots
 * @desc    Get all time slots with optional filtering
 * @access  Private (Doctor)
 * @query   start_date, end_date, status
 */
router.get('/', rbacMiddleware(['read_slots']), getSlots);

/**
 * @route   GET /api/doctor/slots/calendar/:year/:month
 * @desc    Get calendar view of slots for a specific month
 * @access  Private (Doctor)
 */
router.get(
  '/calendar/:year/:month',
  rbacMiddleware(['read_slots']),
  getCalendarView
);

/**
 * @route   GET /api/doctor/slots/:slotId
 * @desc    Get a single time slot by ID
 * @access  Private (Doctor)
 */
router.get('/:slotId', rbacMiddleware(['read_slots']), getSlotById);

/**
 * @route   PUT /api/doctor/slots/:slotId
 * @desc    Update a time slot (only unbooked, future slots)
 * @access  Private (Doctor)
 */
router.put('/:slotId', rbacMiddleware(['update_slots']), updateSlot);

/**
 * @route   PATCH /api/doctor/slots/:slotId/book
 * @desc    Book a time slot (mark as booked)
 * @access  Private (Doctor)
 */
router.patch('/:slotId/book', rbacMiddleware(['update_slots']), bookSlot);

/**
 * @route   PATCH /api/doctor/slots/:slotId/unbook
 * @desc    Unbook a time slot (mark as unbooked)
 * @access  Private (Doctor)
 */
router.patch('/:slotId/unbook', rbacMiddleware(['update_slots']), unbookSlot);

/**
 * @route   DELETE /api/doctor/slots/:slotId
 * @desc    Delete a time slot (only unbooked, future slots)
 * @access  Private (Doctor)
 */
router.delete('/:slotId', rbacMiddleware(['delete_slots']), deleteSlot);

export default router;
