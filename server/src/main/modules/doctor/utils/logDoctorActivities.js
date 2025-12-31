import DoctorActivityLog from '../../../models/DoctorActivityLog.js'; // Adjust path to your models folder

/**
 * Logs actions performed by a Doctor.
 *
 * @param {Object} req - Express request (contains req.doctor, ip, headers)
 * @param {String} action_type - Short key describing the action (e.g., "login", "create_prescription")
 * @param {String} description - Human-readable description
 * @param {String} target_collection - Affected collection name (e.g., "appointments")
 * @param {mongoose.Types.ObjectId} [target_id] - Affected record’s ID
 * @param {Object} [changes={}] - Optional data snapshot or changes
 */
export const logDoctorActivity = async (
  req,
  action_type,
  description,
  target_collection,
  target_id = null,
  changes = {}
) => {
  try {
    // Ensure we have a doctor attached to the request (from auth middleware)
    const doctor = req.doctor;

    if (!doctor || !doctor._id) {
      console.warn('⚠️ Doctor Activity not logged — missing req.doctor');
      return;
    }

    const logData = {
      doctor_id: doctor._id,
      action_type,
      description,
      target_collection,
      target_id,
      changes,
      ip_address: req.ip || req.connection.remoteAddress,
      device_info: req.headers['user-agent'] || 'unknown',
    };

    // Save to Database
    await DoctorActivityLog.create(logData);

    // Optional: console log for dev environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Doctor Activity Logged: ${action_type}`);
    }
  } catch (error) {
    console.error('❌ Failed to log doctor activity:', error);
    // We do not throw the error here to prevent crashing the main request flow
  }
};
