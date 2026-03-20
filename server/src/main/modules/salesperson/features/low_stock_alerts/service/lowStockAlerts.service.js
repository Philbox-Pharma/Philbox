import mongoose from 'mongoose';
import Salesperson from '../../../../../models/Salesperson.js';
import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Branch from '../../../../../models/Branch.js';
import { sendEmail } from '../../../../../utils/sendEmail.js';
import { paginate } from '../../../../../utils/paginate.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import {
  getLowStockItems,
  getCriticalStockItems,
} from '../../../utils/lowStockDetection.js';

const CRITICAL_STOCK_LEVEL = 5;
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const ensureSalespersonHasBranchAccess = async (salespersonId, branchId) => {
  if (!branchId) return true;

  const salesperson = await Salesperson.findById(salespersonId)
    .select('branches_to_be_managed')
    .lean();

  if (!salesperson) return false;

  return salesperson.branches_to_be_managed?.some(
    id => id.toString() === branchId.toString()
  );
};

const getManagedBranchIds = async salespersonId => {
  const salesperson = await Salesperson.findById(salespersonId)
    .select('branches_to_be_managed')
    .lean();

  if (!salesperson) {
    return [];
  }

  return (salesperson.branches_to_be_managed || []).map(id => id.toString());
};

export const sendCriticalStockEmail = async stockItem => {
  if (!stockItem || stockItem.currentStock >= CRITICAL_STOCK_LEVEL) {
    return { sent: false, reason: 'not_critical' };
  }

  const stockDoc = await StockInHand.findById(stockItem.stockId).lean();
  if (!stockDoc) {
    return { sent: false, reason: 'stock_not_found' };
  }

  const now = Date.now();
  const lastSentAt = stockDoc.lastAlertSentAt
    ? new Date(stockDoc.lastAlertSentAt).getTime()
    : null;

  if (lastSentAt && now - lastSentAt < ALERT_COOLDOWN_MS) {
    return { sent: false, reason: 'cooldown_active' };
  }

  const medicine = await Medicine.findById(stockItem.medicineId)
    .select('Name branch_id salesperson_id')
    .lean();

  if (!medicine || !medicine.salesperson_id) {
    return { sent: false, reason: 'medicine_or_salesperson_missing' };
  }

  const salesperson = await Salesperson.findById(medicine.salesperson_id)
    .select('email fullName')
    .lean();

  if (!salesperson?.email) {
    return { sent: false, reason: 'salesperson_email_missing' };
  }

  const branch = medicine.branch_id
    ? await Branch.findById(medicine.branch_id).select('name code').lean()
    : null;

  const subject = `Critical Low Stock Alert: ${stockItem.medicineName}`;
  const html = `
    <h2>Critical Low Stock Alert</h2>
    <p>Dear ${salesperson.fullName || 'Salesperson'},</p>
    <p>The following medicine has reached a critical stock level.</p>
    <ul>
      <li><strong>Medicine:</strong> ${stockItem.medicineName}</li>
      <li><strong>Current Quantity:</strong> ${stockItem.currentStock}</li>
      <li><strong>Critical Level:</strong> ${CRITICAL_STOCK_LEVEL}</li>
      <li><strong>Branch:</strong> ${branch?.name || 'N/A'} (${branch?.code || 'N/A'})</li>
    </ul>
    <p><strong>Suggestion:</strong> Please reorder this medicine immediately to avoid stock-out.</p>
  `;

  await sendEmail(salesperson.email, subject, html);

  await StockInHand.findByIdAndUpdate(stockItem.stockId, {
    $set: { lastAlertSentAt: new Date() },
  });

  return { sent: true };
};

const triggerCriticalStockEmails = async (
  branchId,
  managedBranchIds = null
) => {
  const criticalItems = await getCriticalStockItems(branchId);
  const scopedItems = managedBranchIds
    ? criticalItems.filter(item => managedBranchIds.includes(item.branchId))
    : criticalItems;
  await Promise.all(scopedItems.map(item => sendCriticalStockEmail(item)));
};

