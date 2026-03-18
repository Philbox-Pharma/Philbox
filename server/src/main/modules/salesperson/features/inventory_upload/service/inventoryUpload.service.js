import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import Medicine from '../../../../../models/Medicine.js';
import ItemClass from '../../../../../models/ItemClass.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Salesperson from '../../../../../models/Salesperson.js';
import UploadedInventoryFile from '../../../../../models/UploadedInventoryFile.js';
import InventoryFilesLog from '../../../../../models/InventoryFilesLog.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { logSalespersonActivity } from '../../../utils/logSalespersonActivity.js';
import { fetchMedicineDetails } from '../../../utils/fetchMedicineDetails.js';

const REQUIRED_HEADERS = [
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
];

const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls']);

const coerceBoolean = value => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  return (
    normalized === '1' ||
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === 'y'
  );
};

const parseNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const escapeRegex = value =>
  String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildIssueMessage = errors =>
  errors.map(err => `${err.field}: ${err.message}`).join(' | ');

const resolveItemClassByName = async className => {
  const normalizedName = String(className || '').trim();
  if (!normalizedName) return null;

  let itemClass = await ItemClass.findOne({
    name: {
      $regex: `^${escapeRegex(normalizedName)}$`,
      $options: 'i',
    },
  });

  if (itemClass) return itemClass;

  try {
    itemClass = await ItemClass.create({ name: normalizedName });
    return itemClass;
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    return ItemClass.findOne({
      name: {
        $regex: `^${escapeRegex(normalizedName)}$`,
        $options: 'i',
      },
    });
  }
};

const validateFileType = file => {
  const ext = path.extname(file?.originalname || '').toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
};

const readUploadedFileBuffer = async file => {
  if (file?.buffer) return file.buffer;
  if (!file?.path) throw new Error('File content is not available');
  return fs.promises.readFile(file.path);
};

const safeDeleteFile = async file => {
  try {
    if (file?.path && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path);
    }
  } catch {
    // no-op cleanup
  }
};

const normalizeRow = data => {
  const normalized = {
    Name: String(data.Name || '').trim(),
    aliasname: String(data.aliasname || '').trim(),
    active: coerceBoolean(data.active),
    saleprice: parseNumber(data.saleprice),
    purprice: parseNumber(data.purprice),
    PackUnits: parseNumber(data.PackUnits),
    QTY: parseNumber(data.QTY),
    name: String(data.name || '').trim(),
    classname: String(data.classname || '').trim(),
    Category: String(data.Category || '').trim(),
    UnitPrice: parseNumber(data.UnitPrice),
    PackQty: parseNumber(data.PackQty),
    StockValue: parseNumber(data.StockValue),
  };

  const errors = [];

  if (!normalized.Name) {
    errors.push({ field: 'Name', message: 'Name is required' });
  }
  if (normalized.QTY === null || normalized.QTY < 0) {
    errors.push({
      field: 'QTY',
      message: 'QTY is required and must be a non-negative number',
    });
  }
  if (normalized.saleprice === null || normalized.saleprice <= 0) {
    errors.push({
      field: 'saleprice',
      message: 'saleprice is required and must be a positive number',
    });
  }
  if (normalized.purprice === null || normalized.purprice <= 0) {
    errors.push({
      field: 'purprice',
      message: 'purprice is required and must be a positive number',
    });
  }

  if (normalized.PackUnits !== null && normalized.PackUnits < 0) {
    errors.push({
      field: 'PackUnits',
      message: 'PackUnits must be a non-negative number',
    });
  }
  if (normalized.UnitPrice !== null && normalized.UnitPrice < 0) {
    errors.push({
      field: 'UnitPrice',
      message: 'UnitPrice must be a non-negative number',
    });
  }
  if (normalized.PackQty !== null && normalized.PackQty < 0) {
    errors.push({
      field: 'PackQty',
      message: 'PackQty must be a non-negative number',
    });
  }
  if (normalized.StockValue !== null && normalized.StockValue < 0) {
    errors.push({
      field: 'StockValue',
      message: 'StockValue must be a non-negative number',
    });
  }

  return { normalized, errors };
};

