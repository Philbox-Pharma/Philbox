import refillReminderService from '../service/refillReminder.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';

/**
 * Create a new refill reminder
 */
export const createReminder = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await refillReminderService.createReminder(
      customerId,
      req.body,
      req
    );

    return sendResponse(res, 201, result.message, result.reminder);
  } catch (err) {
    console.error('Create Reminder Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Get all reminders for the customer
 */
export const getReminders = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await refillReminderService.getReminders(
      customerId,
      req.query
    );

    return sendResponse(res, 200, 'Reminders fetched successfully', result);
  } catch (err) {
    console.error('Get Reminders Error:', err);
    return sendResponse(res, 500, 'Server Error', null, err.message);
  }
};

/**
 * Get a single reminder by ID
 */
export const getReminderById = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const reminder = await refillReminderService.getReminderById(
      customerId,
      id
    );

    return sendResponse(res, 200, 'Reminder fetched successfully', reminder);
  } catch (err) {
    console.error('Get Reminder By ID Error:', err);
    const statusCode = err.message === 'Reminder not found' ? 404 : 500;
    return sendResponse(res, statusCode, err.message);
  }
};

/**
 * Update a reminder
 */
export const updateReminder = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await refillReminderService.updateReminder(
      customerId,
      id,
      req.body,
      req
    );

    return sendResponse(res, 200, result.message, result.reminder);
  } catch (err) {
    console.error('Update Reminder Error:', err);
    const statusCode = err.message === 'Reminder not found' ? 404 : 500;
    return sendResponse(res, statusCode, err.message);
  }
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await refillReminderService.deleteReminder(
      customerId,
      id,
      req
    );

    return sendResponse(res, 200, result.message);
  } catch (err) {
    console.error('Delete Reminder Error:', err);
    const statusCode = err.message === 'Reminder not found' ? 404 : 500;
    return sendResponse(res, statusCode, err.message);
  }
};

/**
 * Mark reminder as completed
 */
export const markAsCompleted = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await refillReminderService.markAsCompleted(
      customerId,
      id,
      req
    );

    return sendResponse(res, 200, result.message, result.reminder);
  } catch (err) {
    console.error('Mark Completed Error:', err);
    const statusCode = err.message === 'Reminder not found' ? 404 : 500;
    return sendResponse(res, statusCode, err.message);
  }
};