export const getLowStockAlerts = async (req, query) => {
  const { branchId = null, page = 1, limit = 10 } = query;
  const managedBranchIds = await getManagedBranchIds(req.salesperson._id);

  if (branchId) {
    const hasAccess = await ensureSalespersonHasBranchAccess(
      req.salesperson._id,
      branchId
    );
    if (!hasAccess) {
      throw { status: 403, message: 'Access denied for this branch' };
    }
  }

  await triggerCriticalStockEmails(branchId, managedBranchIds);

  const lowStockItems = (await getLowStockItems(branchId)).filter(item =>
    managedBranchIds.includes(item.branchId)
  );
  const ids = lowStockItems.map(
    item => new mongoose.Types.ObjectId(item.stockId)
  );

  if (ids.length === 0) {
    return {
      alerts: [],
      pagination: {
        total: 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    };
  }

  const paginated = await paginate(
    StockInHand,
    { _id: { $in: ids } },
    page,
    limit,
    [
      {
        path: 'medicine_id',
        select: 'Name lowStockThreshold branch_id',
      },
    ],
    { quantity: 1 },
    ''
  );

  const alertMap = new Map(lowStockItems.map(item => [item.stockId, item]));
  const alerts = paginated.list
    .map(doc => alertMap.get(doc._id.toString()))
    .filter(Boolean)
    .map(item => ({
      stockId: item.stockId,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      currentStock: item.currentStock,
      threshold: item.threshold,
      isCritical: item.isCritical,
      branchId: item.branchId,
    }));

  return {
    alerts,
    pagination: {
      total: lowStockItems.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    },
  };
};

export const getLowStockAlertsCount = async (req, branchId = null) => {
  const managedBranchIds = await getManagedBranchIds(req.salesperson._id);

  if (branchId) {
    const hasAccess = await ensureSalespersonHasBranchAccess(
      req.salesperson._id,
      branchId
    );
    if (!hasAccess) {
      throw { status: 403, message: 'Access denied for this branch' };
    }
  }

  await triggerCriticalStockEmails(branchId, managedBranchIds);

  const [lowStockItems, criticalStockItems] = await Promise.all([
    getLowStockItems(branchId),
    getCriticalStockItems(branchId),
  ]);

  const scopedLowStockItems = lowStockItems.filter(item =>
    managedBranchIds.includes(item.branchId)
  );
  const scopedCriticalStockItems = criticalStockItems.filter(item =>
    managedBranchIds.includes(item.branchId)
  );

  return {
    lowStockCount: scopedLowStockItems.length,
    criticalStockCount: scopedCriticalStockItems.length,
  };
};

export const resolveLowStockAlert = async (req, stockId) => {
  const stock = await StockInHand.findById(stockId)
    .populate({
      path: 'medicine_id',
      select: 'Name lowStockThreshold branch_id',
    })
    .lean();

  if (!stock || !stock.medicine_id) {
    throw { status: 404, message: 'Stock item not found' };
  }

  const hasAccess = await ensureSalespersonHasBranchAccess(
    req.salesperson._id,
    stock.medicine_id.branch_id
  );
  if (!hasAccess) {
    throw { status: 403, message: 'Access denied for this branch' };
  }

  const threshold = stock.medicine_id.lowStockThreshold ?? 10;
  if ((stock.quantity ?? 0) <= threshold) {
    throw {
      status: 400,
      message: 'Cannot resolve: stock still below threshold',
    };
  }

  await StockInHand.findByIdAndUpdate(stockId, {
    $set: { alertResolved: true },
  });

  await logSalespersonActivity(
    req,
    'resolve_low_stock_alert',
    `Resolved low stock alert for ${stock.medicine_id.Name}`,
    'stockinhands',
    stock._id,
    {
      threshold,
      currentStock: stock.quantity,
    }
  );

  return {
    stockId,
    resolved: true,
  };
};

export const updateMedicineThreshold = async (req, medicineId, threshold) => {
  const medicine = await Medicine.findById(medicineId)
    .select('Name branch_id lowStockThreshold')
    .lean();

  if (!medicine) {
    throw { status: 404, message: 'Medicine not found' };
  }

  const hasAccess = await ensureSalespersonHasBranchAccess(
    req.salesperson._id,
    medicine.branch_id
  );
  if (!hasAccess) {
    throw { status: 403, message: 'Access denied for this branch' };
  }

  await Medicine.findByIdAndUpdate(medicineId, {
    $set: { lowStockThreshold: threshold },
  });

  const stock = await StockInHand.findOne({ medicine_id: medicineId }).lean();
  if (stock && (stock.quantity ?? 0) > threshold && stock.alertResolved) {
    await StockInHand.findByIdAndUpdate(stock._id, {
      $set: { alertResolved: false },
    });
  }

  await logSalespersonActivity(
    req,
    'update_low_stock_threshold',
    `Updated low stock threshold for ${medicine.Name} from ${medicine.lowStockThreshold ?? 10} to ${threshold}`,
    'medicineitems',
    medicineId,
    {
      previousThreshold: medicine.lowStockThreshold ?? 10,
      updatedThreshold: threshold,
    }
  );

  return {
    medicineId,
    threshold,
  };
};
