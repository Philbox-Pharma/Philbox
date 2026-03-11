import mongoose from 'mongoose';

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
    img_url: {
      type: String,
    },
    mgs: {
      type: String,
    },
    medicine_category: {
      type: String,
      enum: ['Narcotics', 'surgical'],
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manufacturer',
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
  },
  {
    timestamps: true,
    collection: 'medicineitems', // Use the same collection as MedicineItem
  }
);

// Indexes for better query performance
medicineSchema.index({ branch_id: 1 });
medicineSchema.index({ salesperson_id: 1 });
medicineSchema.index({ Name: 1 });
medicineSchema.index({ medicine_category: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
