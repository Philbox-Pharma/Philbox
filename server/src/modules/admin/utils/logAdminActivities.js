// src/utils/logAdminActivity.js
import AdminActivityLog from "../../../models/AdminActivityLog.js";
/**
 * Logs actions performed by any admin (SuperAdmin or BranchAdmin).
 *
 * @param {Object} req - Express request (for user, IP, headers)
 * @param {String} action_type - Short key describing the action ("login", "create_branch_admin", etc.)
 * @param {String} description - Human-readable description
 * @param {String} target_collection - Affected collection name ("admins", "branches", etc.)
 * @param {mongoose.Types.ObjectId} [target_id] - Affected record’s ID
 * @param {Object} [changes={}] - Optional changes (old/new)
 */

export const logAdminActivity = async (
  req,
  action_type,
  description,
  target_collection,
  target_id = null,
  changes = {}
) => {
  try {
    const user = req.user || req.admin;
    if (!user || !user._id) {
      console.warn("⚠️ Activity not logged — missing req.user");
      return;
    }

    const baseData = {
      admin_id: user._id,
      action_type,
      description,
      target_collection,
      target_id,
      changes,
      ip_address: req.ip,
      device_info: req.headers["user-agent"],
      created_at: new Date(),
    };
    
    await AdminActivityLog.create(baseData);

    console.log("✅ Activity logged successfully");


  } catch (error) {
    console.error("❌ Failed to log admin activity:", error);
  }
};
