import CustomerActivityLog from '../../../models/CustomerActivityLog.js'; // Adjust path to your models folder

/**
 * Logs actions performed by a Customer.
 *
 * @param {Object} req - Express request (contains req.customer, ip, headers)
 * @param {String} action_type - Short key describing the action (e.g., "login", "update_profile", "place_order")
 * @param {String} description - Human-readable description
 * @param {String} target_collection - Affected collection name (e.g., "orders", "addresses")
 * @param {mongoose.Types.ObjectId} [target_id] - Affected record’s ID
 * @param {Object} [changes={}] - Optional data snapshot or changes
 */
export const logCustomerActivity = async (
  req,
  action_type,
  description,
  target_collection,
  target_id = null,
  changes = {}
) => {
  try {
    const customerId =
      req.customer?._id ||
      req.customer?.id ||
      req.user?._id ||
      req.user?.id ||
      req.session?.customerId ||
      null;

    if (!customerId) {
      // Public endpoints can call shared services without an authenticated customer.
      // Silently skip activity logging in those cases.
      return;
    }

    const logData = {
      customer_id: customerId,
      action_type,
      description,
      target_collection,
      target_id,
      changes,
      ip_address: req.ip || req.connection.remoteAddress,
      device_info: req.headers['user-agent'] || 'unknown',
    };

    // Save to Database
    await CustomerActivityLog.create(logData);

    // Optional: console log for dev environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Customer Activity Logged: ${action_type}`);
    }
  } catch (error) {
    console.error('❌ Failed to log customer activity:', error);
    // We do not throw the error here to prevent crashing the main request flow
  }
};
