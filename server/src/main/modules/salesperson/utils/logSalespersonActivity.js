import SalespersonActivityLog from '../../../models/SalespersonActivityLog.js';

/**
 * Logs actions performed by a Salesperson.
 *
 * @param {Object} req - Express request
 * @param {String} action_type - Short key ("login", "update_lead")
 * @param {String} description - Human-readable description
 * @param {String} target_collection - Affected collection
 * @param {mongoose.Types.ObjectId} [target_id] - Affected record’s ID
 * @param {Object} [changes={}] - Optional changes
 */
export const logSalespersonActivity = async (
  req,
  action_type,
  description,
  target_collection,
  target_id = null,
  changes = {}
) => {
  try {
    // Try to find the user in req (set manually in auth service or via middleware)
    const user = req.user || req.salesperson;

    if (!user || !user._id) {
      console.warn('⚠️ Activity not logged — missing req.salesperson');
      return;
    }

    const baseData = {
      salesperson_id: user._id,
      branch_id: user.branches_to_be_managed?.[0] || null, // Optional: log primary branch
      action_type,
      description,
      target_collection,
      target_id,
      changes,
      ip_address: req.ip,
      device_info: req.headers['user-agent'],
      created_at: new Date(),
    };

    await SalespersonActivityLog.create(baseData);

    console.log('✅ Salesperson activity logged successfully');
  } catch (error) {
    console.error('❌ Failed to log salesperson activity:', error);
  }
};
