import * as XLSX from 'xlsx';
import mongoose from 'mongoose';

import Medicine from '../../../../../models/Medicine.js';
import ItemClass from '../../../../../models/ItemClass.js';
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

const resolveBranchId = async (
  salespersonId,
  requestedBranchId,
  options = {}
) => {
  const { requireRequested = false } = options;
  const managedBranchIds = await getSalespersonBranches(salespersonId);
  const defaultBranchId = managedBranchIds[0];

  if (!requestedBranchId) {
    if (requireRequested) {
      throw {
        status: 400,
        message: 'branch_id is required',
      };
    }
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

const resolveItemClassByName = async className => {
  const normalized = String(className || '').trim();
  if (!normalized) return null;

  let itemClass = await ItemClass.findOne({
    name: {
      $regex: `^${escapeRegex(normalized)}$`,
      $options: 'i',
    },
  }).lean();

  if (itemClass?._id) return itemClass._id;

  try {
    const created = await ItemClass.create({ name: normalized });
    return created._id;
  } catch (error) {
    if (error?.code !== 11000) throw error;

    itemClass = await ItemClass.findOne({
      name: {
        $regex: `^${escapeRegex(normalized)}$`,
        $options: 'i',
      },
    }).lean();

    return itemClass?._id || null;
  }
};

const buildMedicineUpdatePayload = async payload => {
  const updatePayload = {};

  if (payload.Name !== undefined) updatePayload.Name = payload.Name;
  if (payload.alias_name !== undefined)
    updatePayload.alias_name = payload.alias_name || undefined;
  if (payload.medicine_category !== undefined)
    updatePayload.medicine_category = payload.medicine_category || null;
  if (payload.description !== undefined)
    updatePayload.description = payload.description || undefined;
  if (payload.sale_price !== undefined)
    updatePayload.sale_price = payload.sale_price;
  if (payload.purchase_price !== undefined)
    updatePayload.purchase_price = payload.purchase_price;
  if (payload.pack_unit !== undefined)
    updatePayload.pack_unit = payload.pack_unit;
  if (payload.lowStockThreshold !== undefined)
    updatePayload.lowStockThreshold = payload.lowStockThreshold;
  if (payload.is_available !== undefined)
    updatePayload.is_available = payload.is_available;
  if (payload.img_urls !== undefined) updatePayload.img_urls = payload.img_urls;

  if (payload.class) {
    assertValidObjectId(payload.class, 'class');
    updatePayload.class = payload.class;
  } else if (payload.class_name !== undefined) {
    updatePayload.class = await resolveItemClassByName(payload.class_name);
  }

  return updatePayload;
};

const buildStockUpdatePayload = payload => {
  const stockPayload = {};
  if (payload.quantity !== undefined) stockPayload.quantity = payload.quantity;
  if (payload.stockValue !== undefined)
    stockPayload.stockValue = payload.stockValue;
  if (payload.packQty !== undefined) stockPayload.packQty = payload.packQty;
  return stockPayload;
};

const getRequestedBranchId = req =>
  req?.query?.branch_id || req?.body?.branch_id || null;

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

    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

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

    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

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

    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

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

    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

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

  async createMedicine(payload, req) {
    const branchId = await resolveBranchId(
      req.salesperson._id,
      payload.branch_id,
      { requireRequested: true }
    );

    const existing = await Medicine.findOne({
      Name: {
        $regex: `^${escapeRegex(payload.Name)}$`,
        $options: 'i',
      },
      branch_id: branchId,
    }).lean();

    if (existing) {
      throw {
        status: 409,
        message: 'Medicine already exists in this branch',
      };
    }

    const medicinePayload = await buildMedicineUpdatePayload(payload);
    medicinePayload.Name = payload.Name;
    medicinePayload.branch_id = branchId;
    medicinePayload.salesperson_id = req.salesperson._id;

    const medicine = await Medicine.create(medicinePayload);

    const stockPayload = buildStockUpdatePayload(payload);
    const stock = await StockInHand.findOneAndUpdate(
      { medicine_id: medicine._id, branch_id: branchId },
      {
        $set: {
          quantity: stockPayload.quantity ?? 0,
          stockValue: stockPayload.stockValue ?? 0,
          packQty: stockPayload.packQty ?? 0,
        },
        $setOnInsert: {
          medicine_id: medicine._id,
          branch_id: branchId,
        },
      },
      { upsert: true, new: true }
    );

    await logSalespersonActivity(
      req,
      'MEDICINE_CREATED',
      `Created medicine ${medicine.Name}`,
      'medicineitems',
      medicine._id,
      { branch_id: branchId }
    );

    return {
      medicine,
      stock,
    };
  }

  async updateMedicine(medicineId, payload, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(
      req.salesperson._id,
      payload.branch_id || getRequestedBranchId(req)
    );

    const medicine = await Medicine.findOne({
      _id: medicineId,
      branch_id: branchId,
    });

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const updatePayload = await buildMedicineUpdatePayload(payload);
    if (Object.keys(updatePayload).length) {
      await Medicine.findByIdAndUpdate(medicineId, { $set: updatePayload });
    }

    const stockPayload = buildStockUpdatePayload(payload);
    let stock = null;
    if (Object.keys(stockPayload).length) {
      stock = await StockInHand.findOneAndUpdate(
        { medicine_id: medicineId, branch_id: branchId },
        {
          $set: stockPayload,
          $setOnInsert: {
            medicine_id: medicineId,
            branch_id: branchId,
          },
        },
        { upsert: true, new: true }
      );
    }

    const updatedMedicine = await Medicine.findById(medicineId)
      .populate('class', 'name')
      .lean();

    const stockDoc =
      stock ||
      (await StockInHand.findOne({
        medicine_id: medicineId,
        branch_id: branchId,
      }).lean());

    await logSalespersonActivity(
      req,
      'MEDICINE_UPDATED',
      `Updated medicine ${updatedMedicine?.Name || medicineId}`,
      'medicineitems',
      medicineId,
      {
        branch_id: branchId,
        updatedFields: Object.keys(payload || {}),
      }
    );

    return combineMedicineAndStock(updatedMedicine, stockDoc);
  }

  async bulkUpsertInventory(payload, req) {
    const branchId = await resolveBranchId(
      req.salesperson._id,
      payload.branch_id,
      { requireRequested: true }
    );

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of payload.medicines) {
      const medicinePayload = await buildMedicineUpdatePayload(item);
      const existing = await Medicine.findOne({
        Name: {
          $regex: `^${escapeRegex(item.Name)}$`,
          $options: 'i',
        },
        branch_id: branchId,
      });

      let medicineId;

      if (existing) {
        if (Object.keys(medicinePayload).length) {
          await Medicine.findByIdAndUpdate(existing._id, {
            $set: {
              ...medicinePayload,
              salesperson_id: req.salesperson._id,
              branch_id: branchId,
            },
          });
        }
        medicineId = existing._id;
        updatedCount += 1;
      } else {
        const created = await Medicine.create({
          ...medicinePayload,
          Name: item.Name,
          branch_id: branchId,
          salesperson_id: req.salesperson._id,
        });
        medicineId = created._id;
        createdCount += 1;
      }

      const stockPayload = buildStockUpdatePayload(item);
      if (Object.keys(stockPayload).length) {
        await StockInHand.findOneAndUpdate(
          { medicine_id: medicineId, branch_id: branchId },
          {
            $set: stockPayload,
            $setOnInsert: {
              medicine_id: medicineId,
              branch_id: branchId,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    await logSalespersonActivity(
      req,
      'BRANCH_INVENTORY_UPSERTED',
      `Upserted branch inventory (${payload.medicines.length} rows)`,
      'medicineitems',
      null,
      {
        branch_id: branchId,
        totalRows: payload.medicines.length,
        createdCount,
        updatedCount,
      }
    );

    return {
      branch_id: branchId,
      totalRows: payload.medicines.length,
      createdCount,
      updatedCount,
    };
  }

  async clearBranchInventory(payload, req) {
    const branchId = await resolveBranchId(
      req.salesperson._id,
      payload.branch_id,
      { requireRequested: true }
    );

    const medicineResult = await Medicine.updateMany(
      { branch_id: branchId, is_available: { $ne: false } },
      { $set: { is_available: false } }
    );

    const stockResult = await StockInHand.updateMany(
      { branch_id: branchId },
      { $set: { quantity: 0, stockValue: 0, packQty: 0 } }
    );

    await logSalespersonActivity(
      req,
      'BRANCH_INVENTORY_CLEARED',
      'Cleared branch inventory',
      'medicineitems',
      null,
      {
        branch_id: branchId,
        medicinesAffected: medicineResult.modifiedCount || 0,
        stockAffected: stockResult.modifiedCount || 0,
      }
    );

    return {
      branch_id: branchId,
      medicinesAffected: medicineResult.modifiedCount || 0,
      stockAffected: stockResult.modifiedCount || 0,
    };
  }

  async getMedicineAuditLogs(medicineId, query, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(
      req.salesperson._id,
      query.branch_id || getRequestedBranchId(req)
    );

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
    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

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
