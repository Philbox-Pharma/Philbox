import apiClient from '../client';

const notificationService = {
  // Get all notifications with pagination
  getNotifications: (params = { page: 1, limit: 10 }) => {
    return apiClient.get('/notifications', { params });
  },

  // Get unread notification count
  getUnreadCount: () => {
    // We can fetch page 1 and filter by unread, or if there's a specific endpoint.
    // The backend provides unread count implicitly if we just fetch notifications?
    // Actually, backend might not have a /count. So we'll just fetch normally or use a helper.
    return apiClient.get('/notifications', { params: { readStatus: 'unread', limit: 10 } });
  },

  // Mark notification as read
  markAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: () => {
    return apiClient.post('/notifications/mark-all-read');
  },
};

export default notificationService;
