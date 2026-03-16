import Salesperson from '../../../../../models/Salesperson.js';
import SalespersonTask from '../../../../../models/SalespersonTask.js';
import SalespersonActivityLog from '../../../../../models/SalespersonActivityLog.js';
import Order from '../../../../../models/Order.js';
import StockInHand from '../../../../../models/StockInHand.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';

const QUICK_ACTIONS = [
  { label: 'View Tasks', route: '/salesperson/tasks' },
  { label: 'Process Orders', route: '/salesperson/orders' },
  { label: 'View Inventory', route: '/salesperson/inventory' },
  { label: 'My Profile', route: '/salesperson/profile' },
];

export const getDashboardData = async (req, activityLimit = 10) => {
  const salespersonId = req.salesperson._id;

  const salesperson = await Salesperson.findById(salespersonId)
    .select('fullName profile_img_url')
    .lean();

  if (!salesperson) {
    throw new Error('SALESPERSON_NOT_FOUND');
  }

  const [
    pendingTasksCount,
    ordersToProcessCount,
    lowStockAlertsCount,
    recentActivity,
  ] = await Promise.all([
    SalespersonTask.countDocuments({
      salesperson_id: salespersonId,
      status: 'pending',
    }),
    Order.countDocuments({
      salesperson_id: salespersonId,
      status: { $in: ['pending', 'processing'] },
    }),
    StockInHand.countDocuments({
      quantity: { $lte: 10 },
    }),
    SalespersonActivityLog.find({
      salesperson_id: salespersonId,
    })
      .sort({ created_at: -1 })
      .limit(activityLimit)
      .select('action_type description created_at')
      .lean(),
  ]);

  await logSalespersonActivity(
    req,
    'DASHBOARD_VIEWED',
    'Viewed salesperson dashboard',
    'salespersons',
    salespersonId
  );

  return {
    salesperson: {
      name: salesperson.fullName || '',
      profilePicture: salesperson.profile_img_url || '',
    },
    stats: {
      pendingTasksCount,
      lowStockAlertsCount,
      ordersToProcessCount,
    },
    recentActivity: recentActivity.map(item => ({
      action: item.action_type,
      description: item.description,
      createdAt: item.created_at,
    })),
    quickActions: QUICK_ACTIONS,
    welcomeMessage: `Welcome, ${salesperson.fullName || 'Salesperson'}`,
  };
};
