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
  manufacturer_name: Joi.string().trim().min(1).max(255),
  alias_name: Joi.string().allow('', null).max(255),
  category_name: Joi.string().allow('', null).max(255),
  class_name: Joi.string().allow('', null).max(255),
  class: Joi.string().optional(),
  description: Joi.string().allow('', null).max(4000),
  sale_price: Joi.number().min(0),
  purchase_price: Joi.number().min(0),
  unit_price: Joi.number().min(0),
  pack_unit: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(1),
  active: Joi.boolean(),
  img_urls: Joi.array().items(Joi.string().uri()).max(10),
  quantity: Joi.number().min(0),
  stockValue: Joi.number().min(0),
  packQty: Joi.number().min(0),
};

export const createMedicineSchema = Joi.object({
  branch_id: Joi.string().required(),
  Name: medicineBaseFields.Name.required(),
  manufacturer_name: medicineBaseFields.manufacturer_name.optional(),
  alias_name: medicineBaseFields.alias_name.optional(),
  category_name: medicineBaseFields.category_name.optional(),
  class_name: medicineBaseFields.class_name.optional(),
  class: medicineBaseFields.class.optional(),
  description: medicineBaseFields.description.optional(),
  sale_price: medicineBaseFields.sale_price.optional(),
  purchase_price: medicineBaseFields.purchase_price.optional(),
  unit_price: medicineBaseFields.unit_price.optional(),
  pack_unit: medicineBaseFields.pack_unit.optional(),
  lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
  active: medicineBaseFields.active.optional(),
  img_urls: medicineBaseFields.img_urls.optional(),
  quantity: medicineBaseFields.quantity.optional(),
  stockValue: medicineBaseFields.stockValue.optional(),
  packQty: medicineBaseFields.packQty.optional(),
});

export const updateMedicineSchema = Joi.object({
  branch_id: Joi.string().optional(),
  Name: medicineBaseFields.Name.optional(),
  manufacturer_name: medicineBaseFields.manufacturer_name.optional(),
  alias_name: medicineBaseFields.alias_name.optional(),
  category_name: medicineBaseFields.category_name.optional(),
  class_name: medicineBaseFields.class_name.optional(),
  class: medicineBaseFields.class.optional(),
  description: medicineBaseFields.description.optional(),
  sale_price: medicineBaseFields.sale_price.optional(),
  purchase_price: medicineBaseFields.purchase_price.optional(),
  unit_price: medicineBaseFields.unit_price.optional(),
  pack_unit: medicineBaseFields.pack_unit.optional(),
  lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
  active: medicineBaseFields.active.optional(),
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
        manufacturer_name: medicineBaseFields.manufacturer_name.optional(),
        alias_name: medicineBaseFields.alias_name.optional(),
        category_name: medicineBaseFields.category_name.optional(),
        class_name: medicineBaseFields.class_name.optional(),
        class: medicineBaseFields.class.optional(),
        description: medicineBaseFields.description.optional(),
        sale_price: medicineBaseFields.sale_price.optional(),
        purchase_price: medicineBaseFields.purchase_price.optional(),
        unit_price: medicineBaseFields.unit_price.optional(),
        pack_unit: medicineBaseFields.pack_unit.optional(),
        lowStockThreshold: medicineBaseFields.lowStockThreshold.optional(),
        active: medicineBaseFields.active.optional(),
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
