import * as XLSX from 'xlsx';
import mongoose from 'mongoose';

import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import InventoryFilesLog from '../../../../../models/InventoryFilesLog.js';
import UploadedInventoryFile from '../../../../../models/UploadedInventoryFile.js';
import Salesperson from '../../../../../models/Salesperson.js';
import { paginate } from '../../../../../utils/paginate.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';

const escapeRegex = value =>
  String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw {
      status: 400,
      message: `Invalid ${fieldName}`,
    };
  }
};

const getSalespersonBranches = async salespersonId => {
  const salesperson = await Salesperson.findById(salespersonId)
    .select('branches_to_be_managed')
    .lean();

  const branches = salesperson?.branches_to_be_managed || [];
  if (!branches.length) {
    throw {
      status: 400,
      message: 'No branch assigned to salesperson',
    };
  }

  return branches.map(branch => String(branch));
};

const resolveBranchId = async (salespersonId, requestedBranchId) => {
  const managedBranchIds = await getSalespersonBranches(salespersonId);
  const defaultBranchId = managedBranchIds[0];

  if (!requestedBranchId) {
    return defaultBranchId;
  }

  assertValidObjectId(requestedBranchId, 'branch_id');
  if (!managedBranchIds.includes(String(requestedBranchId))) {
    throw {
      status: 403,
      message: 'Salesperson is not allowed to access this branch inventory',
    };
  }

  return String(requestedBranchId);
};

const mapPagination = result => ({
  total: result.total,
  page: result.currentPage,
  limit: result.limit,
  totalPages: result.totalPages,
});

const buildMedicineFilters = ({ search, category, branchId }) => {
  const filter = {
    branch_id: branchId,
    is_available: { $ne: false },
  };

  if (category) {
    filter.medicine_category = category;
  }

  if (search) {
    const keyword = escapeRegex(search.trim());
    filter.$or = [
      { Name: { $regex: keyword, $options: 'i' } },
      { alias_name: { $regex: keyword, $options: 'i' } },
      { medicine_category: { $regex: keyword, $options: 'i' } },
    ];
  }

  return filter;
};

const combineMedicineAndStock = (medicine, stockRecord) => {
  const quantity = stockRecord?.quantity ?? 0;
  const stockValue = stockRecord?.stockValue ?? 0;
  const packQty = stockRecord?.packQty ?? 0;
  const alertResolved = stockRecord?.alertResolved ?? false;
  const lowStockThreshold = medicine.lowStockThreshold ?? 10;

  return {
    ...medicine,
    stock: {
      quantity,
      stockValue,
      packQty,
      alertResolved,
    },
    isCritical: quantity < 5,
    isLowStock: quantity <= lowStockThreshold,
  };
};

class InventoryService {
  async listInventory(query, req) {
    const {
      search,
      branch_id,
      category,
      page = 1,
      limit = 20,
      sortBy = 'Name',
      sortOrder = 'asc',
    } = query;

    const branchId = await resolveBranchId(req.salesperson._id, branch_id);
    const filter = buildMedicineFilters({ search, category, branchId });
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const result = await paginate(
      Medicine,
      filter,
      Number(page),
      Number(limit),
      [{ path: 'class', select: 'name' }],
      sort,
      ''
    );

    const medicineIds = result.list.map(medicine => medicine._id);

    const stocks = await StockInHand.find({
      medicine_id: { $in: medicineIds },
      branch_id: branchId,
    }).lean();

    const stockMap = new Map(
      stocks.map(stock => [String(stock.medicine_id), stock])
    );

    const medicines = result.list.map(medicine => {
      const medicineObj = medicine.toObject ? medicine.toObject() : medicine;
      return combineMedicineAndStock(
        medicineObj,
        stockMap.get(String(medicineObj._id))
      );
    });

    return {
      medicines,
      pagination: mapPagination(result),
    };
  }