const toRowErrorResponse = (row, message, field = 'row', logId = null) => ({
  logId,
  rowNumber: row.rowNumber,
  field,
  message,
  data: row.data,
});

const getSalespersonBranchRef = async salespersonId => {
  const salesperson = await Salesperson.findById(salespersonId)
    .select('branches_to_be_managed')
    .lean();

  const salespersonBranchRef = salesperson?.branches_to_be_managed?.[0];
  if (!salespersonBranchRef) {
    throw {
      status: 400,
      message: 'No branch assigned to salesperson',
    };
  }

  return salespersonBranchRef;
};

const createInventoryLog = async ({
  uploadedFileId,
  status,
  row,
  issue,
  action = null,
  targetMedicine = null,
  stock = null,
  retryCount = 0,
  errorField = null,
  errorMessage = null,
}) => {
  const log = await InventoryFilesLog.create({
    uploaded_inventory_file: uploadedFileId,
    status,
    target_medicine: targetMedicine,
    stock,
    issue,
    action,
    retryCount,
    last_attempt: new Date(),
    row_number: row?.rowNumber,
    row_data: {
      data: row?.data,
      normalized: row?.normalized,
      errors: row?.errors || [],
    },
    error_field: errorField,
    error_message: errorMessage,
  });

  await UploadedInventoryFile.findByIdAndUpdate(uploadedFileId, {
    $push: { logs: log._id },
  });

  return log;
};

const upsertMedicineAndStock = async ({ row, salespersonId, branchId }) => {
  const data = row.normalized;
  const itemClass = await resolveItemClassByName(data.classname);
  let medicine = await Medicine.findOne({
    Name: {
      $regex: `^${escapeRegex(data.Name)}$`,
      $options: 'i',
    },
    branch_id: branchId,
  });

  let newMedicineAdded = false;
  let existingMedicineUpdated = false;

  if (medicine) {
    const missingImage = !String(medicine.img_url || '').trim();
    const missingDescription = !String(medicine.description || '').trim();

    const updatePayload = {
      alias_name: data.aliasname || undefined,
      is_available: data.active,
      sale_price: data.saleprice,
      purchase_price: data.purprice,
      medicine_category: data.Category || null,
      class: itemClass?._id || undefined,
      pack_unit: data.PackUnits ?? undefined,
      salesperson_id: salespersonId,
      branch_id: branchId,
    };

    if (missingImage || missingDescription) {
      const { imageUrl, description } = await fetchMedicineDetails(data.Name);

      if (missingImage) {
        if (imageUrl) {
          updatePayload.img_url = imageUrl;
        }
      }

      if (missingDescription) {
        if (description) {
          updatePayload.description = description;
        }
      }
    }

    await Medicine.findByIdAndUpdate(medicine._id, {
      $set: updatePayload,
    });

    medicine = await Medicine.findById(medicine._id);
    existingMedicineUpdated = true;
  } else {
    const { imageUrl, description } = await fetchMedicineDetails(data.Name);

    medicine = await Medicine.create({
      Name: data.Name,
      alias_name: data.aliasname || undefined,
      is_available: data.active,
      sale_price: data.saleprice,
      purchase_price: data.purprice,
      medicine_category: data.Category || null,
      class: itemClass?._id || undefined,
      pack_unit: data.PackUnits ?? undefined,
      img_url: imageUrl || undefined,
      description: description || undefined,
      salesperson_id: salespersonId,
      branch_id: branchId,
    });
    newMedicineAdded = true;
  }

  const stockRecord = await StockInHand.findOneAndUpdate(
    {
      medicine_id: medicine._id,
      branch_id: branchId,
    },
    {
      $set: {
        quantity: data.QTY,
        stockValue: data.StockValue || 0,
        packQty: data.PackQty || 0,
      },
    },
    { upsert: true, new: true }
  );

  return {
    medicine,
    stockRecord,
    newMedicineAdded,
    existingMedicineUpdated,
  };
};

const getOwnedUploadedFile = async ({ uploadedFileId, salespersonId }) => {
  const uploadedFile = await UploadedInventoryFile.findOne({
    _id: uploadedFileId,
    salesperson_id: salespersonId,
  });

  if (!uploadedFile) {
    throw {
      status: 404,
      message: 'Uploaded inventory file not found',
    };
  }

  return uploadedFile;
};

