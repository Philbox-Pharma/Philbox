import mongoose from 'mongoose';

const isPrescriptionRequiredForCategory = category =>
  String(category || '')
    .trim()
    .toLowerCase() === 'narcotics';

const resolvePrescriptionRequiredByCategory = async (categoryId, db) => {
  if (!categoryId) return false;

  const category = await db
    .model('MedicineCategory')
    .findById(categoryId)
    .select('name')
    .lean();

  return isPrescriptionRequiredForCategory(category?.name);
};

/**
 * Medicine Model (Alias for MedicineItem)
 * This model is registered as 'Medicine' to support legacy references in OrderItem schema
 * It uses the same collection as MedicineItem: 'medicineitems'
 */

const medicineSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    alias_name: {
      type: String,
    },
    manufacturer: {
      type: String,
      ref: 'Manufacturer',
      default: null,
    },
    img_urls: {
      type: [String],
      default: [],
    },
    mgs: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: value =>
          value == null ||
          /^\d+(?:\.\d+)?\s*(?:mg|mgs|ml|mls)$/i.test(String(value).trim()),
        message:
          'mgs must be a valid strength value like 500mg, 500mgs, 120ml, or 120mls',
      },
    },
    dosage_form: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      ref: 'MedicineCategory',
      default: null,
    },
    prescription_required: {
      type: Boolean,
      default: false,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemClass',
    },
    description: {
      type: String,
    },
    sale_price: {
      type: Number,
      default: 0,
    },
    purchase_price: {
      type: Number,
      default: 0,
    },
    unit_price: {
      type: Number,
      default: 0,
    },
    pack_unit: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: 'medicineitems', // Use the same collection as MedicineItem
  }
);

medicineSchema.pre('validate', async function (next) {
  try {
    this.prescription_required = await resolvePrescriptionRequiredByCategory(
      this.category,
      this.constructor.db
    );
    next();
  } catch (error) {
    next(error);
  }
});

const applyPrescriptionFlagForUpdate = async (update, db) => {
  if (!update || Array.isArray(update)) return update;

  const setPayload = update.$set || update;
  if (!Object.prototype.hasOwnProperty.call(setPayload, 'category')) {
    return update;
  }

  const prescriptionRequired = await resolvePrescriptionRequiredByCategory(
    setPayload.category,
    db
  );

  if (update.$set) {
    update.$set.prescription_required = prescriptionRequired;
  } else {
    update.prescription_required = prescriptionRequired;
  }

  return update;
};

medicineSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() || {};
    this.setUpdate(await applyPrescriptionFlagForUpdate(update, this.model.db));
    next();
  } catch (error) {
    next(error);
  }
});

medicineSchema.pre('updateOne', async function (next) {
  try {
    const update = this.getUpdate() || {};
    this.setUpdate(await applyPrescriptionFlagForUpdate(update, this.model.db));
    next();
  } catch (error) {
    next(error);
  }
});

medicineSchema.pre('updateMany', async function (next) {
  try {
    const update = this.getUpdate() || {};
    this.setUpdate(await applyPrescriptionFlagForUpdate(update, this.model.db));
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for better query performance
medicineSchema.index({ Name: 1 });
medicineSchema.index({ manufacturer: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ prescription_required: 1 });
medicineSchema.index({ active: 1 });

// Enforce one canonical medicine record; stock should vary by branch in StockInHand.
medicineSchema.index(
  {
    Name: 1,
    mgs: 1,
    dosage_form: 1,
    manufacturer: 1,
    category: 1,
  },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

const Medicine =
  mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
mongoose.models.MedicineItem || mongoose.model('MedicineItem', medicineSchema);

export default Medicine;
