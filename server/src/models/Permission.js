import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    resource: {
      type: String,
      required: true,
      // e.g., 'users', 'branches', 'doctors', 'patients', 'appointments', 'prescriptions'
    },
    action: {
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique resource-action combinations
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export default mongoose.model('Permission', permissionSchema);