const refreshUploadedFileStatus = async uploadedFileId => {
  const unresolvedCount = await InventoryFilesLog.countDocuments({
    uploaded_inventory_file: uploadedFileId,
    status: 'unresolved',
  });

  await UploadedInventoryFile.findByIdAndUpdate(uploadedFileId, {
    status: unresolvedCount > 0 ? 'failed' : 'synced',
  });
};

export const parseExcelFile = buffer => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      headers: [],
      rows: [],
      columnValidation: {
        isValid: false,
        missingColumns: REQUIRED_HEADERS,
      },
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows.length) {
    return {
      headers: [],
      rows: [],
      columnValidation: {
        isValid: false,
        missingColumns: REQUIRED_HEADERS,
      },
    };
  }

  const headers = rawRows[0].map(h => String(h || '').trim());
  const missingColumns = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  const columnValidation = {
    isValid: missingColumns.length === 0,
    missingColumns,
  };

  const rows = rawRows.slice(1).map((row, index) => {
    const data = headers.reduce((acc, header, colIdx) => {
      acc[header] = row[colIdx] ?? '';
      return acc;
    }, {});

    const { normalized, errors } = normalizeRow(data);

    return {
      rowNumber: index + 2,
      data,
      normalized,
      errors,
      isValid: errors.length === 0,
    };
  });

  return {
    headers,
    rows,
    columnValidation,
  };
};

export const generateExcelTemplate = () => {
  const sampleRow = {
    Name: 'Panadol',
    aliasname: 'Paracetamol',
    active: 'yes',
    saleprice: 150,
    purprice: 120,
    PackUnits: 10,
    QTY: 50,
    name: 'GSK',
    classname: 'Analgesic',
    Category: 'Narcotics',
    UnitPrice: 15,
    PackQty: 5,
    StockValue: 7500,
  };

  const sheet = XLSX.utils.json_to_sheet([sampleRow], {
    header: REQUIRED_HEADERS,
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Inventory Template');

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });
};

export const previewInventoryUpload = async file => {
  if (!file) {
    throw { status: 400, message: 'File is required' };
  }

  if (!validateFileType(file)) {
    throw { status: 400, message: 'Only .xlsx and .xls files are allowed' };
  }

  const buffer = await readUploadedFileBuffer(file);
  const parsed = parseExcelFile(buffer);

  await safeDeleteFile(file);

  const validRows = parsed.rows.filter(r => r.isValid).length;
  const invalidRows = parsed.rows.length - validRows;

  return {
    totalRows: parsed.rows.length,
    validRows,
    invalidRows,
    preview: parsed.rows.slice(0, 100).map(row => ({
      rowNumber: row.rowNumber,
      data: row.data,
      errors: row.errors,
      isValid: row.isValid,
    })),
    columnValidation: parsed.columnValidation,
  };
};

