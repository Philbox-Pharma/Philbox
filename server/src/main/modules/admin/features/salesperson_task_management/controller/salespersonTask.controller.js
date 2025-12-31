import sendResponse from '../../../../../utils/sendResponse.js';
import salespersonTaskService from '../services/salespersonTask.service.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const task = await salespersonTaskService.createTask(req.body, req);
    sendResponse(res, 201, 'Task created successfully', task);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};

// Get all tasks with filters
export const getTasks = async (req, res) => {
  try {
    const result = await salespersonTaskService.getTasks(req.query, req);
    sendResponse(res, 200, 'Tasks retrieved successfully', result);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await salespersonTaskService.getTaskById(req.params.id, req);
    sendResponse(res, 200, 'Task retrieved successfully', task);
  } catch (error) {
    sendResponse(res, 404, error.message, null, error.message);
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await salespersonTaskService.updateTask(
      req.params.id,
      req.body,
      req
    );
    sendResponse(res, 200, 'Task updated successfully', task);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};

// Add update/comment to task
export const addTaskUpdate = async (req, res) => {
  try {
    const task = await salespersonTaskService.addTaskUpdate(
      req.params.id,
      req.body,
      req
    );
    sendResponse(res, 200, 'Task update added successfully', task);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const result = await salespersonTaskService.deleteTask(req.params.id, req);
    sendResponse(res, 200, result.message);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};

// Get task statistics
export const getTaskStatistics = async (req, res) => {
  try {
    const stats = await salespersonTaskService.getTaskStatistics(
      req.query,
      req
    );
    sendResponse(res, 200, 'Task statistics retrieved successfully', stats);
  } catch (error) {
    sendResponse(res, 400, error.message, null, error.message);
  }
};
