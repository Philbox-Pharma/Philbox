import salespersonTaskService from '../services/task.service.js';
import {
  updateTaskStatusDto,
  addTaskUpdateDto,
} from '../../../../../dto/salesperson/task.dto.js';

class SalespersonTaskController {
  /**
   * Get all tasks assigned to the salesperson
   */
  async getMyTasks(req, res, next) {
    try {
      const result = await salespersonTaskService.getMyTasks(req.query, req);
      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(req, res, next) {
    try {
      const task = await salespersonTaskService.getTaskById(
        req.params.taskId,
        req
      );
      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(req, res, next) {
    try {
      // Validate request body
      const { error, value } = updateTaskStatusDto.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
      }

      const task = await salespersonTaskService.updateTaskStatus(
        req.params.taskId,
        value,
        req
      );

      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add update/comment to task
   */
  async addTaskUpdate(req, res, next) {
    try {
      // Validate request body
      const { error, value } = addTaskUpdateDto.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
      }

      const task = await salespersonTaskService.addTaskUpdate(
        req.params.taskId,
        value,
        req
      );

      res.status(200).json({
        success: true,
        message: 'Task update added successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task statistics
   */
  async getMyTaskStatistics(req, res, next) {
    try {
      const stats = await salespersonTaskService.getMyTaskStatistics(
        req.query,
        req
      );
      res.status(200).json({
        success: true,
        message: 'Task statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SalespersonTaskController();
