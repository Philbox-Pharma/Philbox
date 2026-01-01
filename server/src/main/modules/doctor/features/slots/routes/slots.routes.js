import express from 'express';
import {
  createSlot,
  createRecurringSlots,
  getSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  markSlotUnavailable,
  getCalendarView,
} from '../controllers/slots.controller.js';
import { authenticate as requireDoctorAuth } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require doctor authentication
router.use(requireDoctorAuth);

/**
 * @route   POST /api/doctor/slots
 * @desc    Create a single time slot
 * @access  Private (Doctor)
 */
router.post('/', createSlot);

/**
 * @route   POST /api/doctor/slots/recurring
 * @desc    Create recurring time slots
 * @access  Private (Doctor)
 */
router.post('/recurring', createRecurringSlots);

/**
 * @route   GET /api/doctor/slots
 * @desc    Get all time slots with optional filtering
 * @access  Private (Doctor)
 * @query   start_date, end_date, status
 */
router.get('/', getSlots);

/**
 * @route   GET /api/doctor/slots/calendar/:year/:month
 * @desc    Get calendar view of slots for a specific month
 * @access  Private (Doctor)
 */
router.get('/calendar/:year/:month', getCalendarView);

/**
 * @route   GET /api/doctor/slots/:slotId
 * @desc    Get a single time slot by ID
 * @access  Private (Doctor)
 */
router.get('/:slotId', getSlotById);

/**
 * @route   PUT /api/doctor/slots/:slotId
 * @desc    Update a time slot (only unbooked, future slots)
 * @access  Private (Doctor)
 */
router.put('/:slotId', updateSlot);

/**
 * @route   PATCH /api/doctor/slots/:slotId/unavailable
 * @desc    Mark a slot as unavailable
 * @access  Private (Doctor)
 */
router.patch('/:slotId/unavailable', markSlotUnavailable);

/**
 * @route   DELETE /api/doctor/slots/:slotId
 * @desc    Delete a time slot (only unbooked, future slots)
 * @access  Private (Doctor)
 */
router.delete('/:slotId', deleteSlot);

export default router;
