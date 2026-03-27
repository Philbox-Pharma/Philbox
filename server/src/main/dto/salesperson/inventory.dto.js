import Joi from 'joi';

export const inventoryQuerySchema = Joi.object({
  search: Joi.string().optional(),
  branch_id: Joi.string().optional(),
  category: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const updateStockSchema = Joi.object({
  quantity: Joi.number().min(0).required(),
  reason: Joi.string().max(500).optional(),
});

const medicineBaseFields = {
  Name: Joi.string().trim().min(1).max(255),
  alias_name: Joi.string().allow('', null).max(255),
  medicine_category: Joi.string().allow('', null).max(255),
  class_name: Joi.string().allow('', null).max(255),
  class: Joi.string().optional(),
  description: Joi.string().allow('', null).max(4000),
  sale_price: Joi.number().min(0),
  purchase_price: Joi.number().min(0),
  pack_unit: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(1),
  is_available: Joi.boolean(),
  img_urls: Joi.array().items(Joi.string().uri()).max(10),
  quantity: Joi.number().min(0),
  stockValue: Joi.number().min(0),
  packQty: Joi.number().min(0),
};

export const createMedicineSchema = Joi.object({
  branch_id: Joi.string().required(),
  Name: medicineBaseFields.Name.required(),
  alias_name: medicineBaseFields.alias_name.optional(),
  medicine_category: medicineBaseFields.medicine_category.optional(),
  class_name: medicineBaseFields.class_name.optional(),
  class: medicineBaseFields.class.optional(),
  description: medicineBaseFields.description.optional(),
  sale_price: medicineBaseFields.sale_price.optional(),
  purchase_price: medicineBaseFields.purchase_price.optional(),
  pack_unit: medicineBaseFields.pack_unit.optional(),
  lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
  is_available: medicineBaseFields.is_available.optional(),
  img_urls: medicineBaseFields.img_urls.optional(),
  quantity: medicineBaseFields.quantity.optional(),
  stockValue: medicineBaseFields.stockValue.optional(),
  packQty: medicineBaseFields.packQty.optional(),
});

export const updateMedicineSchema = Joi.object({
  branch_id: Joi.string().optional(),
  Name: medicineBaseFields.Name.optional(),
  alias_name: medicineBaseFields.alias_name.optional(),
  medicine_category: medicineBaseFields.medicine_category.optional(),
  class_name: medicineBaseFields.class_name.optional(),
  class: medicineBaseFields.class.optional(),
  description: medicineBaseFields.description.optional(),
  sale_price: medicineBaseFields.sale_price.optional(),
  purchase_price: medicineBaseFields.purchase_price.optional(),
  pack_unit: medicineBaseFields.pack_unit.optional(),
  lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
  is_available: medicineBaseFields.is_available.optional(),
  img_urls: medicineBaseFields.img_urls.optional(),
  quantity: medicineBaseFields.quantity.optional(),
  stockValue: medicineBaseFields.stockValue.optional(),
  packQty: medicineBaseFields.packQty.optional(),
}).min(1);

export const bulkUpsertInventorySchema = Joi.object({
  branch_id: Joi.string().required(),
  medicines: Joi.array()
    .items(
      Joi.object({
        Name: medicineBaseFields.Name.required(),
        alias_name: medicineBaseFields.alias_name.optional(),
        medicine_category: medicineBaseFields.medicine_category.optional(),
        class_name: medicineBaseFields.class_name.optional(),
        class: medicineBaseFields.class.optional(),
        description: medicineBaseFields.description.optional(),
        sale_price: medicineBaseFields.sale_price.optional(),
        purchase_price: medicineBaseFields.purchase_price.optional(),
        pack_unit: medicineBaseFields.pack_unit.optional(),
        lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
        is_available: medicineBaseFields.is_available.optional(),
        img_urls: medicineBaseFields.img_urls.optional(),
        quantity: medicineBaseFields.quantity.optional(),
        stockValue: medicineBaseFields.stockValue.optional(),
        packQty: medicineBaseFields.packQty.optional(),
      })
    )
    .min(1)
    .required(),
});

export const branchRequiredSchema = Joi.object({
  branch_id: Joi.string().required(),
});
