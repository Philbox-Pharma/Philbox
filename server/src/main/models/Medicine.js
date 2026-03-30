import mongoose from 'mongoose';

const isPrescriptionRequiredForCategory = category =>
  String(category || '')
    .trim()
    .toLowerCase() === 'narcotics';

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
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
      required: true,
    },
    img_urls: {
      type: [String],
      default: [],
    },
    mgs: {
      type: String,
    },
    medicine_category: {
      type: String,
      trim: true,
      default: null,
    },
    prescription_required: {
      type: Boolean,
      default: function () {
        return isPrescriptionRequiredForCategory(this.medicine_category);
      },
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
    pack_unit: {
      type: Number,
      default: 1,
    },
    sales_discount: {
      type: Number,
      default: 0,
    },
    is_available: {
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

medicineSchema.pre('validate', function (next) {
  this.prescription_required = isPrescriptionRequiredForCategory(
    this.medicine_category
  );
  next();
});

const applyPrescriptionFlagForUpdate = update => {
  if (!update || Array.isArray(update)) return update;

  const setPayload = update.$set || update;
  if (!Object.prototype.hasOwnProperty.call(setPayload, 'medicine_category')) {
    return update;
  }

  const prescriptionRequired = isPrescriptionRequiredForCategory(
    setPayload.medicine_category
  );

  if (update.$set) {
    update.$set.prescription_required = prescriptionRequired;
  } else {
    update.prescription_required = prescriptionRequired;
  }

  return update;
};

medicineSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  this.setUpdate(applyPrescriptionFlagForUpdate(update));
  next();
});

medicineSchema.pre('updateOne', function (next) {
  const update = this.getUpdate() || {};
  this.setUpdate(applyPrescriptionFlagForUpdate(update));
  next();
});

medicineSchema.pre('updateMany', function (next) {
  const update = this.getUpdate() || {};
  this.setUpdate(applyPrescriptionFlagForUpdate(update));
  next();
});

// Indexes for better query performance
medicineSchema.index({ branch_id: 1 });
medicineSchema.index({ salesperson_id: 1 });
medicineSchema.index({ Name: 1 });
medicineSchema.index({ medicine_category: 1 });
medicineSchema.index({ prescription_required: 1 });

const Medicine =
  mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
mongoose.models.MedicineItem || mongoose.model('MedicineItem', medicineSchema);

export default Medicine;