  async getMedicineDetails(medicineId, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicine = await Medicine.findOne({
      _id: medicineId,
      branch_id: branchId,
    })
      .populate('class', 'name')
      .lean();

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const stock = await StockInHand.findOne({
      medicine_id: medicineId,
      branch_id: branchId,
    }).lean();

    const auditLogs = await InventoryFilesLog.find({
      target_medicine: medicineId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('uploaded_inventory_file', 'file_url uploaded_at file_type')
      .lean();

    return {
      ...combineMedicineAndStock(medicine, stock),
      auditLogs,
    };
  }

  async updateStock(medicineId, payload, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicine = await Medicine.findOne({
      _id: medicineId,
      branch_id: branchId,
    }).lean();

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const stockRecord = await StockInHand.findOneAndUpdate(
      {
        medicine_id: medicineId,
        branch_id: branchId,
      },
      {
        $set: {
          quantity: payload.quantity,
        },
        $setOnInsert: {
          medicine_id: medicineId,
          branch_id: branchId,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const latestUploadedFile = await UploadedInventoryFile.findOne({
      salesperson_id: req.salesperson._id,
      branch_id: branchId,
    })
      .sort({ uploaded_at: -1, _id: -1 })
      .select('_id');

    let inventoryLogCreated = false;

    if (latestUploadedFile?._id) {
      await InventoryFilesLog.create({
        uploaded_inventory_file: latestUploadedFile._id,
        status: 'resolved',
        target_medicine: medicineId,
        stock: stockRecord._id,
        issue: payload.reason || 'Manual stock update',
        action: null,
        retryCount: 0,
        last_attempt: new Date(),
      });
      inventoryLogCreated = true;
    }

    await logSalespersonActivity(
      req,
      'STOCK_UPDATED',
      `Updated stock for ${medicine.Name} to ${payload.quantity}`,
      'stockinhands',
      stockRecord._id,
      {
        medicineId,
        quantity: payload.quantity,
        reason: payload.reason || null,
      }
    );

    return {
      stock: stockRecord,
      inventoryLogCreated,
    };
  }

  async discontinueMedicine(medicineId, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicine = await Medicine.findOneAndUpdate(
      {
        _id: medicineId,
        branch_id: branchId,
      },
      {
        $set: { is_available: false },
      },
      { new: true }
    ).lean();

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    await logSalespersonActivity(
      req,
      'MEDICINE_DISCONTINUED',
      `Discontinued medicine ${medicine.Name}`,
      'medicineitems',
      medicine._id,
      { is_available: false }
    );

    return medicine;
  }

  async softDeleteMedicine(medicineId, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicine = await Medicine.findOneAndUpdate(
      {
        _id: medicineId,
        branch_id: branchId,
      },
      {
        $set: { is_available: false },
      },
      { new: true }
    ).lean();

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    await logSalespersonActivity(
      req,
      'MEDICINE_DELETED',
      `Soft deleted medicine ${medicine.Name}`,
      'medicineitems',
      medicine._id,
      { is_available: false }
    );

    return {
      message: 'Medicine deleted successfully',
    };
  }

  async getMedicineAuditLogs(medicineId, query, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicineExists = await Medicine.exists({
      _id: medicineId,
      branch_id: branchId,
    });

    if (!medicineExists) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);

    const result = await paginate(
      InventoryFilesLog,
      { target_medicine: medicineId },
      page,
      limit,
      [
        {
          path: 'uploaded_inventory_file',
          select: 'file_url uploaded_at file_type',
        },
      ],
      { createdAt: -1 },
      ''
    );

    return {
      logs: result.list,
      pagination: mapPagination(result),
    };
  }

  async exportInventory(req) {
    const branchId = await resolveBranchId(req.salesperson._id, null);

    const medicines = await Medicine.find({
      branch_id: branchId,
      is_available: { $ne: false },
    })
      .populate('class', 'name')
      .lean();

    const stocks = await StockInHand.find({
      branch_id: branchId,
      medicine_id: { $in: medicines.map(medicine => medicine._id) },
    }).lean();

    const stockMap = new Map(
      stocks.map(stock => [String(stock.medicine_id), stock])
    );

    const rows = medicines.map(medicine => {
      const stock = stockMap.get(String(medicine._id));
      return {
        Name: medicine.Name || '',
        aliasname: medicine.alias_name || '',
        active: medicine.is_available ?? true,
        saleprice: medicine.sale_price ?? 0,
        purprice: medicine.purchase_price ?? 0,
        PackUnits: medicine.pack_unit ?? 1,
        QTY: stock?.quantity ?? 0,
        classname: medicine.class?.name || '',
        Category: medicine.medicine_category || '',
        UnitPrice: medicine.sale_price ?? 0,
        PackQty: stock?.packQty ?? 0,
        StockValue: stock?.stockValue ?? 0,
      };
    });

    const sheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        'Name',
        'aliasname',
        'active',
        'saleprice',
        'purprice',
        'PackUnits',
        'QTY',
        'classname',
        'Category',
        'UnitPrice',
        'PackQty',
        'StockValue',
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Inventory');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    await logSalespersonActivity(
      req,
      'INVENTORY_EXPORTED',
      'Exported inventory to Excel',
      'medicineitems',
      null,
      { branch_id: branchId, row_count: rows.length }
    );

    return buffer;
  }
}

export default new InventoryService();
