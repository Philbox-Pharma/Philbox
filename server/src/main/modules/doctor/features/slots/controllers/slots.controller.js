import doctorSlotsService from '../service/slots.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';
import {
  createSlotSchema,
  createRecurringSlotSchema,
  updateSlotSchema,
  getSlotSchema,
} from '../../../../../dto/doctor/slots.dto.js';

/**
 * @desc    Create a single time slot
 * @route   POST /api/doctor/slots
 * @access  Private (Doctor)
 */
export const createSlot = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = createSlotSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const slot = await doctorSlotsService.createSlot(doctorId, value, req);

    return sendResponse(res, 201, 'Time slot created successfully', slot);
  } catch (error) {
    console.error('Error in createSlot:', error);

    if (error.message === 'END_TIME_BEFORE_START') {
      return sendResponse(res, 400, 'End time must be after start time');
    }

    if (error.message === 'SLOT_OVERLAP') {
      return sendResponse(
        res,
        400,
        'This time slot overlaps with an existing slot'
      );
    }

    if (error.message === 'INVALID_SLOT_DURATION_RANGE') {
      return sendResponse(
        res,
        400,
        'Start time and end time difference must exactly match slot duration'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to create time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Create recurring time slots
 * @route   POST /api/doctor/slots/recurring
 * @access  Private (Doctor)
 */
export const createRecurringSlots = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = createRecurringSlotSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const slots = await doctorSlotsService.createRecurringSlots(
      doctorId,
      value,
      req
    );

    return sendResponse(
      res,
      201,
      `${slots.length} recurring time slots created successfully`,
      { count: slots.length, slots }
    );
  } catch (error) {
    console.error('Error in createRecurringSlots:', error);

    if (error.message === 'END_TIME_BEFORE_START') {
      return sendResponse(res, 400, 'End time must be after start time');
    }

    if (error.message === 'INVALID_SLOT_DURATION_RANGE') {
      return sendResponse(
        res,
        400,
        'Start time and end time difference must exactly match slot duration'
      );
    }

    if (error.message === 'RECURRING_SLOT_ALREADY_EXISTS') {
      return sendResponse(
        res,
        400,
        'A recurring slot with same date range and time already exists'
      );
    }

    if (error.message === 'SLOT_OVERLAP') {
      return sendResponse(
        res,
        400,
        'Recurring slot conflicts with an existing slot'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to create recurring slots',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get doctor's time slots with optional filtering
 * @route   GET /api/doctor/slots
 * @access  Private (Doctor)
 */
export const getSlots = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate query parameters
    const { error, value } = getSlotSchema.validate(req.query);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const slots = await doctorSlotsService.getSlots(doctorId, value);

    await logDoctorActivity(
      req,
      'view_slots',
      `Viewed time slots with filters: ${JSON.stringify(value)}`,
      'slots',
      null,
      { filters: value, slotsCount: slots.length }
    );

    return sendResponse(res, 200, 'Time slots retrieved successfully', {
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error('Error in getSlots:', error);

    return sendResponse(
      res,
      500,
      'Failed to retrieve time slots',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get a single time slot by ID
 * @route   GET /api/doctor/slots/:slotId
 * @access  Private (Doctor)
 */
export const getSlotById = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { slotId } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const slot = await doctorSlotsService.getSlotById(doctorId, slotId);

    await logDoctorActivity(
      req,
      'view_slot_details',
      `Viewed time slot details for slot ${slotId}`,
      'slots',
      slotId
    );

    return sendResponse(res, 200, 'Time slot retrieved successfully', slot);
  } catch (error) {
    console.error('Error in getSlotById:', error);

    if (error.message === 'SLOT_NOT_FOUND') {
      return sendResponse(res, 404, 'Time slot not found');
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Update a time slot
 * @route   PUT /api/doctor/slots/:slotId
 * @access  Private (Doctor)
 */
export const updateSlot = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { slotId } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = updateSlotSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    const slot = await doctorSlotsService.updateSlot(
      doctorId,
      slotId,
      value,
      req
    );

    return sendResponse(res, 200, 'Time slot updated successfully', slot);
  } catch (error) {
    console.error('Error in updateSlot:', error);

    if (error.message === 'SLOT_NOT_FOUND') {
      return sendResponse(res, 404, 'Time slot not found');
    }

    if (error.message === 'CANNOT_UPDATE_BOOKED_SLOT') {
      return sendResponse(res, 400, 'Cannot update a booked time slot');
    }

    if (error.message === 'CANNOT_UPDATE_PAST_SLOT') {
      return sendResponse(res, 400, 'Cannot update a past time slot');
    }

    if (error.message === 'END_TIME_BEFORE_START') {
      return sendResponse(res, 400, 'End time must be after start time');
    }

    if (error.message === 'SLOT_OVERLAP') {
      return sendResponse(
        res,
        400,
        'Updated time would overlap with an existing slot'
      );
    }

    return sendResponse(
      res,
      500,
      'Failed to update time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Book a time slot (mark as booked)
 * @route   PATCH /api/doctor/slots/:slotId/book
 * @access  Private (Doctor)
 */
export const bookSlot = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { slotId } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const slot = await doctorSlotsService.updateSlot(
      doctorId,
      slotId,
      { status: 'booked' },
      req
    );

    await logDoctorActivity(
      req,
      'slot_book',
      `Booked time slot ${slotId}`,
      'slots',
      slotId
    );

    return sendResponse(res, 200, 'Time slot booked successfully', slot);
  } catch (error) {
    console.error('Error in bookSlot:', error);

    if (error.message === 'SLOT_NOT_FOUND') {
      return sendResponse(res, 404, 'Time slot not found');
    }

    if (error.message === 'CANNOT_UPDATE_PAST_SLOT') {
      return sendResponse(res, 400, 'Cannot book a past time slot');
    }

    return sendResponse(
      res,
      500,
      'Failed to book time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Unbook a time slot (mark as unbooked)
 * @route   PATCH /api/doctor/slots/:slotId/unbook
 * @access  Private (Doctor)
 */
export const unbookSlot = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { slotId } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const slot = await doctorSlotsService.updateSlot(
      doctorId,
      slotId,
      { status: 'unbooked' },
      req
    );

    await logDoctorActivity(
      req,
      'slot_unbook',
      `Unbooked time slot ${slotId}`,
      'slots',
      slotId
    );

    return sendResponse(res, 200, 'Time slot unbooked successfully', slot);
  } catch (error) {
    console.error('Error in unbookSlot:', error);

    if (error.message === 'SLOT_NOT_FOUND') {
      return sendResponse(res, 404, 'Time slot not found');
    }

    if (error.message === 'CANNOT_UPDATE_PAST_SLOT') {
      return sendResponse(res, 400, 'Cannot unbook a past time slot');
    }

    return sendResponse(
      res,
      500,
      'Failed to unbook time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Delete a time slot
 * @route   DELETE /api/doctor/slots/:slotId
 * @access  Private (Doctor)
 */
export const deleteSlot = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { slotId } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    await doctorSlotsService.deleteSlot(doctorId, slotId, req);

    return sendResponse(res, 200, 'Time slot deleted successfully');
  } catch (error) {
    console.error('Error in deleteSlot:', error);

    if (error.message === 'SLOT_NOT_FOUND') {
      return sendResponse(res, 404, 'Time slot not found');
    }

    if (error.message === 'CANNOT_DELETE_BOOKED_SLOT') {
      return sendResponse(res, 400, 'Cannot delete a booked time slot');
    }

    if (error.message === 'CANNOT_DELETE_PAST_SLOT') {
      return sendResponse(res, 400, 'Cannot delete a past time slot');
    }

    return sendResponse(
      res,
      500,
      'Failed to delete time slot',
      null,
      error.message
    );
  }
};

/**
 * @desc    Get calendar view of slots (monthly)
 * @route   GET /api/doctor/slots/calendar/:year/:month
 * @access  Private (Doctor)
 */
export const getCalendarView = async (req, res) => {
  try {
    const doctorId = req.session.doctorId || req.user?.id;
    const { year, month } = req.params;

    if (!doctorId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return sendResponse(res, 400, 'Invalid year or month');
    }

    const calendar = await doctorSlotsService.getCalendarView(
      doctorId,
      yearNum,
      monthNum
    );

    await logDoctorActivity(
      req,
      'view_calendar',
      `Viewed calendar for ${monthNum}/${yearNum}`,
      'slots',
      null,
      { year: yearNum, month: monthNum }
    );

    return sendResponse(res, 200, 'Calendar view retrieved successfully', {
      year: yearNum,
      month: monthNum,
      calendar,
    });
  } catch (error) {
    console.error('Error in getCalendarView:', error);

    return sendResponse(
      res,
      500,
      'Failed to retrieve calendar view',
      null,
      error.message
    );
  }
};
