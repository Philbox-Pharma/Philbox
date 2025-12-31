import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  addTaskUpdate,
  deleteTask,
  getTaskStatistics,
} from '../controller/salespersonTask.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createTaskDTO,
  updateTaskDTO,
  addTaskUpdateDTO,
  queryTasksDTO,
  getStatisticsDTO,
} from '../../../../../dto/admin/salespersonTask.dto.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get task statistics
router.get(
  '/statistics',
  validate(getStatisticsDTO, 'query'),
  getTaskStatistics
);

// Get all tasks with filters
router.get('/', validate(queryTasksDTO, 'query'), getTasks);

// Get task by ID
router.get('/:id', getTaskById);

// Create a new task
router.post('/', validate(createTaskDTO, 'body'), createTask);

// Update task
router.put('/:id', validate(updateTaskDTO, 'body'), updateTask);

// Add update/comment to task
router.post('/:id/updates', validate(addTaskUpdateDTO, 'body'), addTaskUpdate);

// Delete task
router.delete('/:id', deleteTask);

export default router;
