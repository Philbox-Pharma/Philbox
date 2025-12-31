import express from 'express';
import salespersonTaskController from '../controllers/task.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all tasks assigned to salesperson
router.get('/', salespersonTaskController.getMyTasks);

// Get task statistics
router.get('/statistics', salespersonTaskController.getMyTaskStatistics);

// Get task by ID
router.get('/:taskId', salespersonTaskController.getTaskById);

// Update task status
router.put('/:taskId/status', salespersonTaskController.updateTaskStatus);

// Add update/comment to task
router.post('/:taskId/updates', salespersonTaskController.addTaskUpdate);

export default router;
