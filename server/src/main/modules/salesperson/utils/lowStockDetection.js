import StockInHand from '../../../models/StockInHand.js';

const DEFAULT_LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_LEVEL = 5;

const normalizeStockItem = stock => {
  const medicine = stock.medicine_id;
  const threshold = medicine?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  const currentStock = stock.quantity ?? 0;

  return {
    stockId: stock._id?.toString(),
    medicineId: medicine?._id?.toString(),
    medicineName: medicine?.Name || medicine?.name || 'Unknown Medicine',
    currentStock,
    threshold,
    isCritical: currentStock < CRITICAL_STOCK_LEVEL,
    branchId: medicine?.branch_id?.toString() || null,
    alertResolved: Boolean(stock.alertResolved),
    lastAlertSentAt: stock.lastAlertSentAt || null,
    salespersonId: medicine?.salesperson_id?.toString() || null,
  };
};

export const getLowStockItems = async (branchId = null) => {
  const stockDocs = await StockInHand.find()
    .populate({
      path: 'medicine_id',
      select: 'Name name lowStockThreshold branch_id salesperson_id',
    })
    .lean();

  return stockDocs
    .filter(item => item.medicine_id)
    .map(normalizeStockItem)
    .filter(item => {
      if (branchId && item.branchId !== branchId.toString()) {
        return false;
      }

      return item.currentStock <= item.threshold && !item.alertResolved;
    });
};

export const getCriticalStockItems = async (branchId = null) => {
  const lowStockItems = await getLowStockItems(branchId);
  return lowStockItems.filter(item => item.currentStock < CRITICAL_STOCK_LEVEL);
};
