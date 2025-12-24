import SalespersonTask from '../../../../../../models/SalespersonTask.js';
import Salesperson from '../../../../../../models/Salesperson.js';

/**
 * Get tasks completion statistics for salespersons
 * Shows completed vs assigned tasks per salesperson
 */
export const getTasksCompletionStats = async (
  filters,
  adminCategory,
  adminBranchesManaged
) => {
  const matchStage = {};

  // Apply branch filter for branch-admin
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    matchStage.branch_id = { $in: adminBranchesManaged };
  } else if (filters.branch_id) {
    matchStage.branch_id = filters.branch_id;
  }

  // Apply salesperson filter
  if (filters.salesperson_id) {
    matchStage.salesperson_id = filters.salesperson_id;
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    matchStage.created_at = {};
    if (filters.startDate) {
      matchStage.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.created_at.$lte = new Date(filters.endDate);
    }
  }

  const stats = await SalespersonTask.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$salesperson_id',
        totalAssigned: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: Salesperson.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'salesperson',
      },
    },
    { $unwind: { path: '$salesperson', preserveNullAndEmptyArrays: true } },
    { $match: { salesperson: { $ne: null } } },
    {
      $project: {
        salesperson_id: '$_id',
        salesperson: {
          _id: '$salesperson._id',
          fullName: '$salesperson.fullName',
          email: '$salesperson.email',
        },
        totalAssigned: 1,
        completed: 1,
        pending: 1,
        inProgress: 1,
        cancelled: 1,
        completionRate: {
          $cond: [
            { $eq: ['$totalAssigned', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completed', '$totalAssigned'] },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { completionRate: -1 } },
  ]);

  return stats;
};

/**
 * Get salesperson leaderboard ranked by task completion
 */
export const getSalespersonLeaderboard = async (
  filters,
  adminCategory,
  adminBranchesManaged
) => {
  const matchStage = {};

  // Apply branch filter for branch-admin
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    matchStage.branch_id = { $in: adminBranchesManaged };
  } else if (filters.branch_id) {
    matchStage.branch_id = filters.branch_id;
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    matchStage.created_at = {};
    if (filters.startDate) {
      matchStage.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.created_at.$lte = new Date(filters.endDate);
    }
  }

  const leaderboard = await SalespersonTask.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$salesperson_id',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        pendingTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: Salesperson.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'salesperson',
      },
    },
    { $unwind: { path: '$salesperson', preserveNullAndEmptyArrays: true } },
    { $match: { salesperson: { $ne: null } } },
    {
      $project: {
        salesperson_id: '$_id',
        salesperson: {
          _id: '$salesperson._id',
          fullName: '$salesperson.fullName',
          email: '$salesperson.email',
          contactNumber: '$salesperson.contactNumber',
        },
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        inProgressTasks: 1,
        completionRate: {
          $cond: [
            { $eq: ['$totalTasks', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { completedTasks: -1, completionRate: -1 } },
  ]);

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  return rankedLeaderboard;
};

/**
 * Get task performance trends over time (grouped by date)
 */
export const getTaskPerformanceTrends = async (
  filters,
  adminCategory,
  adminBranchesManaged
) => {
  const matchStage = {};

  // Apply branch filter for branch-admin
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    matchStage.branch_id = { $in: adminBranchesManaged };
  } else if (filters.branch_id) {
    matchStage.branch_id = filters.branch_id;
  }

  // Apply salesperson filter
  if (filters.salesperson_id) {
    matchStage.salesperson_id = filters.salesperson_id;
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    matchStage.created_at = {};
    if (filters.startDate) {
      matchStage.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.created_at.$lte = new Date(filters.endDate);
    }
  }

  const trends = await SalespersonTask.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
        totalTasks: { $sum: '$count' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        totalTasks: 1,
        completed: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this.status', 'completed'] },
                },
              },
              as: 'status',
              in: '$$status.count',
            },
          },
        },
        pending: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this.status', 'pending'] },
                },
              },
              as: 'status',
              in: '$$status.count',
            },
          },
        },
        inProgress: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this.status', 'in-progress'] },
                },
              },
              as: 'status',
              in: '$$status.count',
            },
          },
        },
        cancelled: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$statuses',
                  cond: { $eq: ['$$this.status', 'cancelled'] },
                },
              },
              as: 'status',
              in: '$$status.count',
            },
          },
        },
      },
    },
  ]);

  return trends;
};

