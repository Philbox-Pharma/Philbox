import * as XLSX from 'xlsx';
import mongoose from 'mongoose';

import Medicine from '../../../../../models/Medicine.js';
import Manufacturer from '../../../../../models/Manufacturer.js';
import MedicineCategory from '../../../../../models/MedicineCategory.js';
import ItemClass from '../../../../../models/ItemClass.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Branch from '../../../../../models/Branch.js';
import InventoryFilesLog from '../../../../../models/InventoryFilesLog.js';
import UploadedInventoryFile from '../../../../../models/UploadedInventoryFile.js';
import Salesperson from '../../../../../models/Salesperson.js';
import { paginate } from '../../../../../utils/paginate.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import { fetchMedicineDetails } from '../../../utils/fetchMedicineDetails.js';

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

const extractStrengthFromName = name => {
  const normalized = String(name || '').trim();
  if (!normalized) return null;

  const match = normalized.match(/\b(\d+(?:\.\d+)?)\s*(mg|mgs|ml|mls)\b/i);
  if (!match) return null;

  return `${match[1]}${match[2].toLowerCase()}`;
};

const buildMedicineFilters = async ({ search, category, branchId }) => {
  const filter = {
    active: { $ne: false },
  };

  void branchId;

  if (category) {
    const keyword = escapeRegex(String(category).trim());
    const matchedCategories = await MedicineCategory.find({
      name: { $regex: keyword, $options: 'i' },
    })
      .select('_id')
      .lean();

    const categoryIds = matchedCategories.map(item => item._id);
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
      ],
    });
  }

  if (search) {
    const keyword = escapeRegex(search.trim());
    const matchedCategories = await MedicineCategory.find({
      name: { $regex: keyword, $options: 'i' },
    })
      .select('_id')
      .lean();

    const categoryIds = matchedCategories.map(item => item._id);

    filter.$or = [
      { Name: { $regex: keyword, $options: 'i' } },
      { alias_name: { $regex: keyword, $options: 'i' } },
      ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
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
    is_available: medicine.active,
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

const resolveManufacturerByName = async manufacturerName => {
  const normalized = String(manufacturerName || '').trim();
  if (!normalized) return null;

  let manufacturer = await Manufacturer.findOne({
    name: {
      $regex: `^${escapeRegex(normalized)}$`,
      $options: 'i',
    },
  }).lean();

  if (manufacturer?._id) return manufacturer._id;

  try {
    const created = await Manufacturer.create({ name: normalized });
    return created._id;
  } catch (error) {
    if (error?.code !== 11000) throw error;

    manufacturer = await Manufacturer.findOne({
      name: {
        $regex: `^${escapeRegex(normalized)}$`,
        $options: 'i',
      },
    }).lean();

    return manufacturer?._id || null;
  }
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

const resolveMedicineCategoryByName = async categoryName => {
  const normalized = String(categoryName || '').trim();
  if (!normalized) return null;

  let category = await MedicineCategory.findOne({
    name: {
      $regex: `^${escapeRegex(normalized)}$`,
      $options: 'i',
    },
  }).lean();

  if (category?._id) return category._id;

  try {
    const created = await MedicineCategory.create({ name: normalized });
    return created._id;
  } catch (error) {
    if (error?.code !== 11000) throw error;

    category = await MedicineCategory.findOne({
      name: {
        $regex: `^${escapeRegex(normalized)}$`,
        $options: 'i',
      },
    }).lean();

    return category?._id || null;
  }
};

const buildMedicineUpdatePayload = async payload => {
  const updatePayload = {};

  let inferredDetails = null;
  if (payload.Name !== undefined) {
    inferredDetails = await fetchMedicineDetails(payload.Name);
  }

  if (payload.Name !== undefined) updatePayload.Name = payload.Name;
  if (payload.manufacturer_name !== undefined) {
    updatePayload.manufacturer = await resolveManufacturerByName(
      payload.manufacturer_name
    );
  }
  if (payload.alias_name !== undefined)
    updatePayload.alias_name = payload.alias_name || undefined;
  const categoryInput = payload.category_name;
  if (categoryInput !== undefined) {
    const normalizedCategory = String(categoryInput || '').trim();
    updatePayload.category =
      await resolveMedicineCategoryByName(normalizedCategory);
  }
  if (payload.description !== undefined)
    updatePayload.description = payload.description || undefined;
  else if (inferredDetails?.description) {
    updatePayload.description = inferredDetails.description;
  }
  if (payload.sale_price !== undefined)
    updatePayload.sale_price = payload.sale_price;
  if (payload.purchase_price !== undefined)
    updatePayload.purchase_price = payload.purchase_price;
  if (payload.unit_price !== undefined)
    updatePayload.unit_price = payload.unit_price;
  if (payload.pack_unit !== undefined)
    updatePayload.pack_unit = payload.pack_unit;
  if (payload.lowStockThreshold !== undefined)
    updatePayload.lowStockThreshold = payload.lowStockThreshold;
  if (payload.active !== undefined) updatePayload.active = payload.active;
  if (payload.img_urls !== undefined) updatePayload.img_urls = payload.img_urls;
  else if (
    Array.isArray(inferredDetails?.imageUrls) &&
    inferredDetails.imageUrls.length >= 2
  ) {
    updatePayload.img_urls = inferredDetails.imageUrls;
  }

  if (inferredDetails?.dosageForm) {
    updatePayload.dosage_form = inferredDetails.dosageForm;
  }

  if (payload.Name !== undefined) {
    updatePayload.mgs = extractStrengthFromName(payload.Name);
  }

  if (
    updatePayload.unit_price !== undefined &&
    updatePayload.pack_unit !== undefined &&
    updatePayload.sale_price === undefined
  ) {
    updatePayload.sale_price =
      updatePayload.unit_price * updatePayload.pack_unit;
  }

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

const buildMedicineCompoundKeyFilter = payload => ({
  Name: {
    $regex: `^${escapeRegex(payload.Name || '')}$`,
    $options: 'i',
  },
  manufacturer: payload.manufacturer ?? null,
  category: payload.category ?? null,
  mgs: payload.mgs || null,
  dosage_form: payload.dosage_form || null,
});

const pickUpsertNonKeyFields = payload => {
  const nonKeyPayload = {};
  const allowedFields = [
    'alias_name',
    'active',
    'sale_price',
    'purchase_price',
    'unit_price',
    'pack_unit',
    'lowStockThreshold',
    'class',
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      nonKeyPayload[field] = payload[field];
    }
  }

  return nonKeyPayload;
};

const getRequestedBranchId = req =>
  req?.query?.branch_id || req?.body?.branch_id || null;

class InventoryService {
  async getManagedBranches(req) {
    const managedBranchIds = await getSalespersonBranches(req.salesperson._id);

    const branches = await Branch.find({
      _id: { $in: managedBranchIds },
      status: 'Active',
    })
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    return {
      branches,
      count: branches.length,
    };
  }

  async getManufacturers() {
    const manufacturers = await Manufacturer.find({})
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    return {
      brands: manufacturers,
      count: manufacturers.length,
    };
  }

  async getCategories() {
    const categories = await MedicineCategory.find({})
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    return {
      categories,
      count: categories.length,
    };
  }

  async getItemClasses() {
    const classes = await ItemClass.find({})
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    return {
      classes,
      count: classes.length,
    };
  }

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
    const filter = await buildMedicineFilters({ search, category, branchId });
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const stockRows = await StockInHand.find({
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    })
      .select('medicine_id')
      .lean();

    const medicineIds = stockRows.map(row => row.medicine_id).filter(Boolean);

    if (!medicineIds.length) {
      return {
        medicines: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
        },
      };
    }

    filter._id = { $in: medicineIds };

    const result = await paginate(
      Medicine,
      filter,
      Number(page),
      Number(limit),
      [
        { path: 'class', select: 'name' },
        { path: 'category', select: 'name' },
      ],
      sort,
      ''
    );

    await Medicine.populate(result.list, {
      path: 'manufacturer',
      select: 'name',
    });

    const stocks = await StockInHand.find({
      medicine_id: { $in: result.list.map(medicine => medicine._id) },
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    }).lean();

    const stockMap = new Map(
      stocks.map(stock => [String(stock.medicine_id), stock])
    );

    const medicines = result.list.map(medicine => {
      const medicineObj = medicine.toObject ? medicine.toObject() : medicine;
      medicineObj.manufacturer_name =
        medicineObj.manufacturer?.name || medicineObj.manufacturer_name || null;
      medicineObj.category_name = medicineObj.category?.name || null;
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

    const stock = await StockInHand.findOne({
      medicine_id: medicineId,
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    }).lean();

    if (!stock) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const medicine = await Medicine.findById(medicineId)
      .populate('class', 'name')
      .populate('manufacturer', 'name')
      .populate('category', 'name')
      .lean();

    if (!medicine) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

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

    const medicine = await Medicine.findById(medicineId).lean();

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
        salesperson_id: req.salesperson._id,
      },
      {
        $set: {
          quantity: payload.quantity,
          salesperson_id: req.salesperson._id,
        },
        $setOnInsert: {
          medicine_id: medicineId,
          branch_id: branchId,
          salesperson_id: req.salesperson._id,
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

    const stockExists = await StockInHand.exists({
      medicine_id: medicineId,
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    });

    if (!stockExists) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const medicine = await Medicine.findOneAndUpdate(
      { _id: medicineId },
      { $set: { active: false } },
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
      { active: false }
    );

    return medicine;
  }

  async softDeleteMedicine(medicineId, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(
      req.salesperson._id,
      getRequestedBranchId(req)
    );

    const stockExists = await StockInHand.exists({
      medicine_id: medicineId,
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    });

    if (!stockExists) {
      throw {
        status: 404,
        message: 'Medicine not found',
      };
    }

    const medicine = await Medicine.findOneAndUpdate(
      { _id: medicineId },
      { $set: { active: false } },
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
      { active: false }
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

    const medicinePayload = await buildMedicineUpdatePayload(payload);
    medicinePayload.Name = payload.Name;
    const existing = await Medicine.findOne(
      buildMedicineCompoundKeyFilter(medicinePayload)
    ).lean();

    let medicine;
    if (existing) {
      medicine = existing;
      const nonKeyPayload = pickUpsertNonKeyFields(medicinePayload);
      if (Object.keys(nonKeyPayload).length) {
        await Medicine.findByIdAndUpdate(existing._id, {
          $set: nonKeyPayload,
        });
        medicine = await Medicine.findById(existing._id).lean();
      }
    } else {
      medicine = await Medicine.create(medicinePayload);
    }

    const stockPayload = buildStockUpdatePayload(payload);
    const stock = await StockInHand.findOneAndUpdate(
      {
        medicine_id: medicine._id,
        branch_id: branchId,
        salesperson_id: req.salesperson._id,
      },
      {
        $set: {
          quantity: stockPayload.quantity ?? 0,
          stockValue: stockPayload.stockValue ?? 0,
          packQty: stockPayload.packQty ?? 0,
          salesperson_id: req.salesperson._id,
        },
        $setOnInsert: {
          medicine_id: medicine._id,
          branch_id: branchId,
          salesperson_id: req.salesperson._id,
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

    const stockLink = await StockInHand.exists({
      medicine_id: medicineId,
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    });

    if (!stockLink) {
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
        {
          medicine_id: medicineId,
          branch_id: branchId,
          salesperson_id: req.salesperson._id,
        },
        {
          $set: {
            ...stockPayload,
            salesperson_id: req.salesperson._id,
          },
          $setOnInsert: {
            medicine_id: medicineId,
            branch_id: branchId,
            salesperson_id: req.salesperson._id,
          },
        },
        { upsert: true, new: true }
      );
    }

    const updatedMedicine = await Medicine.findById(medicineId)
      .populate('class', 'name')
      .populate('manufacturer', 'name')
      .populate('category', 'name')
      .lean();

    const stockDoc =
      stock ||
      (await StockInHand.findOne({
        medicine_id: medicineId,
        branch_id: branchId,
        salesperson_id: req.salesperson._id,
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
      medicinePayload.Name = item.Name;

      const existing = await Medicine.findOne(
        buildMedicineCompoundKeyFilter(medicinePayload)
      );

      let medicineId;

      if (existing) {
        const nonKeyPayload = pickUpsertNonKeyFields(medicinePayload);
        if (Object.keys(nonKeyPayload).length) {
          await Medicine.findByIdAndUpdate(existing._id, {
            $set: nonKeyPayload,
          });
        }
        medicineId = existing._id;
        updatedCount += 1;
      } else {
        const created = await Medicine.create({
          ...medicinePayload,
          Name: item.Name,
        });
        medicineId = created._id;
        createdCount += 1;
      }

      const stockPayload = buildStockUpdatePayload(item);
      if (Object.keys(stockPayload).length) {
        await StockInHand.findOneAndUpdate(
          {
            medicine_id: medicineId,
            branch_id: branchId,
            salesperson_id: req.salesperson._id,
          },
          {
            $set: {
              ...stockPayload,
              salesperson_id: req.salesperson._id,
            },
            $setOnInsert: {
              medicine_id: medicineId,
              branch_id: branchId,
              salesperson_id: req.salesperson._id,
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

    const stockResult = await StockInHand.updateMany(
      { branch_id: branchId, salesperson_id: req.salesperson._id },
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
        stockAffected: stockResult.modifiedCount || 0,
      }
    );

    return {
      branch_id: branchId,
      stockAffected: stockResult.modifiedCount || 0,
    };
  }

  async getMedicineAuditLogs(medicineId, query, req) {
    assertValidObjectId(medicineId, 'medicineId');

    const branchId = await resolveBranchId(
      req.salesperson._id,
      query.branch_id || getRequestedBranchId(req)
    );

    const medicineExists = await StockInHand.exists({
      medicine_id: medicineId,
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
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

    const stocks = await StockInHand.find({
      branch_id: branchId,
      salesperson_id: req.salesperson._id,
    }).lean();

    const medicines = await Medicine.find({
      _id: { $in: stocks.map(stock => stock.medicine_id).filter(Boolean) },
      active: { $ne: false },
    })
      .populate('class', 'name')
      .populate('manufacturer', 'name')
      .populate('category', 'name')
      .lean();

    const medicineMap = new Map(
      medicines.map(medicine => [String(medicine._id), medicine])
    );

    const rows = stocks
      .map(stock => {
        const medicine = medicineMap.get(String(stock.medicine_id));
        if (!medicine) return null;

        return {
          Name: medicine.Name || '',
          aliasname: medicine.alias_name || '',
          active: medicine.active ?? true,
          saleprice: medicine.sale_price ?? 0,
          purprice: medicine.purchase_price ?? 0,
          PackUnits: medicine.pack_unit ?? 1,
          QTY: stock?.quantity ?? 0,
          name: medicine.manufacturer?.name || '',
          classname: medicine.class?.name || '',
          Category: medicine.category?.name || '',
          UnitPrice: medicine.unit_price ?? medicine.sale_price ?? 0,
          PackQty: stock?.packQty ?? 0,
          StockValue: stock?.stockValue ?? 0,
        };
      })
      .filter(Boolean);

    const sheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        'Name',
        'aliasname',
        'active',
        'saleprice',
        'purprice',
        'PackUnits',
        'QTY',
        'name',
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
