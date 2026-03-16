import mongoose from 'mongoose';

const stockInHandSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItem',
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    alertResolved: {
      type: Boolean,
      default: false,
    },
    lastAlertSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const shouldAutoClearResolved = async (medicineId, quantity) => {
  if (!medicineId || typeof quantity !== 'number') return false;

  const MedicineModel = mongoose.models.Medicine || mongoose.model('Medicine');
  const medicine = await MedicineModel.findById(medicineId)
    .select('lowStockThreshold')
    .lean();

  const threshold = medicine?.lowStockThreshold ?? 10;
  return quantity > threshold;
};

stockInHandSchema.pre('save', async function autoClearResolvedOnSave(next) {
  try {
    if (this.isModified('quantity')) {
      const shouldClear = await shouldAutoClearResolved(
        this.medicine_id,
        this.quantity
      );
      if (shouldClear) {
        this.alertResolved = false;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const autoClearResolvedOnQueryUpdate = async function (next) {
  try {
    const update = this.getUpdate() || {};
    const quantity =
      update.quantity ?? update.$set?.quantity ?? update.$inc?.quantity;

    if (typeof quantity !== 'number') {
      return next();
    }

    const existingStock = await this.model
      .findOne(this.getFilter())
      .select('medicine_id quantity')
      .lean();

    if (!existingStock) {
      return next();
    }

    const nextQuantity =
      update.$inc?.quantity != null
        ? (existingStock.quantity || 0) + update.$inc.quantity
        : quantity;

    const shouldClear = await shouldAutoClearResolved(
      existingStock.medicine_id,
      nextQuantity
    );

    if (shouldClear) {
      if (!update.$set) update.$set = {};
      update.$set.alertResolved = false;
      this.setUpdate(update);
    }

    next();
  } catch (error) {
    next(error);
  }
};

stockInHandSchema.pre('findOneAndUpdate', autoClearResolvedOnQueryUpdate);
stockInHandSchema.pre('updateOne', autoClearResolvedOnQueryUpdate);

const StockInHand = mongoose.model('StockInHand', stockInHandSchema);

export default StockInHand;