/**
 * Get average task completion time by priority
 */
export const getAverageCompletionTimeByPriority = async (
  filters,
  adminCategory,
  adminBranchesManaged
) => {
  const matchStage = {
    status: 'completed',
  };

  // Apply branch filter for branch-admin
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    matchStage.branch_id = { $in: adminBranchesManaged };
  } else if (filters.branch_id) {
    matchStage.branch_id = filters.branch_id;
  }

  // Apply salesperson filter
  if (filters.salesperson_id) {
    matchStage.salesperson_id = filters.salesperson_id;
  }

  // Apply date range filter for completion
  if (filters.startDate || filters.endDate) {
    matchStage.updated_at = {};
    if (filters.startDate) {
      matchStage.updated_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.updated_at.$lte = new Date(filters.endDate);
    }
  }

  const completionTimes = await SalespersonTask.aggregate([
    { $match: matchStage },
    {
      $project: {
        priority: 1,
        completionTimeHours: {
          $divide: [
            { $subtract: ['$updated_at', '$created_at'] },
            1000 * 60 * 60, // Convert milliseconds to hours
          ],
        },
      },
    },
    {
      $group: {
        _id: '$priority',
        averageCompletionTimeHours: { $avg: '$completionTimeHours' },
        totalTasks: { $sum: 1 },
        minCompletionTimeHours: { $min: '$completionTimeHours' },
        maxCompletionTimeHours: { $max: '$completionTimeHours' },
      },
    },
    {
      $project: {
        priority: '$_id',
        averageCompletionTimeHours: {
          $round: ['$averageCompletionTimeHours', 2],
        },
        averageCompletionTimeDays: {
          $round: [{ $divide: ['$averageCompletionTimeHours', 24] }, 2],
        },
        totalTasks: 1,
        minCompletionTimeHours: { $round: ['$minCompletionTimeHours', 2] },
        maxCompletionTimeHours: { $round: ['$maxCompletionTimeHours', 2] },
      },
    },
    { $sort: { priority: 1 } },
  ]);

  // Ensure all priorities are represented
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const result = priorities.map(priority => {
    const found = completionTimes.find(ct => ct.priority === priority);
    return (
      found || {
        priority,
        averageCompletionTimeHours: 0,
        averageCompletionTimeDays: 0,
        totalTasks: 0,
        minCompletionTimeHours: 0,
        maxCompletionTimeHours: 0,
      }
    );
  });

  return result;
};

/**
 * Get comprehensive performance overview
 */
export const getPerformanceOverview = async (
  filters,
  adminCategory,
  adminBranchesManaged
) => {
  const matchStage = {};

  // Apply branch filter for branch-admin
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    matchStage.branch_id = { $in: adminBranchesManaged };
  } else if (filters.branch_id) {
    matchStage.branch_id = filters.branch_id;
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    matchStage.created_at = {};
    if (filters.startDate) {
      matchStage.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchStage.created_at.$lte = new Date(filters.endDate);
    }
  }

  // Task statistics
  const taskStats = await SalespersonTask.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        pendingTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$deadline', new Date()] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        inProgressTasks: 1,
        overdueTasks: 1,
        completionRate: {
          $cond: [
            { $eq: ['$totalTasks', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
  ]);

  // Active salespersons count
  const salespersonMatchStage = {};
  if (adminCategory === 'branch-admin' && adminBranchesManaged?.length > 0) {
    salespersonMatchStage.branches_to_be_managed = {
      $in: adminBranchesManaged,
    };
  } else if (filters.branch_id) {
    salespersonMatchStage.branches_to_be_managed = filters.branch_id;
  }

  const activeSalespersons = await Salesperson.countDocuments(
    salespersonMatchStage
  );

  return {
    tasks: taskStats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
    },
    activeSalespersons,
  };
};
