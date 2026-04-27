import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema(
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
  }
);

// Indexes for better query performance
medicineItemSchema.index({ branch_id: 1 });
medicineItemSchema.index({ salesperson_id: 1 });
medicineItemSchema.index({ Name: 1 });
medicineItemSchema.index({ medicine_category: 1 });

const MedicineItem = mongoose.model('MedicineItem', medicineItemSchema);

export default MedicineItem;
