import mongoose from 'mongoose';

const salespersonTaskSchema = new mongoose.Schema(
  {
    // 1. Who assigned the task
    assigned_by_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    assigned_by_role: {
      type: String,
      enum: ['super-admin', 'branch-admin'],
      required: true,
    },

    // 2. Who received the task
    salesperson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salesperson',
      required: true,
    },

    // 3. Branch context (for validation + filtering)
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },

    // 4. Task details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    deadline: {
      type: Date,
      required: true,
    },

    // 5. Status tracking
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },

    // 6. Communication / progress updates
    updates: [
      {
        updated_by: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'salesperson'],
          required: true,
        },
        message: {
          type: String,
          trim: true,
        },
        updated_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for better query performance
salespersonTaskSchema.index({ salesperson_id: 1, status: 1 });
salespersonTaskSchema.index({ branch_id: 1, status: 1 });
salespersonTaskSchema.index({ assigned_by_admin_id: 1 });
salespersonTaskSchema.index({ deadline: 1, status: 1 });

const SalespersonTask = mongoose.model(
  'SalespersonTask',
  salespersonTaskSchema
);

export default SalespersonTask;
