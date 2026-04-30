import notificationService from '../../../../utils/notificationService.js';
import sendResponse from '../../../../utils/sendResponse.js';
import DeviceToken from '../../../../models/DeviceToken.js';
import NotificationPreference from '../../../../models/NotificationPreference.js';
import NotificationLog from '../../../../models/NotificationLog.js';
import {
  registerDeviceTokenSchema,
  updateNotificationPreferencesSchema,
  sendTestNotificationSchema,
} from '../../../../dto/notifications/notifications.dto.js';

/**
 * Helper function to extract user ID and role from request
 */
const getUserInfo = req => {
  let userId = null;
  let userRole = null;
  let userName = 'User';
  let userEmail = null;
  let userPhone = null;

  // Check customer
  if (req.customer) {
    userId = req.customer._id || req.customer.id;
    userRole = 'customer';
    userName = req.customer.fullName || 'Customer';
    userEmail = req.customer.email;
  }
  // Check doctor
  else if (req.doctor) {
    userId = req.doctor._id || req.doctor.id;
    userRole = 'doctor';
    userName = req.doctor.fullName || 'Doctor';
    userEmail = req.doctor.email;
  }
  // Check salesperson
  else if (req.salesperson) {
    userId = req.salesperson._id || req.salesperson.id;
    userRole = 'salesperson';
    userName = req.salesperson.fullName || 'Salesperson';
    userEmail = req.salesperson.email;
  }
  // Check admin
  else if (req.admin) {
    userId = req.admin._id || req.admin.id;
    userRole = 'admin';
    userName = req.admin.fullName || 'Admin';
    userEmail = req.admin.email;
  }
  // Fallback to session or user object
  else if (req.session?.customerId) {
    userId = req.session.customerId;
    userRole = 'customer';
    userName = req.session.customerName || 'Customer';
  } else if (req.session?.doctorId) {
    userId = req.session.doctorId;
    userRole = 'doctor';
    userName = req.session.doctorName || 'Doctor';
  } else if (req.session?.salespersonId) {
    userId = req.session.salespersonId;
    userRole = 'salesperson';
    userName = req.session.salespersonName || 'Salesperson';
  } else if (req.session?.adminId) {
    userId = req.session.adminId;
    userRole = 'admin';
    userName = req.session.adminName || 'Admin';
  } else if (req.session?.userId) {
    userId = req.session.userId;
    userRole = req.session.userRole;
    userName = req.session.userName || 'User';
  } else if (req.user) {
    userId = req.user.id || req.user._id;
    userRole = req.user.role;
    userName = req.user.name || 'User';
  }

  return { userId, userRole, userName, userEmail, userPhone };
};

/**
 * @desc    Register a device token for push notifications
 * @route   POST /api/notifications/device-tokens/register
 * @access  Private
 */
export const registerDeviceToken = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized - User not found');
    }

    // Validate request body
    const requestBody = req.body || {};
    const { error, value } = registerDeviceTokenSchema.validate(requestBody);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    // Check if token already exists for this user
    const existingToken = await DeviceToken.findOne({
      user_id: userId,
      user_type: userRole,
      token: value.deviceToken,
    });

    if (existingToken) {
      // Update last used timestamp
      existingToken.last_used_at = new Date();
      existingToken.is_active = true;
      existingToken.device_type = value.deviceType;
      if (value.deviceName !== undefined) {
        existingToken.device_name = value.deviceName;
      }
      await existingToken.save();
      return sendResponse(
        res,
        200,
        'Device token already registered',
        existingToken
      );
    }

    // Create new device token
    const deviceToken = new DeviceToken({
      user_id: userId,
      user_type: userRole,
      token: value.deviceToken,
      device_type: value.deviceType,
      device_name: value.deviceName,
      is_active: true,
      user_agent: req.headers['user-agent'] || 'unknown',
    });

    await deviceToken.save();

    return sendResponse(
      res,
      201,
      'Device token registered successfully',
      deviceToken
    );
  } catch (error) {
    console.error('Error registering device token:', error);
    return sendResponse(res, 500, 'Error registering device token');
  }
};

/**
 * @desc    Unregister a device token
 * @route   DELETE /api/notifications/device-tokens/:tokenId
 * @access  Private
 */
export const unregisterDeviceToken = async (req, res) => {
  try {
    const { userId } = getUserInfo(req);

    if (!userId) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const { tokenId } = req.params;

    const deviceToken = await DeviceToken.findOneAndDelete({
      _id: tokenId,
      user_id: userId,
    });

    if (!deviceToken) {
      return sendResponse(res, 404, 'Device token not found');
    }

    return sendResponse(res, 200, 'Device token unregistered successfully');
  } catch (error) {
    console.error('Error unregistering device token:', error);
    return sendResponse(res, 500, 'Error unregistering device token');
  }
};

