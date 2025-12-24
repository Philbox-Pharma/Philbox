import SalespersonTask from '../../../../../models/SalespersonTask.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import {
  emitToAdmin,
  emitToBranch,
} from '../../../../../config/socket.config.js';

class SalespersonTaskService {
  /**
   * Get all tasks assigned to the salesperson
   */
  async getMyTasks(query, req) {
    try {
      const {
        status,
        priority,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = query;

      const filter = {
        salesperson_id: req.salesperson._id,
      };

      // Apply status filter
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      // Date range filter
      if (startDate || endDate) {
        filter.created_at = {};
        if (startDate) filter.created_at.$gte = new Date(startDate);
        if (endDate) filter.created_at.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        SalespersonTask.find(filter)
          .populate('assigned_by_admin_id', 'name email category')
          .populate('branch_id', 'name code')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        SalespersonTask.countDocuments(filter),
      ]);

      await logSalespersonActivity(
        req,
        'view_my_tasks',
        'Viewed assigned tasks list',
        'salespersontasks',
        null
      );

      return {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get task by ID (only if assigned to this salesperson)
   */
  async getTaskById(taskId, req) {
    try {
      const task = await SalespersonTask.findOne({
        _id: taskId,
        salesperson_id: req.salesperson._id,
      })
        .populate('assigned_by_admin_id', 'name email category')
        .populate('branch_id', 'name code')
        .lean();

      if (!task) {
        throw new Error('Task not found or access denied');
      }

      await logSalespersonActivity(
        req,
        'view_task_details',
        `Viewed task details: ${task.title}`,
        'salespersontasks',
        taskId
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, data, req) {
    try {
      const { status } = data;

      const task = await SalespersonTask.findOne({
        _id: taskId,
        salesperson_id: req.salesperson._id,
      });

      if (!task) {
        throw new Error('Task not found or access denied');
      }

      const oldStatus = task.status;
      task.status = status;
      await task.save();

      // Populate for response
      await task.populate([
        { path: 'assigned_by_admin_id', select: 'name email category' },
        { path: 'branch_id', select: 'name code' },
      ]);

      // Emit socket event to admin
      emitToAdmin(
        task.assigned_by_admin_id._id.toString(),
        'task:status_updated',
        {
          taskId: task._id,
          salespersonId: req.salesperson._id,
          salespersonName: req.salesperson.fullName,
          oldStatus,
          newStatus: status,
          title: task.title,
          timestamp: new Date(),
        }
      );

      // Emit to branch room
      emitToBranch(task.branch_id._id.toString(), 'task:status_updated', {
        taskId: task._id,
        salespersonId: req.salesperson._id,
        oldStatus,
        newStatus: status,
      });

      await logSalespersonActivity(
        req,
        'update_task_status',
        `Updated task status from ${oldStatus} to ${status}: ${task.title}`,
        'salespersontasks',
        taskId,
        { changes: { oldStatus, newStatus: status } }
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add update/comment to task
   */
  async addTaskUpdate(taskId, updateData, req) {
    try {
      const task = await SalespersonTask.findOne({
        _id: taskId,
        salesperson_id: req.salesperson._id,
      });

      if (!task) {
        throw new Error('Task not found or access denied');
      }

      // Add update
      task.updates.push({
        updated_by: req.salesperson._id,
        role: 'salesperson',
        message: updateData.message,
        updated_at: new Date(),
      });

      await task.save();

      // Populate for response
      await task.populate([
        { path: 'assigned_by_admin_id', select: 'name email category' },
        { path: 'branch_id', select: 'name code' },
      ]);

      // Emit socket event to admin
      emitToAdmin(
        task.assigned_by_admin_id._id.toString(),
        'task:comment_added',
        {
          taskId: task._id,
          salespersonId: req.salesperson._id,
          salespersonName: req.salesperson.fullName,
          message: updateData.message,
          title: task.title,
          timestamp: new Date(),
        }
      );

      // Emit to branch room
      emitToBranch(task.branch_id._id.toString(), 'task:comment_added', {
        taskId: task._id,
        salespersonId: req.salesperson._id,
        message: updateData.message,
      });

      await logSalespersonActivity(
        req,
        'add_task_comment',
        `Added comment to task: ${task.title}`,
        'salespersontasks',
        taskId,
        { comment: updateData.message }
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get task statistics for the salesperson
   */
  async getMyTaskStatistics(query, req) {
    try {
      const { startDate, endDate } = query;

      const filter = {
        salesperson_id: req.salesperson._id,
      };

      if (startDate || endDate) {
        filter.created_at = {};
        if (startDate) filter.created_at.$gte = new Date(startDate);
        if (endDate) filter.created_at.$lte = new Date(endDate);
      }

      const [statusStats, priorityStats, totalTasks, overdueTasks] =
        await Promise.all([
          SalespersonTask.aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ]),
          SalespersonTask.aggregate([
            { $match: filter },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
          ]),
          SalespersonTask.countDocuments(filter),
          SalespersonTask.countDocuments({
            ...filter,
            deadline: { $lt: new Date() },
            status: { $in: ['pending', 'in-progress'] },
          }),
        ]);

      const stats = {
        totalTasks,
        overdueTasks,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };

      await logSalespersonActivity(
        req,
        'view_my_task_statistics',
        'Viewed personal task statistics',
        'salespersontasks',
        null
      );

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

export default new SalespersonTaskService();