export const processInventoryUpload = async (req, file) => {
  if (!file) {
    throw { status: 400, message: 'File is required' };
  }

  if (!validateFileType(file)) {
    throw { status: 400, message: 'Only .xlsx and .xls files are allowed' };
  }

  const buffer = await readUploadedFileBuffer(file);
  const parsed = parseExcelFile(buffer);

  if (!parsed.columnValidation.isValid) {
    await safeDeleteFile(file);
    throw {
      status: 400,
      message: 'Invalid file columns',
      details: parsed.columnValidation,
    };
  }

  const salespersonBranchRef = await getSalespersonBranchRef(
    req.salesperson._id
  );

  const uploadedFileUrl = await uploadToCloudinary(
    file.path,
    'inventory/files',
    {
      resource_type: 'raw',
      type: 'upload',
    }
  );

  const uploadedFile = await UploadedInventoryFile.create({
    branch_id: salespersonBranchRef,
    salesperson_id: req.salesperson._id,
    file_type: 'stock_in_hand',
    file_url: uploadedFileUrl,
    status: 'processing',
    logs: [],
  });

  const errors = [];
  const unresolvedLogs = [];
  let successCount = 0;
  let failedRowsCount = 0;
  let newMedicinesAdded = 0;
  let existingMedicinesUpdated = 0;

  try {
    for (const row of parsed.rows) {
      if (!row.isValid) {
        const issueMessage = buildIssueMessage(row.errors);
        const createdLog = await createInventoryLog({
          uploadedFileId: uploadedFile._id,
          status: 'unresolved',
          row,
          issue: `Row ${row.rowNumber} - ${issueMessage}`,
          action: 'skip',
          errorField: 'row',
          errorMessage: issueMessage,
        });

        errors.push(
          toRowErrorResponse(row, issueMessage, 'row', createdLog._id)
        );
        unresolvedLogs.push({
          logId: createdLog._id,
          rowNumber: row.rowNumber,
          issue: createdLog.issue,
          status: createdLog.status,
          action: createdLog.action,
          data: row.data,
          errors: row.errors,
        });
        failedRowsCount += 1;
        continue;
      }

      try {
        const processResult = await upsertMedicineAndStock({
          row,
          salespersonId: req.salesperson._id,
          branchId: salespersonBranchRef,
        });

        await createInventoryLog({
          uploadedFileId: uploadedFile._id,
          status: 'resolved',
          row,
          issue: null,
          action: null,
          targetMedicine: processResult.medicine._id,
          stock: processResult.stockRecord._id,
        });

        if (processResult.newMedicineAdded) newMedicinesAdded += 1;
        if (processResult.existingMedicineUpdated)
          existingMedicinesUpdated += 1;
        successCount += 1;
      } catch (error) {
        const failureMessage = error.message || 'Failed to process row';
        const createdLog = await createInventoryLog({
          uploadedFileId: uploadedFile._id,
          status: 'unresolved',
          row,
          issue: `Row ${row.rowNumber} - row: ${failureMessage}`,
          action: 'skip',
          errorField: 'row',
          errorMessage: failureMessage,
        });

        errors.push(
          toRowErrorResponse(row, failureMessage, 'row', createdLog._id)
        );
        unresolvedLogs.push({
          logId: createdLog._id,
          rowNumber: row.rowNumber,
          issue: createdLog.issue,
          status: createdLog.status,
          action: createdLog.action,
          data: row.data,
          errors: [{ field: 'row', message: failureMessage }],
        });
        failedRowsCount += 1;
      }
    }

    await UploadedInventoryFile.findByIdAndUpdate(uploadedFile._id, {
      status: failedRowsCount > 0 ? 'failed' : 'synced',
    });

    await logSalespersonActivity(
      req,
      'INVENTORY_UPLOADED',
      `Uploaded inventory file: ${file.originalname}, ${successCount} items updated`,
      'uploadedinventoryfiles',
      uploadedFile._id,
      {
        totalRows: parsed.rows.length,
        successCount,
        errorCount: failedRowsCount,
        newMedicinesAdded,
        existingMedicinesUpdated,
      }
    );

    return {
      uploadedFileId: uploadedFile._id,
      uploadedFileUrl,
      totalRows: parsed.rows.length,
      successCount,
      errorCount: failedRowsCount,
      newMedicinesAdded,
      existingMedicinesUpdated,
      errors,
      unresolvedLogs,
      canResolveWith: {
        listErrorsRoute: `/api/salesperson/inventory/uploads/${uploadedFile._id}/errors`,
        resolveRouteTemplate: `/api/salesperson/inventory/uploads/${uploadedFile._id}/logs/:logId/resolve`,
      },
    };
  } finally {
    await safeDeleteFile(file);
  }
};

export const confirmInventoryUpload = async (req, file) =>
  processInventoryUpload(req, file);

export const listUnresolvedInventoryErrors = async (req, uploadedFileId) => {
  await getOwnedUploadedFile({
    uploadedFileId,
    salespersonId: req.salesperson._id,
  });

  const unresolvedLogs = await InventoryFilesLog.find({
    uploaded_inventory_file: uploadedFileId,
    status: 'unresolved',
  })
    .sort({ row_number: 1, createdAt: 1 })
    .lean();

  return {
    uploadedFileId,
    unresolvedCount: unresolvedLogs.length,
    unresolvedLogs: unresolvedLogs.map(log => ({
      logId: log._id,
      rowNumber: log.row_number,
      issue: log.issue,
      action: log.action,
      retryCount: log.retryCount,
      errorField: log.error_field,
      errorMessage: log.error_message,
      data: log?.row_data?.data || null,
      errors: Array.isArray(log?.row_data?.errors) ? log.row_data.errors : [],
      lastAttempt: log.last_attempt,
    })),
  };
};