/**
 * @desc    Get notification preferences for user
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    let preferences = await NotificationPreference.findOne({
      userId,
      userRole,
    });

    // Return default preferences if not found
    if (!preferences) {
      preferences = {
        userId,
        userRole,
        email: true,
        sms: true,
        push: true,
        refill_reminder: true,
        appointment_reminder: true,
        order_status: true,
        message_notifications: true,
        task_notifications: true,
        low_stock_alerts: true,
      };
    }

    return sendResponse(
      res,
      200,
      'Notification preferences retrieved successfully',
      preferences
    );
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return sendResponse(res, 500, 'Error retrieving notification preferences');
  }
};

/**
 * @desc    Update notification preferences for user
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = updateNotificationPreferencesSchema.validate(
      req.body
    );
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    // Create or update preferences
    let preferences = await NotificationPreference.findOneAndUpdate(
      { userId, userRole },
      {
        userId,
        userRole,
        ...value,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return sendResponse(
      res,
      200,
      'Notification preferences updated successfully',
      preferences
    );
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return sendResponse(res, 500, 'Error updating notification preferences');
  }
};

/**
 * @desc    Send a test notification to user
 * @route   POST /api/notifications/test
 * @access  Private
 */
export const sendTestNotification = async (req, res) => {
  try {
    const { userId, userRole, userName, userEmail } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    // Validate request body
    const { error, value } = sendTestNotificationSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message);
    }

    // Determine the actual recipient
    let recipient = value.recipient;
    if (value.method === 'email' && !recipient) {
      recipient = userEmail;
    } else if (value.method === 'push' && !recipient) {
      recipient = userId;
    }

    if (!recipient) {
      return sendResponse(
        res,
        400,
        `No recipient provided and no ${value.method} available for user`
      );
    }

    // Send test notification
    const result = await notificationService.sendTestNotification(
      value.method,
      recipient,
      userName
    );

    if (!result.success) {
      return sendResponse(
        res,
        400,
        result.error || 'Failed to send test notification'
      );
    }

    // Log the test notification
    await notificationService.logNotification(
      userId,
      userRole,
      'test_notification',
      'Test Notification',
      `Test ${value.method} notification sent to ${recipient}`,
      { method: value.method, recipient },
      [value.method],
      'sent'
    );

    return sendResponse(res, 200, 'Test notification sent successfully', {
      method: value.method,
      recipient,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return sendResponse(res, 500, 'Error sending test notification');
  }
};

/**
 * @desc    Get all device tokens for user
 * @route   GET /api/notifications/device-tokens
 * @access  Private
 */
export const getDeviceTokens = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const tokens = await DeviceToken.find({
      user_id: userId,
      user_type: userRole,
      is_active: true,
    }).select('-__v');

    return sendResponse(
      res,
      200,
      'Device tokens retrieved successfully',
      tokens
    );
  } catch (error) {
    console.error('Error getting device tokens:', error);
    return sendResponse(res, 500, 'Error retrieving device tokens');
  }
};

/**
 * @desc    Get all notifications for authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const {
      page = 1,
      limit = 10,
      type = null,
      readStatus = null,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      user_id: userId,
      user_type: userRole,
    };

    if (type) {
      query.notification_type = type;
    }

    if (readStatus === 'read') {
      query.read_at = { $ne: null };
    } else if (readStatus === 'unread') {
      query.read_at = null;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [notifications, total] = await Promise.all([
      NotificationLog.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      NotificationLog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const unreadCount = await NotificationLog.countDocuments({
      ...query,
      read_at: null,
    });

    return sendResponse(res, 200, 'Notifications retrieved successfully', {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return sendResponse(res, 500, 'Error retrieving notifications');
  }
};

/**
 * @desc    Get single notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
export const getNotification = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);
    const { id } = req.params;

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const notification = await NotificationLog.findOne({
      _id: id,
      user_id: userId,
      user_type: userRole,
    });

    if (!notification) {
      return sendResponse(res, 404, 'Notification not found');
    }

    return sendResponse(
      res,
      200,
      'Notification retrieved successfully',
      notification
    );
  } catch (error) {
    console.error('Error getting notification:', error);
    return sendResponse(res, 500, 'Error retrieving notification');
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);
    const { id } = req.params;

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const notification = await NotificationLog.findOneAndUpdate(
      {
        _id: id,
        user_id: userId,
        user_type: userRole,
      },
      {
        read_at: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return sendResponse(res, 404, 'Notification not found');
    }

    return sendResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return sendResponse(res, 500, 'Error marking notification as read');
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/notifications/mark-all-read
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await NotificationLog.updateMany(
      {
        user_id: userId,
        user_type: userRole,
        read_at: null,
      },
      {
        read_at: new Date(),
      }
    );

    return sendResponse(res, 200, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return sendResponse(res, 500, 'Error marking notifications as read');
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);
    const { id } = req.params;

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await NotificationLog.findOneAndDelete({
      _id: id,
      user_id: userId,
      user_type: userRole,
    });

    if (!result) {
      return sendResponse(res, 404, 'Notification not found');
    }

    return sendResponse(res, 200, 'Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return sendResponse(res, 500, 'Error deleting notification');
  }
};

/**
 * @desc    Delete all notifications for user
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId, userRole } = getUserInfo(req);

    if (!userId || !userRole) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const result = await NotificationLog.deleteMany({
      user_id: userId,
      user_type: userRole,
    });

    return sendResponse(res, 200, 'All notifications deleted successfully', {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return sendResponse(res, 500, 'Error deleting notifications');
  }
};
