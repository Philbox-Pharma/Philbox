import SalespersonTask from '../../../../../models/SalespersonTask.js';
import Salesperson from '../../../../../models/Salesperson.js';
import Branch from '../../../../../models/Branch.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class SalespersonTaskService {
  /**
   * Create a new task for a salesperson
   */
  async createTask(data, req) {
    try {
      const {
        salesperson_id,
        branch_id,
        title,
        description,
        priority,
        deadline,
      } = data;

      // Verify salesperson exists and belongs to the branch
      const salesperson = await Salesperson.findOne({
        _id: salesperson_id,
        branches_to_be_managed: branch_id,
        status: 'active',
      });

      if (!salesperson) {
        throw new Error('Salesperson not found or does not manage this branch');
      }

      // Verify branch exists
      const branch = await Branch.findById(branch_id);
      if (!branch) {
        throw new Error('Branch not found');
      }

      // For branch-admin, verify they manage this branch
      if (req.admin.category === 'branch-admin') {
        const managesBranch = branch.under_administration_of.some(
          adminId => adminId.toString() === req.admin._id.toString()
        );

        if (!managesBranch) {
          throw new Error(
            'You do not have permission to assign tasks to this branch'
          );
        }
      }

      // Create task
      const task = await SalespersonTask.create({
        assigned_by_admin_id: req.admin._id,
        assigned_by_role: req.admin.category,
        salesperson_id,
        branch_id,
        title,
        description,
        priority,
        deadline: new Date(deadline),
        status: 'pending',
      });

      // Populate references
      await task.populate([
        { path: 'assigned_by_admin_id', select: 'name email category' },
        { path: 'salesperson_id', select: 'fullName email phone' },
        { path: 'branch_id', select: 'name code' },
      ]);

      await logAdminActivity(
        req,
        'create_salesperson_task',
        `Created task "${title}" for salesperson ${salesperson.fullName}`,
        'salesperson_tasks',
        task._id,
        { task_details: { title, priority, deadline } }
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all tasks with filters
   */
  async getTasks(query, req) {
    try {
      const {
        salesperson_id,
        branch_id,
        status,
        priority,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = query;

      const filter = {};

      // Branch admin can only see tasks from their branches
      if (req.admin.category === 'branch-admin') {
        const branches = await Branch.find({
          under_administration_of: req.admin._id,
        }).select('_id');
        filter.branch_id = { $in: branches.map(b => b._id) };
      }

      // Apply filters
      if (salesperson_id) filter.salesperson_id = salesperson_id;
      if (branch_id) {
        if (filter.branch_id) {
          // Ensure branch_id is in allowed branches
          if (!filter.branch_id.$in.some(id => id.toString() === branch_id)) {
            throw new Error('Access denied to this branch');
          }
        }
        filter.branch_id = branch_id;
      }
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
          .populate('salesperson_id', 'fullName email phone')
          .populate('branch_id', 'name code')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        SalespersonTask.countDocuments(filter),
      ]);

      await logAdminActivity(
        req,
        'view_salesperson_tasks',
        'Viewed salesperson tasks list',
        'salesperson_tasks',
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
   * Get task by ID
   */
  async getTaskById(taskId, req) {
    try {
      const task = await SalespersonTask.findById(taskId)
        .populate('assigned_by_admin_id', 'name email category')
        .populate('salesperson_id', 'fullName email phone branch_id')
        .populate('branch_id', 'name code under_administration_of')
        .lean();

      if (!task) {
        throw new Error('Task not found');
      }

      // Check access permissions
      if (req.admin.category === 'branch-admin') {
        const managesBranch = task.branch_id.under_administration_of.some(
          adminId => adminId.toString() === req.admin._id.toString()
        );

        if (!managesBranch) {
          throw new Error('Access denied to this task');
        }
      }

      await logAdminActivity(
        req,
        'view_salesperson_task',
        `Viewed task details: ${task.title}`,
        'salesperson_tasks',
        taskId
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, data, req) {
    try {
      const task = await SalespersonTask.findById(taskId).populate(
        'branch_id',
        'under_administration_of'
      );

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permissions
      if (req.admin.category === 'branch-admin') {
        const managesBranch = task.branch_id.under_administration_of.some(
          adminId => adminId.toString() === req.admin._id.toString()
        );

        if (!managesBranch) {
          throw new Error('Access denied to update this task');
        }
      }

      // Update allowed fields
      const { title, description, priority, deadline, status } = data;

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (deadline !== undefined) task.deadline = new Date(deadline);
      if (status !== undefined) task.status = status;

      await task.save();

      // Populate for response
      await task.populate([
        { path: 'assigned_by_admin_id', select: 'name email category' },
        { path: 'salesperson_id', select: 'fullName email phone' },
        { path: 'branch_id', select: 'name code' },
      ]);

      await logAdminActivity(
        req,
        'update_salesperson_task',
        `Updated task: ${task.title}`,
        'salesperson_tasks',
        taskId,
        { changes: data }
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
      const task = await SalespersonTask.findById(taskId).populate(
        'branch_id',
        'under_administration_of'
      );

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permissions
      if (req.admin.category === 'branch-admin') {
        const managesBranch = task.branch_id.under_administration_of.some(
          adminId => adminId.toString() === req.admin._id.toString()
        );

        if (!managesBranch) {
          throw new Error('Access denied to update this task');
        }
      }

      // Add update
      task.updates.push({
        updated_by: req.admin._id,
        role: 'admin',
        message: updateData.message,
        updated_at: new Date(),
      });

      await task.save();

      // Populate for response
      await task.populate([
        { path: 'assigned_by_admin_id', select: 'name email category' },
        { path: 'salesperson_id', select: 'fullName email phone' },
        { path: 'branch_id', select: 'name code' },
      ]);

      await logAdminActivity(
        req,
        'add_task_update',
        `Added update to task: ${task.title}`,
        'salesperson_tasks',
        taskId,
        { update: updateData.message }
      );

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, req) {
    try {
      const task = await SalespersonTask.findById(taskId).populate(
        'branch_id',
        'under_administration_of'
      );

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permissions
      if (req.admin.category === 'branch-admin') {
        const managesBranch = task.branch_id.under_administration_of.some(
          adminId => adminId.toString() === req.admin._id.toString()
        );

        if (!managesBranch) {
          throw new Error('Access denied to delete this task');
        }
      }

      await task.deleteOne();

      await logAdminActivity(
        req,
        'delete_salesperson_task',
        `Deleted task: ${task.title}`,
        'salesperson_tasks',
        taskId
      );

      return { message: 'Task deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(query, req) {
    try {
      const { branch_id, salesperson_id, startDate, endDate } = query;

      const filter = {};

      // Branch admin can only see stats from their branches
      if (req.admin.category === 'branch-admin') {
        const branches = await Branch.find({
          under_administration_of: req.admin._id,
        }).select('_id');
        filter.branch_id = { $in: branches.map(b => b._id) };
      }

      if (branch_id) filter.branch_id = branch_id;
      if (salesperson_id) filter.salesperson_id = salesperson_id;

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

      await logAdminActivity(
        req,
        'view_task_statistics',
        'Viewed task statistics',
        'salesperson_tasks',
        null
      );

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

export default new SalespersonTaskService();