export const resolveInventoryErrorLog = async (
  req,
  uploadedFileId,
  logId,
  payload = {}
) => {
  const { action, rowData } = payload;

  if (action !== 'retry' && action !== 'skip') {
    throw {
      status: 400,
      message: 'action must be either retry or skip',
    };
  }

  const uploadedFile = await getOwnedUploadedFile({
    uploadedFileId,
    salespersonId: req.salesperson._id,
  });

  const log = await InventoryFilesLog.findOne({
    _id: logId,
    uploaded_inventory_file: uploadedFile._id,
  });

  if (!log) {
    throw {
      status: 404,
      message: 'Inventory log entry not found',
    };
  }

  if (action === 'skip') {
    log.status = 'resolved';
    log.action = 'skip';
    log.issue = 'Skipped by user';
    log.error_field = null;
    log.error_message = null;
    log.last_attempt = new Date();
    log.retryCount = (log.retryCount || 0) + 1;
    await log.save();

    await refreshUploadedFileStatus(uploadedFile._id);

    return {
      uploadedFileId: uploadedFile._id,
      logId: log._id,
      status: log.status,
      action: log.action,
      message: 'Row skipped successfully',
    };
  }

  const sourceData = rowData || log?.row_data?.data || log?.row_data || null;
  if (!sourceData || typeof sourceData !== 'object') {
    throw {
      status: 400,
      message:
        'No row data available to retry. Provide rowData in the request.',
    };
  }

  const { normalized, errors } = normalizeRow(sourceData);
  const row = {
    rowNumber: log.row_number || 0,
    data: sourceData,
    normalized,
    errors,
    isValid: errors.length === 0,
  };

  log.retryCount = (log.retryCount || 0) + 1;
  log.last_attempt = new Date();
  log.action = 'retry';
  log.row_data = {
    data: row.data,
    normalized: row.normalized,
    errors: row.errors,
  };

  if (!row.isValid) {
    const issueMessage = buildIssueMessage(row.errors);
    log.status = 'unresolved';
    log.issue = `Row ${row.rowNumber} - ${issueMessage}`;
    log.error_field = 'row';
    log.error_message = issueMessage;
    await log.save();

    await refreshUploadedFileStatus(uploadedFile._id);

    return {
      uploadedFileId: uploadedFile._id,
      logId: log._id,
      status: log.status,
      action: log.action,
      message: 'Row is still invalid after retry',
      error: toRowErrorResponse(row, issueMessage, 'row', log._id),
    };
  }

  try {
    const processResult = await upsertMedicineAndStock({
      row,
      salespersonId: req.salesperson._id,
      branchId: uploadedFile.branch_id,
    });

    log.status = 'resolved';
    log.issue = null;
    log.error_field = null;
    log.error_message = null;
    log.target_medicine = processResult.medicine._id;
    log.stock = processResult.stockRecord._id;
    await log.save();

    await refreshUploadedFileStatus(uploadedFile._id);

    return {
      uploadedFileId: uploadedFile._id,
      logId: log._id,
      status: log.status,
      action: log.action,
      message: 'Row retried successfully',
      result: {
        medicineId: processResult.medicine._id,
        stockId: processResult.stockRecord._id,
        newMedicineAdded: processResult.newMedicineAdded,
        existingMedicineUpdated: processResult.existingMedicineUpdated,
      },
    };
  } catch (error) {
    const failureMessage = error.message || 'Failed to process row';

    log.status = 'unresolved';
    log.issue = `Row ${row.rowNumber} - row: ${failureMessage}`;
    log.error_field = 'row';
    log.error_message = failureMessage;
    await log.save();

    await refreshUploadedFileStatus(uploadedFile._id);

    return {
      uploadedFileId: uploadedFile._id,
      logId: log._id,
      status: log.status,
      action: log.action,
      message: 'Retry failed for row',
      error: toRowErrorResponse(row, failureMessage, 'row', log._id),
    };
  }
};
