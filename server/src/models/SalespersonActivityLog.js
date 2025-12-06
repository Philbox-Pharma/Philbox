import mongoose from 'mongoose';

const salespersonActivityLogSchema = new mongoose.Schema({
  salesperson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salesperson',
    required: true,
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch', // Optional: Null if action isn't specific to a branch
  },
  action_type: {
    type: String,
    required: true,
    // Examples: 'login', 'logout', 'mark_task_completed', 'update_lead'
  },
  description: {
    type: String,
    required: true,
  },
  target_collection: {
    type: String,
    required: true,
    // Examples: 'salespersons', 'leads', 'tasks'
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    // The ID of the document that was changed (Lead ID, Task ID, etc.)
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Stores old/new values JSON
    default: {},
  },
  ip_address: {
    type: String,
  },
  device_info: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const SalespersonActivityLog = mongoose.model(
  'SalespersonActivityLog',
  salespersonActivityLogSchema
);

export default SalespersonActivityLog;
